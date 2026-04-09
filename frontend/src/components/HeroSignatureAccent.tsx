interface HeroSignatureAccentProps {
  className?: string;
}

export default function HeroSignatureAccent({ className = "" }: HeroSignatureAccentProps) {
  return (
    <svg viewBox="0 0 1200 120" className={className} aria-hidden="true">
      <path
        d="M0 70 L60 30 L120 70 L180 30 L240 70 L300 30 L360 70 L420 30 L480 70 L540 30 L600 70 L660 30 L720 70 L780 30 L840 70 L900 30 L960 70 L1020 30 L1080 70 L1140 30 L1200 70"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0 92 L60 52 L120 92 L180 52 L240 92 L300 52 L360 92 L420 52 L480 92 L540 52 L600 92 L660 52 L720 92 L780 52 L840 92 L900 52 L960 92 L1020 52 L1080 92 L1140 52 L1200 92"
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}
