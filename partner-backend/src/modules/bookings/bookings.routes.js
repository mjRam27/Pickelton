import { Router } from "express";
import { z } from "zod";
import { query, transaction } from "../../config/database.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import { pagination, pageResult } from "../../utils/pagination.js";

export const bookingsRouter = Router();
const createBody = z.object({ courtId: z.uuid(), customer: z.object({ name: z.string().min(2), email: z.email(), phone: z.string().min(7) }), startsAt: z.iso.datetime(), endsAt: z.iso.datetime(), notes: z.string().max(1000).optional() });

bookingsRouter.get("/", asyncHandler(async (request, response) => {
  const { page, size, offset } = pagination(request.query);
  const status = request.query.status || null;
  const search = `%${request.query.search ?? ""}%`;
  const base = ` FROM bookings b JOIN courts c ON c.id=b.court_id JOIN customers u ON u.id=b.customer_id
    WHERE b.partner_id=$1 AND ($2::text IS NULL OR b.status=$2) AND (u.name ILIKE $3 OR u.email ILIKE $3 OR b.reference ILIKE $3)`;
  const [items, count] = await Promise.all([
    query(`SELECT b.*,c.name court_name,u.name customer_name,u.email customer_email,u.phone customer_phone${base} ORDER BY b.starts_at DESC LIMIT $4 OFFSET $5`, [request.auth.sub,status,search,size,offset]),
    query(`SELECT COUNT(*)${base}`, [request.auth.sub,status,search])
  ]);
  response.json({ success: true, data: pageResult(items.rows, count.rows[0].count, page, size) });
}));

bookingsRouter.post("/", validate(z.object({ body: createBody, params: z.object({}), query: z.object({}) })), asyncHandler(async (request, response) => {
  const input = request.validated.body;
  if (new Date(input.endsAt) <= new Date(input.startsAt)) throw new HttpError(400, "End time must be after start time");
  const booking = await transaction(async (client) => {
    const court = await client.query("SELECT * FROM courts WHERE id=$1 AND partner_id=$2 AND status='ACTIVE'", [input.courtId, request.auth.sub]);
    if (!court.rows[0]) throw new HttpError(404, "Active court not found");
    const conflict = await client.query("SELECT 1 FROM bookings WHERE court_id=$1 AND status NOT IN ('CANCELLED','REJECTED') AND starts_at<$3 AND ends_at>$2", [input.courtId,input.startsAt,input.endsAt]);
    if (conflict.rowCount) throw new HttpError(409, "Court is already booked for this time");
    const customer = await client.query(`INSERT INTO customers (partner_id,name,email,phone) VALUES ($1,$2,LOWER($3),$4)
      ON CONFLICT (partner_id,email) DO UPDATE SET name=EXCLUDED.name,phone=EXCLUDED.phone,updated_at=NOW() RETURNING *`, [request.auth.sub,input.customer.name,input.customer.email,input.customer.phone]);
    const hours = (new Date(input.endsAt)-new Date(input.startsAt))/3_600_000;
    const total = Number(court.rows[0].hourly_rate)*hours;
    const result = await client.query(`INSERT INTO bookings (partner_id,court_id,customer_id,reference,starts_at,ends_at,total_amount,notes)
      VALUES ($1,$2,$3,'PB-'||UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text,'-',''),1,8)),$4,$5,$6,$7) RETURNING *`, [request.auth.sub,input.courtId,customer.rows[0].id,input.startsAt,input.endsAt,total,input.notes ?? null]);
    return result.rows[0];
  });
  response.status(201).json({ success: true, data: booking });
}));

bookingsRouter.get("/:id", asyncHandler(async (request, response) => {
  const result = await query(`SELECT b.*,c.name court_name,u.name customer_name,u.email customer_email,u.phone customer_phone FROM bookings b
    JOIN courts c ON c.id=b.court_id JOIN customers u ON u.id=b.customer_id WHERE b.id=$1 AND b.partner_id=$2`, [request.params.id,request.auth.sub]);
  if (!result.rows[0]) throw new HttpError(404, "Booking not found");
  response.json({ success: true, data: result.rows[0] });
}));

bookingsRouter.patch("/:id/status", validate(z.object({ body: z.object({ status: z.enum(["PENDING","CONFIRMED","COMPLETED","CANCELLED","REJECTED"]) }), params: z.object({ id: z.uuid() }), query: z.object({}) })), asyncHandler(async (request, response) => {
  const result = await query("UPDATE bookings SET status=$1,updated_at=NOW() WHERE id=$2 AND partner_id=$3 RETURNING *", [request.validated.body.status,request.params.id,request.auth.sub]);
  if (!result.rows[0]) throw new HttpError(404, "Booking not found");
  response.json({ success: true, data: result.rows[0] });
}));
