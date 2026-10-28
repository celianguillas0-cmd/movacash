// Logo Movacash : le M blanc (repris de Movalink), sur fond noir.
export const M_PATHS = ["M0 0L26 0L50 32L74 0L100 0L50 66Z", "M0 8L26 42L26 100L0 100Z", "M100 8L74 42L74 100L100 100Z"];

export default function LogoM({ className = "mc-m" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      {M_PATHS.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
