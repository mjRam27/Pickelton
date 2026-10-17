// Partner portal API (partner-backend). Fields mirror the API's snake_case rows.
// Postgres NUMERIC columns arrive as strings, so money fields are typed as `Money`.
import type { ISODateTime, UUID } from "./common";

export type Money = number | string;

export type PartnerStatus = "ACTIVE" | "PENDING" | "SUSPENDED";
export type Partner = {
  id: UUID; business_name: string; contact_name: string; email: string; phone: string;
  address: string | null; city: string | null; state: string | null; postal_code: string | null; website: string | null;
  status: PartnerStatus; created_at: ISODateTime; updated_at: ISODateTime;
};
export type PartnerLoginResponse = { token: string; partner: Partner };
export type UpdatePartnerProfileRequest = Partial<{
  businessName: string; contactName: string; phone: string; address: string; city: string; state: string; postalCode: string; website: string;
}>;

export type CourtSport = "PICKLEBALL" | "BADMINTON" | "MULTI_SPORT";
export type CourtStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";
export type Court = {
  id: UUID; partner_id: UUID; name: string; sport: CourtSport; surface: string | null; indoor: boolean;
  hourly_rate: Money; description: string | null; status: CourtStatus; created_at: ISODateTime; updated_at: ISODateTime;
};
export type CourtRequest = { name: string; sport: CourtSport; surface?: string; indoor: boolean; hourlyRate: number; description?: string; status: CourtStatus };

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";
export type Booking = {
  id: UUID; reference: string; court_id: UUID; customer_id: UUID; starts_at: ISODateTime; ends_at: ISODateTime;
  status: BookingStatus; total_amount: Money; notes: string | null; created_at: ISODateTime; updated_at: ISODateTime;
  court_name: string; customer_name: string; customer_email: string; customer_phone: string;
};

export type PartnerCustomer = {
  id: UUID; name: string; email: string; phone: string; created_at: ISODateTime;
  booking_count: number; total_spent: Money; last_booking_at: ISODateTime | null;
};

export type PartnerDashboard = {
  metrics: { bookings_today: number; revenue_month: Money; total_customers: number; pending_bookings: number };
  revenue: Array<{ date: string; revenue: Money }>;
  recentBookings: Array<Pick<Booking, "id" | "reference" | "starts_at" | "status" | "total_amount" | "court_name" | "customer_name">>;
  courtUtilization: Array<{ id: UUID; name: string; booking_count: number; booked_hours: number }>;
};

export type PartnerReport = {
  summary: { bookings: number; customers: number; revenue: Money; average_booking_value: Money };
  byCourt: Array<{ id: UUID; name: string; bookings: number; revenue: Money }>;
  byDay: Array<{ date: string; bookings: number; revenue: Money }>;
  range: { from: ISODateTime; to: ISODateTime };
};

// Free-form JSON the partner stores via /settings.
export type PartnerSettings = Record<string, unknown>;
