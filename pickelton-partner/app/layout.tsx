import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pickelton Partner Portal",
  description: "Partner portal for managing courts, bookings, and club operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: "#f6f7fb", color: "#111827", fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
