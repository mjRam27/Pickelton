import { Router } from "express";
import { query } from "../../config/database.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const reportsRouter=Router();
reportsRouter.get("/summary",asyncHandler(async(request,response)=>{
  const from=request.query.from ?? new Date(Date.now()-30*86400000).toISOString(); const to=request.query.to ?? new Date().toISOString();
  const [summary,byCourt,byDay]=await Promise.all([
    query(`SELECT COUNT(*)::int bookings,COUNT(DISTINCT customer_id)::int customers,COALESCE(SUM(total_amount) FILTER(WHERE status IN('CONFIRMED','COMPLETED')),0) revenue,
      COALESCE(AVG(total_amount) FILTER(WHERE status IN('CONFIRMED','COMPLETED')),0) average_booking_value FROM bookings WHERE partner_id=$1 AND starts_at BETWEEN $2 AND $3`,[request.auth.sub,from,to]),
    query(`SELECT c.id,c.name,COUNT(b.id)::int bookings,COALESCE(SUM(b.total_amount) FILTER(WHERE b.status IN('CONFIRMED','COMPLETED')),0) revenue FROM courts c LEFT JOIN bookings b ON b.court_id=c.id AND b.starts_at BETWEEN $2 AND $3 WHERE c.partner_id=$1 GROUP BY c.id ORDER BY revenue DESC`,[request.auth.sub,from,to]),
    query(`SELECT starts_at::date date,COUNT(*)::int bookings,COALESCE(SUM(total_amount) FILTER(WHERE status IN('CONFIRMED','COMPLETED')),0) revenue FROM bookings WHERE partner_id=$1 AND starts_at BETWEEN $2 AND $3 GROUP BY starts_at::date ORDER BY date`,[request.auth.sub,from,to])]);
  response.json({success:true,data:{summary:summary.rows[0],byCourt:byCourt.rows,byDay:byDay.rows,range:{from,to}}});
}));
