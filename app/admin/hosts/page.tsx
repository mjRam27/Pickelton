import { BadgeCheck, KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { AppNav } from "@/components/app/AppNav";

const hosts = [
  ["Srajanya Smashers", "Bengaluru", "Pending", "Phone verified / KYC review needed"],
  ["MJ Pickle League", "Mumbai", "Approved", "Can create tournaments"],
  ["Court Kings", "Pune", "Rejected", "Government ID unclear"]
];

export default function AdminHostsPage() {
  return (
    <main className="kinetic-grid min-h-screen">
      <AppNav />
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-6 sm:px-8 lg:px-0">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">Super admin</p>
        <h1 className="mt-4 max-w-3xl font-headline text-5xl font-black leading-[0.96] text-on-surface sm:text-6xl">
          Owner review console.
        </h1>
        <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-on-surface-variant">
          Frontend-only screen for host verification review, secret key/OTP readiness, and organizer access status.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            [ShieldCheck, "All access", "Super admin can review host applications."],
            [KeyRound, "Secret key / OTP", "Each host can be issued a secure verification code."],
            [BadgeCheck, "Approval gate", "Only approved hosts should create tournaments."]
          ].map(([Icon, title, text]) => (
            <div key={String(title)} className="rounded-lg bg-black/45 p-5">
              <Icon className="h-7 w-7 text-secondary" aria-hidden="true" />
              <p className="mt-4 font-headline text-xl font-black text-on-surface">{String(title)}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-on-surface-variant">{String(text)}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-surface-low p-5 sm:p-6">
          <div className="space-y-3">
            {hosts.map(([name, city, status, note]) => (
              <div key={name} className="grid gap-4 rounded-lg bg-black/45 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-headline text-xl font-black text-on-surface">{name}</p>
                  <p className="mt-1 text-sm font-semibold text-on-surface-variant">{city} / {note}</p>
                </div>
                <span className={`rounded-full px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] ${status === "Approved" ? "bg-secondary/12 text-secondary" : status === "Rejected" ? "bg-error/12 text-error" : "bg-primary/12 text-primary"}`}>
                  {status}
                </span>
                <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#001a63]">
                  <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
