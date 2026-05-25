"use client";

import Link from "next/link";
import { RefreshCw, ShieldCheck, Trophy, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getApiMessage } from "@/services/api";
import { AuthUser, getMe, getStoredUser } from "@/services/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function refreshProfile() {
    setIsLoading(true);
    setStatus("");
    try {
      const response = await getMe();
      setUser(response.data);
    } catch (error) {
      setStatus(getApiMessage(error, "Profile refresh needs a running backend and stored JWT."));
      setUser(getStoredUser());
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setUser(getStoredUser());
    refreshProfile();
  }, []);

  return (
    <main className="kinetic-grid flex min-h-screen items-center justify-center px-5 py-8">
      <section className="glass-panel w-full max-w-3xl rounded-xl p-6 shadow-ambient outline outline-1 outline-white/5 sm:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-secondary">Current user</p>
            <h1 className="mt-2 font-headline text-4xl font-black text-on-surface">Profile state</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-on-surface-variant">
              This screen reads `/api/v1/auth/me` and shows whether the account can continue to host verification.
            </p>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-background">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Name", user?.name ?? "Unknown"],
            ["Email", user?.email ?? "Unknown"],
            ["Phone", user?.phoneNumber ?? "Unknown"],
            ["DOB", user?.dateOfBirth ?? "Unknown"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-black/45 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">{label}</p>
              <p className="mt-2 font-semibold text-on-surface">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-black/45 p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">Phone status</p>
            <p className={`mt-2 font-headline text-2xl font-black ${user?.phoneVerified ? "text-secondary" : "text-error"}`}>
              {user?.phoneVerified ? "Verified" : "Needs OTP"}
            </p>
          </div>
          <div className="rounded-lg bg-black/45 p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">Email status</p>
            <p className={`mt-2 font-headline text-2xl font-black ${user?.emailVerified ? "text-secondary" : "text-primary"}`}>
              {user?.emailVerified ? "Verified" : "Not verified"}
            </p>
          </div>
        </div>

        {status ? <p className="mt-5 rounded-lg bg-secondary/12 px-4 py-3 text-sm font-bold text-secondary">{status}</p> : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Button type="button" variant="secondary" isLoading={isLoading} onClick={refreshProfile}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
          <Link href="/verify-phone" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-background">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            OTP
          </Link>
          <Link href="/host/status" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-on-secondary">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Host status
          </Link>
        </div>
      </section>
    </main>
  );
}
