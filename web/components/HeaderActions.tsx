// web/components/HeaderActions.tsx
"use client";

import Link from "next/link";
import { useSession } from "../lib/session";

// Landing page header: "Open Pickelton" when signed in, otherwise log in / sign up.
export function HeaderActions() {
  const session = useSession();
  if (session) return <Link className="button primary small" href="/home">Open Pickelton</Link>;
  return (
    <div className="row" style={{ gap: 8 }}>
      <Link className="button small" href="/login" style={{ color: "var(--text)" }}>Log in</Link>
      <Link className="button primary small" href="/signup">Sign up free</Link>
    </div>
  );
}
