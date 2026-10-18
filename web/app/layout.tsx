// web/app/layout.tsx
import type { Metadata } from "next";
import { Archivo, Big_Shoulders } from "next/font/google";
import "../theme/tokens.css";
import "./globals.css";
import "./app.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", weight: ["400", "500", "600", "700", "800"] });
const bigShoulders = Big_Shoulders({ subsets: ["latin"], variable: "--font-big-shoulders", weight: ["800", "900"] });

export const metadata: Metadata = {
  title: "Pickelton | Every rally counts",
  description: "Live scoring, clubs, tournaments and a community for pickleball and badminton players.",
};

// Applies a saved light/dark choice before first paint so the page doesn't flash.
const themeScript = `try{var t=localStorage.getItem("pickelton.theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${archivo.variable} ${bigShoulders.variable}`} lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
