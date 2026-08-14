import { Router } from "express";
import { query } from "../../config/database.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const dashboardRouter = Router();
dashboardRouter.get("/", asyncHandler(async (request,response)=>{
  const id=request.auth.sub;
  const [metrics,revenue,recent,utilization]=await Promise.all([
    query(`SELECT COUNT(*) FILTER (WHERE starts_at::date=CURRENT_DATE)::int bookings_today,
      COALESCE(SUM(total_amount) FILTER (WHERE status IN ('CONFIRMED','COMPLETED') AND starts_at>=date_trunc('month',NOW())),0) revenue_month,
      COUNT(DISTINCT customer_id)::int total_customers,
      COUNT(*) FILTER (WHERE status='PENDING')::int pending_bookings FROM bookings WHERE partner_id=$1`,[id]),
    query(`SELECT TO_CHAR(day,'YYYY-MM-DD') date,COALESCE(SUM(b.total_amount),0) revenue FROM generate_series(CURRENT_DATE-INTERVAL '6 days',CURRENT_DATE,INTERVAL '1 day') day
      LEFT JOIN bookings b ON b.partner_id=$1 AND b.starts_at::date=day::date AND b.status IN ('CONFIRMED','COMPLETED') GROUP BY day ORDER BY day`,[id]),
    query(`SELECT b.id,b.reference,b.starts_at,b.status,b.total_amount,c.name court_name,u.name customer_name FROM bookings b JOIN courts c ON c.id=b.court_id JOIN customers u ON u.id=b.customer_id WHERE b.partner_id=$1 ORDER BY b.created_at DESC LIMIT 8`,[id]),
    query(`SELECT c.id,c.name,COUNT(b.id)::int booking_count,COALESCE(SUM(EXTRACT(EPOCH FROM (b.ends_at-b.starts_at))/3600),0)::float booked_hours FROM courts c LEFT JOIN bookings b ON b.court_id=c.id AND b.status NOT IN ('CANCELLED','REJECTED') WHERE c.partner_id=$1 GROUP BY c.id ORDER BY booking_count DESC`,[id])]);
  response.json({success:true,data:{metrics:metrics.rows[0],revenue:revenue.rows,recentBookings:recent.rows,courtUtilization:utilization.rows}});
}));
