// pickelton-app/apps/web/app/layout.tsx
import type { Metadata } from "next";
import "../theme/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pickelton | Play. Compete. Connect.",
  description: "Find courts, enter tournaments, manage clubs, and score live matches.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
