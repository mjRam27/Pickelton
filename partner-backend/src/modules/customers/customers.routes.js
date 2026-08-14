import { Router } from "express";
import { query } from "../../config/database.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import { pagination, pageResult } from "../../utils/pagination.js";

export const customersRouter = Router();
customersRouter.get("/", asyncHandler(async (request, response) => {
  const { page,size,offset } = pagination(request.query); const search=`%${request.query.search ?? ""}%`;
  const [items,count]=await Promise.all([
    query(`SELECT c.*,COUNT(b.id)::int booking_count,COALESCE(SUM(b.total_amount) FILTER (WHERE b.status IN ('CONFIRMED','COMPLETED')),0) total_spent,
      MAX(b.starts_at) last_booking_at FROM customers c LEFT JOIN bookings b ON b.customer_id=c.id WHERE c.partner_id=$1 AND (c.name ILIKE $2 OR c.email ILIKE $2 OR c.phone ILIKE $2)
      GROUP BY c.id ORDER BY last_booking_at DESC NULLS LAST LIMIT $3 OFFSET $4`,[request.auth.sub,search,size,offset]),
    query("SELECT COUNT(*) FROM customers WHERE partner_id=$1 AND (name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2)",[request.auth.sub,search])]);
  response.json({success:true,data:pageResult(items.rows,count.rows[0].count,page,size)});
}));
customersRouter.get("/:id", asyncHandler(async (request,response)=>{
  const customer=await query("SELECT * FROM customers WHERE id=$1 AND partner_id=$2",[request.params.id,request.auth.sub]);
  if(!customer.rows[0]) throw new HttpError(404,"Customer not found");
  const bookings=await query("SELECT b.*,c.name court_name FROM bookings b JOIN courts c ON c.id=b.court_id WHERE b.customer_id=$1 ORDER BY b.starts_at DESC",[request.params.id]);
  response.json({success:true,data:{...customer.rows[0],bookings:bookings.rows}});
}));
