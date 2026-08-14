import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env.js";
import { query } from "../../config/database.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";

export const authRouter = Router();
const credentials = z.object({ body: z.object({ email: z.email(), password: z.string().min(8) }), params: z.object({}), query: z.object({}) });
const registration = z.object({ body: z.object({ businessName: z.string().min(2).max(160), contactName: z.string().min(2).max(120), email: z.email(), password: z.string().min(8), phone: z.string().min(7).max(32) }), params: z.object({}), query: z.object({}) });

authRouter.post("/register", validate(registration), asyncHandler(async (request, response) => {
  const { businessName, contactName, email, password, phone } = request.validated.body;
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const result = await query(`INSERT INTO partners (business_name, contact_name, email, password_hash, phone)
      VALUES ($1,$2,LOWER($3),$4,$5) RETURNING id,business_name,contact_name,email,phone,status`, [businessName, contactName, email, passwordHash, phone]);
    response.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") throw new HttpError(409, "Email already registered");
    throw error;
  }
}));

authRouter.post("/login", validate(credentials), asyncHandler(async (request, response) => {
  const { email, password } = request.validated.body;
  const result = await query("SELECT * FROM partners WHERE email=LOWER($1)", [email]);
  const partner = result.rows[0];
  if (!partner || !(await bcrypt.compare(password, partner.password_hash))) throw new HttpError(401, "Invalid email or password");
  if (partner.status !== "ACTIVE") throw new HttpError(403, "Partner account is not active");
  const token = jwt.sign({ sub: partner.id, email: partner.email, type: "partner" }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  response.json({ success: true, data: { token, partner: publicPartner(partner) } });
}));

authRouter.get("/me", authenticate, asyncHandler(async (request, response) => {
  const result = await query("SELECT * FROM partners WHERE id=$1", [request.auth.sub]);
  if (!result.rows[0]) throw new HttpError(404, "Partner not found");
  response.json({ success: true, data: publicPartner(result.rows[0]) });
}));

function publicPartner(partner) {
  const { password_hash: _password, ...safe } = partner;
  return safe;
}
