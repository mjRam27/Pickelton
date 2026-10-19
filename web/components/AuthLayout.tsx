// web/components/AuthLayout.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "../lib/session";
import { Logo } from "./Logo";

// Split auth layout: dark brand panel on the left (hidden on small screens), form on the right.
export function AuthLayout({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();
  useEffect(() => { if (session) router.replace(nextPath()); }, [session, router]);

  return (
    <div className="authPage">
      <section className="authArt">
        <svg aria-hidden="true" className="court" preserveAspectRatio="xMidYMid slice" viewBox="0 0 720 900">
          <g fill="none" opacity="0.14" stroke="#C8F03C" strokeWidth="2">
            <rect height="700" width="520" x="100" y="100" />
            <path d="M100 450h520M360 100v250M360 550v250M100 350h520M100 550h520" />
          </g>
        </svg>
        <Link className="shellBrand" href="/"><Logo size={36} />Pickelton</Link>
        <div className="vstack" style={{ gap: 20, position: "relative" }}>
          <h2>Every rally<br /><span>counts.</span></h2>
          <p>Live scores, clubs, tournaments and your community, for pickleball and badminton.</p>
        </div>
        <span />
      </section>
      <section className="authForm">{children}</section>
    </div>
  );
}

// Where to go after signing in: the page the user was sent away from, if it's one of ours.
export function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/home";
}

// The current ?next=... query, read after mount so server and client render the same HTML.
export function useNextQuery() {
  const [query, setQuery] = useState("");
  useEffect(() => { setQuery(window.location.search); }, []);
  return query;
}
