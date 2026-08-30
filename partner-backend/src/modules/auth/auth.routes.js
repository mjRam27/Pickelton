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

/* =========================================================
   VALIDATION
========================================================= */

const credentials = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  params: z.object({}),
  query: z.object({}),
});

const registration = z.object({
  body: z.object({
    businessName: z.string().min(2).max(160),
    contactName: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().min(7).max(32),
  }),
  params: z.object({}),
  query: z.object({}),
});

const passwordReset = z.object({
  body: z.object({ password: z.string().min(8) }),
  params: z.object({}),
  query: z.object({}),
});

async function getSupabaseUser(request) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new HttpError(503, "Supabase authentication is not configured on the partner server");
  }
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) throw new HttpError(401, "Supabase session is required");
  const result = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { authorization, apikey: env.SUPABASE_ANON_KEY },
  });
  if (!result.ok) throw new HttpError(401, "Supabase session is invalid or expired");
  return result.json();
}

async function partnerForSupabaseUser(request) {
  const user = await getSupabaseUser(request);
  if (!user.email) throw new HttpError(401, "The Google account does not provide an email address");
  const result = await query(
    `SELECT id, business_name, contact_name, email, phone, status, created_at, updated_at
     FROM partners WHERE email = LOWER($1) LIMIT 1`,
    [user.email.trim()],
  );
  if (!result.rows[0]) throw new HttpError(403, "No partner account is associated with this email address");
  if (result.rows[0].status !== "ACTIVE") throw new HttpError(403, "Partner account is not active");
  return result.rows[0];
}

async function provisionEmailPartner(request) {
  const user = await getSupabaseUser(request);
  if (!user.email || !user.email_confirmed_at) {
    throw new HttpError(403, "Verify your email address before signing in");
  }
  const provider = user.app_metadata?.provider;
  if (provider !== "email") throw new HttpError(403, "Email/password authentication is required");
  const fullName = String(user.user_metadata?.full_name || "").trim();
  if (!fullName) throw new HttpError(422, "Full name is missing from the Supabase account");
  const result = await query(
    `INSERT INTO partners (business_name, contact_name, email, password_hash, phone)
     VALUES ($1, $1, LOWER($2), NULL, '')
     ON CONFLICT (email) DO UPDATE SET contact_name = COALESCE(NULLIF(partners.contact_name, ''), EXCLUDED.contact_name)
     RETURNING id, business_name, contact_name, email, phone, status, created_at, updated_at`,
    [fullName, user.email.trim()],
  );
  const partner = result.rows[0];
  if (partner.status !== "ACTIVE") throw new HttpError(403, "Partner account is not active");
  return partner;
}

function createPartnerToken(partner) {
  return jwt.sign({ sub: partner.id, email: partner.email, type: "partner" }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || "7d",
  });
}

authRouter.post("/oauth/exchange", asyncHandler(async (request, response) => {
  const partner = await partnerForSupabaseUser(request);
  response.json({ success: true, data: { token: createPartnerToken(partner), partner: publicPartner(partner) } });
}));

authRouter.post("/supabase/exchange", asyncHandler(async (request, response) => {
  const partner = await provisionEmailPartner(request);
  response.json({ success: true, data: { token: createPartnerToken(partner), partner: publicPartner(partner) } });
}));

authRouter.post("/reset-password", validate(passwordReset), asyncHandler(async (request, response) => {
  const partner = await partnerForSupabaseUser(request);
  const passwordHash = await bcrypt.hash(request.validated.body.password, 12);
  await query("UPDATE partners SET password_hash = $1, updated_at = NOW() WHERE id = $2", [passwordHash, partner.id]);
  response.json({ success: true, message: "Password updated successfully" });
}));


/* =========================================================
   REGISTER
   POST /api/v1/auth/register
========================================================= */

authRouter.post(
  "/register",
  validate(registration),
  asyncHandler(async (request, response) => {
    const {
      businessName,
      contactName,
      email,
      password,
      phone,
    } = request.validated.body;

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    try {
      const result = await query(
        `INSERT INTO partners
          (
            business_name,
            contact_name,
            email,
            password_hash,
            phone
          )
         VALUES
          (
            $1,
            $2,
            LOWER($3),
            $4,
            $5
          )
         RETURNING
          id,
          business_name,
          contact_name,
          email,
          phone,
          status`,
        [
          businessName.trim(),
          contactName.trim(),
          email.trim(),
          passwordHash,
          phone.trim(),
        ]
      );

      response.status(201).json({
        success: true,
        message: "Registration successful",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("=================================");
      console.error("REGISTER ERROR");
      console.error("message:", error.message);
      console.error("code:", error.code);
      console.error("detail:", error.detail);
      console.error("constraint:", error.constraint);
      console.error("=================================");

      if (error.code === "23505") {
        throw new HttpError(
          409,
          "Email already registered"
        );
      }

      throw new HttpError(
        500,
        "Registration failed"
      );
    }
  })
);


/* =========================================================
   LOGIN
   POST /api/v1/auth/login
========================================================= */

authRouter.post(
  "/login",
  validate(credentials),
  asyncHandler(async (request, response) => {
    const {
      email,
      password,
    } = request.validated.body;

    console.log("---------------------------------");
    console.log("LOGIN REQUEST");
    console.log("Email:", email);
    console.log("---------------------------------");

    try {
      /* -----------------------------------------
         FIND PARTNER
      ----------------------------------------- */

      const result = await query(
        `SELECT
          id,
          business_name,
          contact_name,
          email,
          password_hash,
          phone,
          status,
          created_at,
          updated_at
         FROM partners
         WHERE email = LOWER($1)
         LIMIT 1`,
        [email.trim()]
      );

      const partner = result.rows[0];

      console.log(
        "Partner found:",
        partner ? "YES" : "NO"
      );

      /* -----------------------------------------
         INVALID LOGIN
      ----------------------------------------- */

      if (!partner) {
        throw new HttpError(
          401,
          "Invalid email or password"
        );
      }

      /* -----------------------------------------
         PASSWORD CHECK
      ----------------------------------------- */

      if (!partner.password_hash) {
        console.error(
          "Partner has no password_hash"
        );

        throw new HttpError(
          500,
          "Account password is not configured"
        );
      }

      const passwordMatches =
        await bcrypt.compare(
          password,
          partner.password_hash
        );

      console.log(
        "Password valid:",
        passwordMatches ? "YES" : "NO"
      );

      if (!passwordMatches) {
        throw new HttpError(
          401,
          "Invalid email or password"
        );
      }

      /* -----------------------------------------
         ACCOUNT STATUS
      ----------------------------------------- */

      console.log(
        "Partner status:",
        partner.status
      );

      if (partner.status !== "ACTIVE") {
        throw new HttpError(
          403,
          "Partner account is not active"
        );
      }

      /* -----------------------------------------
         JWT SECRET CHECK
      ----------------------------------------- */

      if (!env.JWT_SECRET) {
        console.error(
          "JWT_SECRET is missing from environment"
        );

        throw new HttpError(
          500,
          "Server authentication configuration is missing"
        );
      }

      /* -----------------------------------------
         CREATE TOKEN
      ----------------------------------------- */

      const token = jwt.sign(
        {
          sub: partner.id,
          email: partner.email,
          type: "partner",
        },
        env.JWT_SECRET,
        {
          expiresIn:
            env.JWT_EXPIRES_IN || "7d",
        }
      );

      console.log("JWT created successfully");
      console.log("---------------------------------");

      /* -----------------------------------------
         RESPONSE
      ----------------------------------------- */

      response.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          partner: publicPartner(partner),
        },
      });

    } catch (error) {

      console.error("=================================");
      console.error("LOGIN ERROR");
      console.error("message:", error.message);
      console.error("code:", error.code);
      console.error("detail:", error.detail);
      console.error("stack:", error.stack);
      console.error("=================================");

      /* Keep our intentional HTTP errors */
      if (error instanceof HttpError) {
        throw error;
      }

      /* PostgreSQL errors */
      if (error.code === "42P01") {
        throw new HttpError(
          500,
          "Partners table was not found in the database"
        );
      }

      if (error.code === "42703") {
        throw new HttpError(
          500,
          "A required column is missing from the partners table"
        );
      }

      /* Everything else */
      throw new HttpError(
        500,
        error.message ||
          "Login failed due to a server error"
      );
    }
  })
);


/* =========================================================
   CURRENT PARTNER
   GET /api/v1/auth/me
========================================================= */

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (request, response) => {

    const result = await query(
      `SELECT
        id,
        business_name,
        contact_name,
        email,
        phone,
        status,
        created_at,
        updated_at
       FROM partners
       WHERE id = $1`,
      [request.auth.sub]
    );

    if (!result.rows[0]) {
      throw new HttpError(
        404,
        "Partner not found"
      );
    }

    response.json({
      success: true,
      data: publicPartner(result.rows[0]),
    });
  })
);


/* =========================================================
   PUBLIC PARTNER DATA
========================================================= */

function publicPartner(partner) {
  const {
    password_hash,
    ...safePartner
  } = partner;

  return safePartner;
}
