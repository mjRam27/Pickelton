// web/components/Logo.tsx
// Pickelton mark: a perforated ball with speed lines. Brand colours are fixed in both themes.
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 112 112" width={size}>
      <circle cx="54" cy="48" fill="#C8F03C" r="34" />
      <g fill="#0C100E">
        <circle cx="42" cy="34" r="4" /><circle cx="60" cy="30" r="4" /><circle cx="70" cy="48" r="4" />
        <circle cx="58" cy="64" r="4" /><circle cx="40" cy="56" r="4" /><circle cx="54" cy="47" r="3.2" />
      </g>
      <path d="M4 34h12M0 48h12M6 62h10" stroke="#C8F03C" strokeLinecap="round" strokeWidth="5" />
    </svg>
  );
}
