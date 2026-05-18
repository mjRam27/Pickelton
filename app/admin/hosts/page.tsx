import { BadgeCheck, Clock3, KeyRound, ShieldAlert, ShieldCheck, ShieldX, UserCheck } from "lucide-react";
import { AppNav } from "@/components/app/AppNav";

const hosts = [
  ["Srajanya Smashers", "Bengaluru", "Pending", "Phone verified / KYC review needed", "2 docs", "Today"],
  ["MJ Pickle League", "Mumbai", "Approved", "Can create tournaments", "Clean", "May 18"],
  ["Court Kings", "Pune", "Rejected", "Government ID unclear", "Needs resubmit", "May 17"],
  ["North Net Club", "Delhi", "Pending", "Secret OTP issued", "3 docs", "May 16"]
];

const statusStyle: Record<string, string> = {
  Approved: "bg-secondary/12 text-secondary",
  Rejected: "bg-error/12 text-error",
  Pending: "bg-primary/12 text-primary"
};

export default function AdminHostsPage() {
  return (
    <main className="kinetic-grid min-h-screen">
      <AppNav />
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-8 lg:px-0">
        <div className="surface-panel rounded-xl p-6 outline outline-1 outline-white/5 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">Super admin</p>
              <h1 className="mt-4 max-w-3xl font-headline text-5xl font-black leading-[0.96] text-on-surface sm:text-6xl">
                Owner review console.
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-on-surface-variant">
                A sharper frontend console for MJ/admin review: verify hosts, track OTP readiness, approve organizer
                access, and catch rejected KYC quickly.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                [UserCheck, "12", "Hosts"],
                [Clock3, "04", "Pending"],
                [ShieldCheck, "08", "Approved"]
              ].map(([Icon, value, label]) => (
                <div key={String(label)} className="rounded-lg bg-black/45 p-4 text-center outline outline-1 outline-white/5">
                  <Icon className="mx-auto h-5 w-5 text-secondary" aria-hidden="true" />
                  <p className="mt-3 font-headline text-3xl font-black text-on-surface">{String(value)}</p>
                  <p className="mt-1 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
                    {String(label)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            [ShieldCheck, "All access", "Super admin can review host applications."],
            [KeyRound, "Secret key / OTP", "Each host can be issued a secure verification code."],
            [BadgeCheck, "Approval gate", "Only approved hosts should create tournaments."]
          ].map(([Icon, title, text]) => (
            <div key={String(title)} className="motion-card rounded-lg bg-black/45 p-5 outline outline-1 outline-white/5">
              <Icon className="h-7 w-7 text-secondary" aria-hidden="true" />
              <p className="mt-4 font-headline text-xl font-black text-on-surface">{String(title)}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-on-surface-variant">{String(text)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-surface-low p-5 shadow-ambient outline outline-1 outline-white/5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Review queue</p>
              <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">Host applications</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", "Pending", "Approved", "Rejected"].map((filter) => (
                <button
                  key={filter}
                  className={`min-h-10 rounded-lg px-4 text-xs font-extrabold uppercase tracking-[0.1em] ${
                    filter === "All" ? "bg-secondary text-on-secondary" : "bg-black/45 text-on-surface-variant"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {hosts.map(([name, city, status, note, docs, date]) => (
              <div
                key={name}
                className="grid gap-4 rounded-lg bg-black/45 p-4 outline outline-1 outline-white/5 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
              >
                <div>
                  <p className="font-headline text-xl font-black text-on-surface">{name}</p>
                  <p className="mt-1 text-sm font-semibold text-on-surface-variant">
                    {city} / {note}
                  </p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-on-surface-variant">
                  {docs}
                </span>
                <span className={`rounded-full px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] ${statusStyle[status]}`}>
                  {status}
                </span>
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs font-bold text-on-surface-variant sm:inline">{date}</span>
                  <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#001a63]">
                    {status === "Rejected" ? <ShieldX className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
