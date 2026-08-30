import { Router } from "express";
import { query } from "../../config/database.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";

export const dashboardRouter = Router();
const revenueStatus="status IN ('CONFIRMED','COMPLETED')";

dashboardRouter.get("/",asyncHandler(async(request,response)=>{
  const partnerId=request.auth.sub;
  const [partner,metrics,courts,revenueSeries,statuses,recent,schedule,courtPerformance,hours]=await Promise.all([
    query("SELECT business_name,contact_name FROM partners WHERE id=$1",[partnerId]),
    query(`SELECT COUNT(*) FILTER(WHERE starts_at::date=CURRENT_DATE)::int bookings_today,
      COUNT(*) FILTER(WHERE starts_at::date=CURRENT_DATE-1)::int bookings_yesterday,
      COUNT(*) FILTER(WHERE status='PENDING')::int pending_bookings,
      COALESCE(SUM(total_amount) FILTER(WHERE ${revenueStatus} AND starts_at::date=CURRENT_DATE),0) revenue_today,
      COALESCE(SUM(total_amount) FILTER(WHERE ${revenueStatus} AND starts_at>=date_trunc('month',NOW()) AND starts_at<date_trunc('month',NOW())+INTERVAL '1 month'),0) revenue_month,
      COALESCE(SUM(total_amount) FILTER(WHERE ${revenueStatus} AND starts_at>=date_trunc('month',NOW())-INTERVAL '1 month' AND starts_at<date_trunc('month',NOW())),0) revenue_previous_month,
      COALESCE(AVG(total_amount) FILTER(WHERE ${revenueStatus} AND starts_at>=date_trunc('month',NOW()) AND starts_at<date_trunc('month',NOW())+INTERVAL '1 month'),0) average_booking_value,
      COUNT(DISTINCT customer_id)::int total_customers,COUNT(*)::int total_bookings
      FROM bookings WHERE partner_id=$1`,[partnerId]),
    query(`SELECT COUNT(*)::int total_courts,COUNT(*) FILTER(WHERE status='ACTIVE')::int active_courts,
      COUNT(*) FILTER(WHERE status='MAINTENANCE')::int maintenance_courts FROM courts WHERE partner_id=$1`,[partnerId]),
    query(`SELECT TO_CHAR(day,'YYYY-MM-DD') date,COALESCE(SUM(b.total_amount) FILTER(WHERE b.status IN('CONFIRMED','COMPLETED')),0) revenue,
      COUNT(b.id)::int bookings FROM generate_series(CURRENT_DATE-INTERVAL '6 days',CURRENT_DATE,INTERVAL '1 day') day
      LEFT JOIN bookings b ON b.partner_id=$1 AND b.starts_at::date=day::date GROUP BY day ORDER BY day`,[partnerId]),
    query(`SELECT status,COUNT(*)::int value FROM bookings WHERE partner_id=$1 AND starts_at::date=CURRENT_DATE GROUP BY status ORDER BY status`,[partnerId]),
    query(`SELECT b.id,b.reference,b.starts_at,b.ends_at,b.status,b.payment_status,b.total_amount,
      c.name court_name,u.name customer_name FROM bookings b JOIN courts c ON c.id=b.court_id
      JOIN customers u ON u.id=b.customer_id WHERE b.partner_id=$1 ORDER BY b.created_at DESC LIMIT 8`,[partnerId]),
    query(`SELECT b.id,b.reference,b.starts_at,b.ends_at,b.status,b.total_amount,c.name court_name,u.name customer_name
      FROM bookings b JOIN courts c ON c.id=b.court_id JOIN customers u ON u.id=b.customer_id
      WHERE b.partner_id=$1 AND b.starts_at::date=CURRENT_DATE ORDER BY b.starts_at LIMIT 6`,[partnerId]),
    query(`SELECT c.id,c.name,c.status,COUNT(b.id)::int booking_count,
      COALESCE(SUM(b.total_amount) FILTER(WHERE b.status IN('CONFIRMED','COMPLETED')),0) revenue,
      COALESCE(SUM(EXTRACT(EPOCH FROM(b.ends_at-b.starts_at))/3600) FILTER(WHERE b.status NOT IN('CANCELLED','REJECTED')),0) booked_hours
      FROM courts c LEFT JOIN bookings b ON b.court_id=c.id AND b.partner_id=$1
        AND b.starts_at>=date_trunc('month',NOW()) AND b.starts_at<date_trunc('month',NOW())+INTERVAL '1 month'
      WHERE c.partner_id=$1 GROUP BY c.id ORDER BY revenue DESC,c.name`,[partnerId]),
    query(`SELECT CASE WHEN EXTRACT(HOUR FROM starts_at)<6 THEN '12–6 AM' WHEN EXTRACT(HOUR FROM starts_at)<9 THEN '6–9 AM'
      WHEN EXTRACT(HOUR FROM starts_at)<12 THEN '9 AM–12 PM' WHEN EXTRACT(HOUR FROM starts_at)<16 THEN '12–4 PM'
      WHEN EXTRACT(HOUR FROM starts_at)<20 THEN '4–8 PM' ELSE '8 PM–12 AM' END label,
      COUNT(*)::int bookings FROM bookings WHERE partner_id=$1 AND starts_at>=date_trunc('month',NOW())
      AND starts_at<date_trunc('month',NOW())+INTERVAL '1 month' GROUP BY label ORDER BY bookings DESC LIMIT 1`,[partnerId]),
  ]);
  if(!partner.rows[0])throw new HttpError(404,"Partner dashboard not found");
  const metric=metrics.rows[0];const court=courts.rows[0];
  response.json({success:true,data:{partner:partner.rows[0],metrics:{
    bookingsToday:Number(metric.bookings_today),bookingsYesterday:Number(metric.bookings_yesterday),
    pendingBookings:Number(metric.pending_bookings),revenueToday:Number(metric.revenue_today),
    revenueMonth:Number(metric.revenue_month),revenuePreviousMonth:Number(metric.revenue_previous_month),
    averageBookingValue:Number(metric.average_booking_value),totalCustomers:Number(metric.total_customers),
    totalBookings:Number(metric.total_bookings),totalCourts:Number(court.total_courts),activeCourts:Number(court.active_courts),
    maintenanceCourts:Number(court.maintenance_courts)},revenueSeries:revenueSeries.rows.map(row=>({...row,revenue:Number(row.revenue),bookings:Number(row.bookings)})),
    bookingStatuses:statuses.rows.map(row=>({...row,value:Number(row.value)})),recentBookings:recent.rows,
    todaysSchedule:schedule.rows,courtPerformance:courtPerformance.rows.map(row=>({...row,booking_count:Number(row.booking_count),revenue:Number(row.revenue),booked_hours:Number(row.booked_hours)})),
    peakBookingPeriod:hours.rows[0]??null,capabilities:{occupancy:false,occupancyReason:"Court operating capacity is not stored, so occupancy cannot be calculated accurately."}}});
}));
