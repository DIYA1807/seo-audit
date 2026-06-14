export default function ScoreRing({ score }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#00ff88" : score >= 50 ? "#ffcc00" : "#ff6b6b";
  const label = score >= 80 ? "GOOD" : score >= 50 ? "FAIR" : "POOR";

  return (
    <div style={{ textAlign: "center" }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#1a1a2e" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
        <text x="65" y="58" textAnchor="middle" fill={color} fontSize="26" fontWeight="bold" fontFamily="monospace">{score}</text>
        <text x="65" y="74" textAnchor="middle" fill="#888" fontSize="10" fontFamily="monospace">/100</text>
      </svg>
      <div style={{ color, fontSize: "10px", fontFamily: "monospace", letterSpacing: "2px", marginTop: "-6px" }}>
        {label}
      </div>
    </div>
  );
}
