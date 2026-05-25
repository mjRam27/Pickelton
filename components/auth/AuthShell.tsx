import Link from "next/link";
import { CheckCircle2, RadioTower, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-8 sm:px-8">
      <section className="grid w-full max-w-6xl gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-stretch">
        <aside className="relative overflow-hidden rounded-xl bg-surface-low p-7 shadow-ambient outline outline-1 outline-white/10 sm:p-10">
          <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-between">
            <div>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full bg-primary/12 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-primary outline outline-1 outline-primary/20"
              >
                Pickelton
              </Link>
              <p className="mt-12 text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">
                {eyebrow}
              </p>
              <h1 className="mt-4 max-w-[11ch] font-headline text-5xl font-black leading-[0.95] text-on-surface sm:text-6xl">
                {title}
              </h1>
              <p className="mt-6 max-w-md text-base font-medium leading-7 text-on-surface-variant">
                {subtitle}
              </p>
            </div>

            <div className="mt-12 space-y-3">
              {[
                [CheckCircle2, "Create profile", "Basic player details and secure password."],
                [ShieldCheck, "Verify phone", "OTP verification keeps match entries trustworthy."],
                [RadioTower, "Enter the app", "Scoring, tournaments, clubs, and booking unlock next."]
              ].map(([Icon, item, text], index) => (
                <div key={String(item)} className="grid grid-cols-[auto_1fr] gap-3 rounded-lg bg-black/30 p-4 outline outline-1 outline-white/10">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-on-surface">{String(item)}</p>
                      <span className="text-[0.66rem] font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium leading-5 text-on-surface-variant">{String(text)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="rounded-xl bg-surface-low p-5 shadow-ambient outline outline-1 outline-white/10 sm:p-8">
          <div className="mx-auto max-w-xl">{children}</div>
          <div className="mx-auto mt-6 max-w-xl">{footer}</div>
        </div>
      </section>
    </main>
  );
}
