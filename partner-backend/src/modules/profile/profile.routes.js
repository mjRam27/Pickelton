import { Router } from "express";
import { z } from "zod";
import { query } from "../../config/database.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";

export const profileRouter = Router();
const safeProfileFields = `id,business_name,contact_name,email,phone,address,city,state,
  postal_code,website,status,created_at,updated_at`;
const optionalText = (maximum) => z.string().trim().max(maximum).optional();
const profileUpdate = z.object({
  body: z.object({
    businessName: z.string().trim().min(2).max(160).optional(),
    contactName: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().min(7).max(32).optional(),
    address: optionalText(1000),
    city: optionalText(100),
    state: optionalText(100),
    postalCode: optionalText(32),
    website: z.union([z.literal(""), z.url().max(500)]).optional(),
  }).strict().refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field is required",
  }),
  params: z.object({}),
  query: z.object({}),
});

profileRouter.get("/", asyncHandler(async (request, response) => {
  const result = await query(`SELECT ${safeProfileFields} FROM partners WHERE id=$1`, [request.auth.sub]);
  if (!result.rows[0]) throw new HttpError(404, "Partner profile not found");
  response.json({ success: true, data: result.rows[0] });
}));

profileRouter.patch("/", validate(profileUpdate), asyncHandler(async (request, response) => {
  const profile = request.validated.body;
  const result = await query(`UPDATE partners SET
      business_name=COALESCE($1,business_name), contact_name=COALESCE($2,contact_name),
      phone=COALESCE($3,phone),
      address=CASE WHEN $4::text IS NULL THEN address ELSE NULLIF($4,'') END,
      city=CASE WHEN $5::text IS NULL THEN city ELSE NULLIF($5,'') END,
      state=CASE WHEN $6::text IS NULL THEN state ELSE NULLIF($6,'') END,
      postal_code=CASE WHEN $7::text IS NULL THEN postal_code ELSE NULLIF($7,'') END,
      website=CASE WHEN $8::text IS NULL THEN website ELSE NULLIF($8,'') END,
      updated_at=NOW()
    WHERE id=$9 RETURNING ${safeProfileFields}`,
  [profile.businessName??null, profile.contactName??null, profile.phone??null,
    profile.address??null, profile.city??null, profile.state??null,
    profile.postalCode??null, profile.website??null, request.auth.sub]);
  if (!result.rows[0]) throw new HttpError(404, "Partner profile not found");
  response.json({ success: true, message: "Profile updated successfully", data: result.rows[0] });
}));
