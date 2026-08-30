import { Router } from "express";
import { z } from "zod";
import { query } from "../../config/database.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { pageResult, pagination } from "../../utils/pagination.js";

export const reportsRouter = Router();
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const granularity = z.enum(["daily", "weekly", "monthly", "yearly"]);
const summaryQuery = z.object({ body: z.any(), params: z.object({}), query: z.object({
  from: dateString, to: dateString, compareFrom: dateString, compareTo: dateString,
  granularity: granularity.default("daily"),
}).refine((value) => value.from <= value.to, { message: "From date cannot be after To date" })
  .refine((value) => value.compareFrom <= value.compareTo, { message: "Invalid comparison range" }) });
const historyRequest = z.object({ body: z.object({
  reportType: z.string().min(1).max(80).default("Business Summary"),
  dateFrom: dateString, dateTo: dateString,
  comparison: z.enum(["previous-period", "previous-month", "previous-year"]),
  granularity, format: z.literal("CSV"), snapshot: z.record(z.string(), z.unknown()),
}).refine((value) => value.dateFrom <= value.dateTo, { message: "Invalid report range" }),
params: z.object({}), query: z.object({}) });
const truncByGranularity = { daily: "day", weekly: "week", monthly: "month", yearly: "year" };

function numericRows(rows, fields) {
  return rows.map((row) => {
    const normalized = { ...row };
    for (const field of fields) normalized[field] = Number(row[field] ?? 0);
    return normalized;
  });
}

async function loadRange(partnerId, from, to, selectedGranularity) {
  const trunc = truncByGranularity[selectedGranularity];
  const params = [partnerId, from, to];
  const range = "b.partner_id=$1 AND b.starts_at >= $2::date AND b.starts_at < ($3::date + INTERVAL '1 day')";
  const revenue = "b.status IN ('CONFIRMED','COMPLETED')";
  const [summary, series, statuses, hours, courts, customers, customerMetrics] = await Promise.all([
    query(`SELECT COUNT(*)::int bookings, COUNT(DISTINCT b.customer_id)::int customers,
      COALESCE(SUM(b.total_amount) FILTER (WHERE ${revenue}),0) revenue,
      COALESCE(AVG(b.total_amount) FILTER (WHERE ${revenue}),0) average_booking_value
      FROM bookings b WHERE ${range}`, params),
    query(`SELECT date_trunc('${trunc}',b.starts_at) bucket, COUNT(*)::int bookings,
      COALESCE(SUM(b.total_amount) FILTER (WHERE ${revenue}),0) revenue
      FROM bookings b WHERE ${range} GROUP BY bucket ORDER BY bucket`, params),
    query(`SELECT b.status, COUNT(*)::int value FROM bookings b WHERE ${range}
      GROUP BY b.status ORDER BY b.status`, params),
    query(`SELECT CASE WHEN EXTRACT(HOUR FROM b.starts_at)<6 THEN '12–6 AM'
        WHEN EXTRACT(HOUR FROM b.starts_at)<9 THEN '6–9 AM'
        WHEN EXTRACT(HOUR FROM b.starts_at)<12 THEN '9 AM–12 PM'
        WHEN EXTRACT(HOUR FROM b.starts_at)<16 THEN '12–4 PM'
        WHEN EXTRACT(HOUR FROM b.starts_at)<20 THEN '4–8 PM' ELSE '8 PM–12 AM' END label,
      CASE WHEN EXTRACT(HOUR FROM b.starts_at)<6 THEN 0 WHEN EXTRACT(HOUR FROM b.starts_at)<9 THEN 1
        WHEN EXTRACT(HOUR FROM b.starts_at)<12 THEN 2 WHEN EXTRACT(HOUR FROM b.starts_at)<16 THEN 3
        WHEN EXTRACT(HOUR FROM b.starts_at)<20 THEN 4 ELSE 5 END sort_order,
      COUNT(*)::int value FROM bookings b WHERE ${range} GROUP BY label,sort_order ORDER BY sort_order`, params),
    query(`SELECT c.id,c.name,COUNT(b.id)::int bookings,
      COALESCE(SUM(b.total_amount) FILTER (WHERE ${revenue}),0) revenue,
      COALESCE(SUM(EXTRACT(EPOCH FROM (b.ends_at-b.starts_at))/3600)
        FILTER (WHERE b.status NOT IN ('CANCELLED','REJECTED')),0) booked_hours
      FROM courts c LEFT JOIN bookings b ON b.court_id=c.id AND b.partner_id=$1
        AND b.starts_at >= $2::date AND b.starts_at < ($3::date + INTERVAL '1 day')
      WHERE c.partner_id=$1 GROUP BY c.id ORDER BY revenue DESC,c.name`, params),
    query(`SELECT c.id,c.name,COUNT(b.id)::int bookings,
      COALESCE(SUM(b.total_amount) FILTER (WHERE ${revenue}),0) revenue,
      (SELECT preferred_court.name FROM bookings preferred_booking
        JOIN courts preferred_court ON preferred_court.id=preferred_booking.court_id
        WHERE preferred_booking.customer_id=c.id AND preferred_booking.partner_id=$1
          AND preferred_booking.starts_at >= $2::date
          AND preferred_booking.starts_at < ($3::date + INTERVAL '1 day')
        GROUP BY preferred_court.id ORDER BY COUNT(*) DESC,preferred_court.name LIMIT 1) preferred_court
      FROM customers c JOIN bookings b ON b.customer_id=c.id
      WHERE c.partner_id=$1 AND b.starts_at >= $2::date AND b.starts_at < ($3::date + INTERVAL '1 day')
      GROUP BY c.id ORDER BY revenue DESC,bookings DESC,c.name LIMIT 5`, params),
    query(`WITH first_booking AS (SELECT customer_id,MIN(starts_at)::date first_date FROM bookings
        WHERE partner_id=$1 GROUP BY customer_id), range_counts AS (SELECT customer_id,COUNT(*)::int bookings
        FROM bookings WHERE partner_id=$1 AND starts_at >= $2::date
        AND starts_at < ($3::date + INTERVAL '1 day') GROUP BY customer_id)
      SELECT COUNT(*) FILTER (WHERE f.first_date BETWEEN $2::date AND $3::date)::int new_customers,
        COUNT(*) FILTER (WHERE f.first_date < $2::date)::int returning_customers,
        COUNT(*) FILTER (WHERE r.bookings>=2)::int repeat_customers
      FROM range_counts r JOIN first_booking f ON f.customer_id=r.customer_id`, params),
  ]);
  return {
    summary: { bookings: Number(summary.rows[0].bookings), customers: Number(summary.rows[0].customers),
      revenue: Number(summary.rows[0].revenue), averageBookingValue: Number(summary.rows[0].average_booking_value),
      occupancyRate: null },
    series: numericRows(series.rows,["bookings","revenue"]),
    bookingStatuses: numericRows(statuses.rows,["value"]), bookingHours: numericRows(hours.rows,["value"]),
    courts: numericRows(courts.rows,["bookings","revenue","booked_hours"]).map((court)=>({...court,utilization:null})),
    customers: numericRows(customers.rows,["bookings","revenue"]),
    customerMetrics: { newCustomers:Number(customerMetrics.rows[0].new_customers),
      returningCustomers:Number(customerMetrics.rows[0].returning_customers),
      repeatCustomers:Number(customerMetrics.rows[0].repeat_customers) },
  };
}

reportsRouter.get("/summary", validate(summaryQuery), asyncHandler(async (request,response)=>{
  const { from,to,compareFrom,compareTo,granularity:selectedGranularity }=request.validated.query;
  const [current,comparison]=await Promise.all([
    loadRange(request.auth.sub,from,to,selectedGranularity),
    loadRange(request.auth.sub,compareFrom,compareTo,selectedGranularity),
  ]);
  response.json({success:true,data:{range:{from,to},comparisonRange:{from:compareFrom,to:compareTo},
    granularity:selectedGranularity,current,comparison,capabilities:{occupancy:false,
      occupancyReason:"Court operating hours are not stored, so available capacity cannot be calculated accurately.",
      paymentMethodBreakdown:false,paymentMethodReason:"The database stores payment status but not payment method."}}});
}));

reportsRouter.get("/history",asyncHandler(async(request,response)=>{
  const {page,size,offset}=pagination(request.query);
  const [items,count]=await Promise.all([
    query(`SELECT id,report_type,date_from,date_to,comparison,granularity,format,snapshot,created_at
      FROM report_history WHERE partner_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,[request.auth.sub,size,offset]),
    query("SELECT COUNT(*) FROM report_history WHERE partner_id=$1",[request.auth.sub]),
  ]);
  response.json({success:true,data:pageResult(items.rows,count.rows[0].count,page,size)});
}));

reportsRouter.post("/history",validate(historyRequest),asyncHandler(async(request,response)=>{
  const item=request.validated.body;
  const result=await query(`INSERT INTO report_history
    (partner_id,report_type,date_from,date_to,comparison,granularity,format,snapshot)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
    RETURNING id,report_type,date_from,date_to,comparison,granularity,format,snapshot,created_at`,
  [request.auth.sub,item.reportType,item.dateFrom,item.dateTo,item.comparison,item.granularity,item.format,JSON.stringify(item.snapshot)]);
  response.status(201).json({success:true,data:result.rows[0]});
}));
