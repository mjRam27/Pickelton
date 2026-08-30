import { Router } from "express";
import { z } from "zod";
import { query } from "../../config/database.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import { pagination, pageResult } from "../../utils/pagination.js";

export const courtsRouter = Router();

const idParams = z.object({
  body: z.any(),
  params: z.object({
    id: z.uuid()
  }),
  query: z.any()
});

const courtBody = z.object({
  name: z.string().min(2).max(120),
  sport: z.enum(["PICKLEBALL", "BADMINTON", "MULTI_SPORT"]),
  surface: z.string().max(80).optional(),
  indoor: z.boolean().default(false),
  membershipEnabled: z.boolean().default(false),
  hourlyRate: z.number().nonnegative(),
  description: z.string().max(1000).optional(),
  status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]).default("ACTIVE")
});

/* GET ALL courts*/
courtsRouter.get(
  "/",
  asyncHandler(async (request, response) => {
    const { page, size, offset } = pagination(request.query);
    const search = `%${request.query.search ?? ""}%`;

    const [items, count] = await Promise.all([
      query(
        `SELECT *
         FROM courts
         WHERE partner_id = $1
         AND name ILIKE $2
         ORDER BY created_at DESC
         LIMIT $3 OFFSET $4`,
        [request.auth.sub, search, size, offset]
      ),

      query(
        `SELECT COUNT(*)
         FROM courts
         WHERE partner_id = $1
         AND name ILIKE $2`,
        [request.auth.sub, search]
      )
    ]);

    response.json({
      success: true,
      data: pageResult(
        items.rows,
        count.rows[0].count,
        page,
        size
      )
    });
  })
);

/* CREATE courts */
courtsRouter.post(
  "/",
  validate(
    z.object({
      body: courtBody,
      params: z.object({}),
      query: z.object({})
    })
  ),
  asyncHandler(async (request, response) => {
    const c = request.validated.body;

    const result = await query(
      `INSERT INTO courts
       (
         partner_id,
         name,
         sport,
         surface,
         indoor,
         membership_enabled,
         hourly_rate,
         description,
         status
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        request.auth.sub,
        c.name,
        c.sport,
        c.surface ?? null,
        c.indoor,
        c.membershipEnabled,
        c.hourlyRate,
        c.description ?? null,
        c.status
      ]
    );
    response.status(201).json({
      success: true,
      data: result.rows[0]
    });
  })
);

/* GET ONE courts */
courtsRouter.get(
  "/:id",
  validate(idParams),
  asyncHandler(async (request, response) => {
    const result = await query(
      `SELECT *
       FROM courts
       WHERE id = $1
       AND partner_id = $2`,
      [
        request.params.id,
        request.auth.sub
      ]
    );

    if (!result.rows[0]) {
      throw new HttpError(404, "courts not found");
    }

    response.json({
      success: true,
      data: result.rows[0]
    });
  })
);

/* UPDATE courts */
courtsRouter.patch(
  "/:id",
  validate(
    z.object({
      body: courtBody.partial(),
      params: z.object({
        id: z.uuid()
      }),
      query: z.object({})
    })
  ),
  asyncHandler(async (request, response) => {
    const current = await query(
      `SELECT *
       FROM courts
       WHERE id = $1
       AND partner_id = $2`,
      [
        request.params.id,
        request.auth.sub
      ]
    );

    if (!current.rows[0]) {
      throw new HttpError(404, "courts not found");
    }

    const old = current.rows[0];
    const c = request.validated.body;

    const result = await query(
      `UPDATE courts
       SET
         name = $1,
         sport = $2,
         surface = $3,
         indoor = $4,
         membership_enabled = $5,
         hourly_rate = $6,
         description = $7,
         status = $8,
         updated_at = NOW()
       WHERE id = $9
       AND partner_id = $10
       RETURNING *`,
      [
        c.name ?? old.name,
        c.sport ?? old.sport,
        c.surface ?? old.surface,
        c.indoor ?? old.indoor,
        c.membershipEnabled ?? old.membership_enabled,
        c.hourlyRate ?? old.hourly_rate,
        c.description ?? old.description,
        c.status ?? old.status,
        request.params.id,
        request.auth.sub
      ]
    );

    response.json({
      success: true,
      data: result.rows[0]
    });
  })
);

/* DELETE courts */
courtsRouter.delete(
  "/:id",
  validate(idParams),
  asyncHandler(async (request, response) => {
    const result = await query(
      `DELETE FROM courts
       WHERE id = $1
       AND partner_id = $2
       RETURNING id`,
      [
        request.params.id,
        request.auth.sub
      ]
    );

    if (!result.rows[0]) {
      throw new HttpError(404, "courts not found");
    }

    response.status(204).end();
  })
);
