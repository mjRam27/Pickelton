// web/app/layout.tsx
import type { Metadata } from "next";
import { Archivo, Big_Shoulders } from "next/font/google";
import "../theme/tokens.css";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", weight: ["400", "500", "600", "700", "800"] });
const bigShoulders = Big_Shoulders({ subsets: ["latin"], variable: "--font-big-shoulders", weight: ["800", "900"] });

export const metadata: Metadata = {
  title: "Pickelton | Every rally counts",
  description: "Join clubs, enter tournaments, keep live scores and climb the leaderboard in pickleball and badminton.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${archivo.variable} ${bigShoulders.variable}`} lang="en">
      <body>{children}</body>
    </html>
  );
}
