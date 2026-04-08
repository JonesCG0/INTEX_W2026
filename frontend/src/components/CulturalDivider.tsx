export default function CulturalDivider({ className = "", variant = "hopi" }) {
  const patterns = {
    hopi: (
      <svg viewBox="0 0 1200 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" aria-hidden="true">
        <path d="M0 30 L40 10 L80 30 L120 10 L160 30 L200 10 L240 30 L280 10 L320 30 L360 10 L400 30 L440 10 L480 30 L520 10 L560 30 L600 10 L640 30 L680 10 L720 30 L760 10 L800 30 L840 10 L880 30 L920 10 L960 30 L1000 10 L1040 30 L1080 10 L1120 30 L1160 10 L1200 30" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
        <path d="M0 40 L40 20 L80 40 L120 20 L160 40 L200 20 L240 40 L280 20 L320 40 L360 20 L400 40 L440 20 L480 40 L520 20 L560 40 L600 20 L640 40 L680 20 L720 40 L760 20 L800 40 L840 20 L880 40 L920 20 L960 40 L1000 20 L1040 40 L1080 20 L1120 40 L1160 20 L1200 40" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2"/>
        <rect x="180" y="25" width="8" height="8" fill="currentColor" fillOpacity="0.15" transform="rotate(45 184 29)"/>
        <rect x="420" y="25" width="8" height="8" fill="currentColor" fillOpacity="0.15" transform="rotate(45 424 29)"/>
        <rect x="660" y="25" width="8" height="8" fill="currentColor" fillOpacity="0.15" transform="rotate(45 664 29)"/>
        <rect x="900" y="25" width="8" height="8" fill="currentColor" fillOpacity="0.15" transform="rotate(45 904 29)"/>
      </svg>
    ),
    step: (
      <svg viewBox="0 0 1200 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" aria-hidden="true">
        <path d="M0 35 L50 35 L50 25 L100 25 L100 15 L150 15 L150 5 L200 5 L200 15 L250 15 L250 25 L300 25 L300 35 L350 35 L350 25 L400 25 L400 15 L450 15 L450 5 L500 5 L500 15 L550 15 L550 25 L600 25 L600 35 L650 35 L650 25 L700 25 L700 15 L750 15 L750 5 L800 5 L800 15 L850 15 L850 25 L900 25 L900 35 L950 35 L950 25 L1000 25 L1000 15 L1050 15 L1050 5 L1100 5 L1100 15 L1150 15 L1150 25 L1200 25" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25"/>
      </svg>
    ),
    wave: (
      <svg viewBox="0 0 1200 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" aria-hidden="true">
        <path d="M0 25 Q150 0 300 25 Q450 50 600 25 Q750 0 900 25 Q1050 50 1200 25" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25"/>
        <path d="M0 30 Q150 5 300 30 Q450 55 600 30 Q750 5 900 30 Q1050 55 1200 30" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15"/>
      </svg>
    ),
  };

  return (
    <div className={`text-muted ${className}`}>
      {patterns[variant] || patterns.hopi}
    </div>
  );
}