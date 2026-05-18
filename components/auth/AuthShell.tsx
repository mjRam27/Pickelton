import Link from "next/link";
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
    <main className="kinetic-grid flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
      <section className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
        <aside className="relative overflow-hidden rounded-xl bg-surface-low p-8 shadow-ambient sm:p-10">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-between">
            <div>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full bg-primary/12 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-primary"
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
            <div className="mt-12 grid grid-cols-3 gap-3 text-center">
              {["Clubs", "Matches", "Live"].map((item, index) => (
                <div key={item} className="rounded-lg bg-black/40 px-3 py-4">
                  <p className="font-headline text-2xl font-black text-primary">0{index + 1}</p>
                  <p className="mt-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="glass-panel rounded-xl p-5 shadow-ambient outline outline-1 outline-white/5 sm:p-8">
          <div className="mx-auto max-w-xl">{children}</div>
          <div className="mx-auto mt-6 max-w-xl">{footer}</div>
        </div>
      </section>
    </main>
  );
}
