function PickeltonLogoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Paddle head */}
      <circle cx="14" cy="13" r="7.5" />
      {/* Handle */}
      <path d="M9 18.5c-1.8 2-3.2 4-4.2 6.2" />
    </svg>
  );
}