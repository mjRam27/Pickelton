"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { formatPartnerDate as formatDate, formatPartnerTime as formatTime } from "@/lib/partner-date";

interface Customer {
  id: string;
  name: string | null;
  phone: string | null;
}

interface Court {
  id: string;
  name: string | null;
  sport: string | null;
}

interface Booking {
  id: string;
  reference: string | null;
  starts_at: string;
  ends_at: string;
  status: string | null;
  payment_status: string | null;
  total_amount: number | null;
  customer: Customer | Customer[] | null;
  court: Court | Court[] | null;
}

function getCustomer(customer: Booking["customer"]) {
  if (Array.isArray(customer)) {
    return customer[0] ?? null;
  }

  return customer;
}

function getCourt(court: Booking["court"]) {
  if (Array.isArray(court)) {
    return court[0] ?? null;
  }

  return court;
}

function formatStatus(status: string | null) {
  if (!status) return "Unknown";

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1).toLowerCase()
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadBookings() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          reference,
          starts_at,
          ends_at,
          status,
          payment_status,
          total_amount,
          customer:customers (
            id,
            name,
            phone
          ),
          court:courts (
            id,
            name,
            sport
          )
        `)
        .order("starts_at", {
          ascending: false,
        });

      if (error) {
        console.error("Bookings load error:", error);
        setErrorMessage(error.message);
        setBookings([]);
        return;
      }

      setBookings((data as Booking[]) || []);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Something went wrong while loading bookings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <main
      style={{
        padding: "32px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          gap: "20px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            BOOKINGS
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "36px",
            }}
          >
            Bookings
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#666",
            }}
          >
            Manage all court bookings.
          </p>
        </div>

        <Link
          href="/partner/bookings/add"
          style={{
            display: "inline-block",
            padding: "13px 22px",
            background: "#b6ff00",
            color: "#111",
            textDecoration: "none",
            borderRadius: "10px",
            fontWeight: 700,
          }}
        >
          + New Booking
        </Link>
      </div>

      {/* ERROR */}

      {errorMessage && (
        <div
          style={{
            padding: "16px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: "#ffe5e5",
            color: "#b00020",
            border: "1px solid #ffb5b5",
          }}
        >
          <strong>Unable to load bookings:</strong>{" "}
          {errorMessage}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          Loading bookings...
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        !errorMessage &&
        bookings.length === 0 && (
          <div
            style={{
              padding: "60px 30px",
              textAlign: "center",
              border: "1px solid #ddd",
              borderRadius: "14px",
              background: "#fff",
            }}
          >
            <h2>No bookings yet</h2>

            <p
              style={{
                color: "#666",
                marginBottom: "20px",
              }}
            >
              Create your first booking to see it here.
            </p>

            <Link
              href="/partner/bookings/add"
              style={{
                display: "inline-block",
                padding: "12px 20px",
                background: "#b6ff00",
                color: "#111",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: 700,
              }}
            >
              Create Booking
            </Link>
          </div>
        )}

      {/* BOOKINGS TABLE */}

      {!loading &&
        bookings.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              border: "1px solid #ddd",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "900px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f7f7f7",
                    }}
                  >
                    <th style={thStyle}>
                      Booking
                    </th>

                    <th style={thStyle}>
                      Customer
                    </th>

                    <th style={thStyle}>
                      Court
                    </th>

                    <th style={thStyle}>
                      Date
                    </th>

                    <th style={thStyle}>
                      Time
                    </th>

                    <th style={thStyle}>
                      Amount
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>

                    <th style={thStyle}>
                      Payment
                    </th>

                    <th style={thStyle}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => {
                    const customer =
                      getCustomer(
                        booking.customer
                      );

                    const court =
                      getCourt(
                        booking.court
                      );

                    return (
                      <tr
                        key={booking.id}
                        style={{
                          borderTop:
                            "1px solid #eee",
                        }}
                      >
                        {/* BOOKING */}

                        <td style={tdStyle}>
                          <strong>
                            {booking.reference ||
                              booking.id.slice(
                                0,
                                8
                              )}
                          </strong>
                        </td>

                        {/* CUSTOMER */}

                        <td style={tdStyle}>
                          <div>
                            <strong>
                              {customer?.name ||
                                "Unknown"}
                            </strong>

                            {customer?.phone && (
                              <div
                                style={{
                                  fontSize:
                                    "12px",
                                  color:
                                    "#777",
                                  marginTop:
                                    "4px",
                                }}
                              >
                                {
                                  customer.phone
                                }
                              </div>
                            )}
                          </div>
                        </td>

                        {/* COURT */}

                        <td style={tdStyle}>
                          <strong>
                            {court?.name ||
                              "Unknown Court"}
                          </strong>

                          {court?.sport && (
                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#777",
                                marginTop:
                                  "4px",
                              }}
                            >
                              {court.sport}
                            </div>
                          )}
                        </td>

                        {/* DATE */}

                        <td style={tdStyle}>
                          {formatDate(
                            booking.starts_at
                          )}
                        </td>

                        {/* TIME */}

                        <td style={tdStyle}>
                          {formatTime(
                            booking.starts_at
                          )}
                          {" – "}
                          {formatTime(
                            booking.ends_at
                          )}
                        </td>

                        {/* AMOUNT */}

                        <td style={tdStyle}>
                          ₹
                          {Number(
                            booking.total_amount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* STATUS */}

                        <td style={tdStyle}>
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "6px 10px",
                              borderRadius:
                                "20px",
                              fontSize:
                                "12px",
                              fontWeight: 700,
                              background:
                                booking.status ===
                                "CANCELLED"
                                  ? "#ffe5e5"
                                  : booking.status ===
                                    "COMPLETED"
                                  ? "#e5f5e5"
                                  : "#eaf8cf",
                            }}
                          >
                            {formatStatus(
                              booking.status
                            )}
                          </span>
                        </td>

                        {/* PAYMENT */}

                        <td style={tdStyle}>
                          {formatStatus(
                            booking.payment_status
                          )}
                        </td>

                        {/* ACTION */}

                        <td style={tdStyle}>
                          <Link
                            href={`/partner/bookings/${booking.id}`}
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "8px 14px",
                              border:
                                "1px solid #222",
                              borderRadius:
                                "8px",
                              color:
                                "#222",
                              textDecoration:
                                "none",
                              fontWeight: 600,
                            }}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "15px",
  fontSize: "13px",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "16px 15px",
  fontSize: "14px",
  verticalAlign: "middle",
};
