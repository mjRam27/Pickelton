"use client";

import Link from "next/link";
import { AlertTriangle, BadgeCheck, Clock3, RefreshCw, ShieldX } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getApiMessage } from "@/services/api";
import { AuthUser, getMe, getStoredUser } from "@/services/auth";
import { getMyHostVerification, HostVerification } from "@/services/host";

const statusCopy = {
  NOT_SUBMITTED: ["Not submitted", "Submit host KYC after phone verification.", AlertTriangle],
  PENDING_REVIEW: ["Pending review", "Wait for admin approval before creating tournaments.", Clock3],
  APPROVED: ["Approved", "You can create tournaments now.", BadgeCheck],
  REJECTED: ["Rejected", "Review the rejection reason and resubmit KYC.", ShieldX],
  EXPIRED: ["Expired", "Submit a fresh host verification.", AlertTriangle]
} as const;

export default function HostStatusPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [host, setHost] = useState<HostVerification | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function refresh() {
    setIsLoading(true);
    setStatus("");
    try {
      const me = await getMe();
      setUser(me.data);
      const hostResponse = await getMyHostVerification();
      setHost(hostResponse.data);
    } catch (error) {
      setUser(getStoredUser());
      setStatus(getApiMessage(error, "Host status needs backend auth. Showing frontend gate only."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setUser(getStoredUser());
    refresh();
  }, []);

  const hostStatus = host?.status ?? "NOT_SUBMITTED";
  const [label, message, Icon] = statusCopy[hostStatus];

  return (
    <main className="kinetic-grid flex min-h-screen items-center justify-center px-5 py-8">
      <section className="glass-panel w-full max-w-2xl rounded-xl p-6 shadow-ambient outline outline-1 outline-white/5 sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-secondary">Host verification</p>
        <h1 className="mt-2 font-headline text-4xl font-black text-on-surface">Status</h1>

        <div className="mt-8 rounded-xl bg-black/45 p-6">
          <Icon className="h-10 w-10 text-secondary" aria-hidden="true" />
          <p className="mt-4 font-headline text-3xl font-black text-on-surface">{label}</p>
          <p className="mt-3 text-sm font-semibold leading-6 text-on-surface-variant">{message}</p>
          {host?.rejectionReason ? <p className="mt-3 text-sm font-bold text-error">{host.rejectionReason}</p> : null}
        </div>

        <div className="mt-5 rounded-lg bg-black/45 p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">Phone verification gate</p>
          <p className={`mt-2 font-headline text-2xl font-black ${user?.phoneVerified ? "text-secondary" : "text-error"}`}>
            {user?.phoneVerified ? "Phone verified" : "Verify phone before KYC"}
          </p>
        </div>

        {status ? <p className="mt-5 rounded-lg bg-secondary/12 px-4 py-3 text-sm font-bold text-secondary">{status}</p> : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Button type="button" variant="secondary" isLoading={isLoading} onClick={refresh}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
          <Link href="/host/register" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-[#001a63]">
            KYC form
          </Link>
          <Link href="/tournaments/create" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-secondary px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-on-secondary">
            Create tournament
          </Link>
        </div>
      </section>
    </main>
  );
}
