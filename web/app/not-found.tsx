// web/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="centerPage">
      <div className="vstack" style={{ gap: 16, maxWidth: 520 }}>
        <svg aria-hidden="true" viewBox="0 0 390 300" width="100%">
          <g fill="none" stroke="var(--line)" strokeWidth="3"><path d="M60 20h270v260H60z" /><path d="M60 150h270M195 20v80M195 200v80M60 100h270M60 200h270" /></g>
          <path d="M110 270 Q230 90 352 50" fill="none" stroke="var(--acc)" strokeDasharray="4 8" strokeWidth="2.5" />
          <circle cx="356" cy="46" fill="var(--acc)" r="22" />
          <path d="M330 10 384 82" stroke="var(--hot)" strokeLinecap="round" strokeWidth="3" />
        </svg>
        <span style={{ color: "var(--hot-ink)", fontSize: 13, fontWeight: 800, letterSpacing: "0.12em" }}>ERROR 404 · LINE CALL</span>
        <h1 className="display" style={{ fontSize: 96, lineHeight: 0.85 }}>That&apos;s<br />out!</h1>
        <p className="muted" style={{ lineHeight: 1.5, margin: 0 }}>This page landed past the baseline. It may have moved, or the link is from an event that has ended.</p>
        <div className="row">
          <Link className="btn primary" href="/home">Back to Home</Link>
          <Link className="btn" href="/tournaments">Browse events</Link>
        </div>
      </div>
    </main>
  );
}
