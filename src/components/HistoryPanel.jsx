import { useState } from "react";

const scoreColor = (s) => (s >= 80 ? "#00ff88" : s >= 50 ? "#ffcc00" : "#ff6b6b");

export default function HistoryPanel({ history, onLoad, onClear }) {
  const [open, setOpen] = useState(false);
  if (history.length === 0) return null;

  return (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "1px solid #1e2a3a",
          borderRadius: "5px",
          color: "#555",
          fontSize: "11px",
          fontFamily: "monospace",
          padding: "5px 12px",
          cursor: "pointer",
        }}
      >
        {open ? "▲" : "▼"} HISTORY ({history.length})
      </button>

      {open && (
        <div style={{ background: "#0a0f1a", border: "1px solid #1e2a3a", borderRadius: "6px", padding: "12px", marginTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ color: "#333", fontSize: "11px", letterSpacing: "1px" }}>PAST AUDITS</span>
            <button
              onClick={onClear}
              style={{ background: "none", border: "1px solid #ff6b6b33", color: "#ff6b6b88", fontSize: "10px", fontFamily: "monospace", padding: "2px 8px", borderRadius: "3px", cursor: "pointer" }}
            >
              Clear All
            </button>
          </div>

          {history.map((h) => (
            <div
              key={h.id}
              onClick={() => { onLoad(h); setOpen(false); }}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "4px", cursor: "pointer", marginBottom: "4px", background: "#0d1117", border: "1px solid #1e2a3a" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#00ff8844")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e2a3a")}
            >
              <div>
                <div style={{ color: "#ccc", fontSize: "12px", marginBottom: "2px" }}>
                  {new URL(h.url).hostname}
                </div>
                <div style={{ color: "#444", fontSize: "10px" }}>{h.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: scoreColor(h.score), fontSize: "18px", fontWeight: "bold" }}>{h.score}</div>
                <div style={{ color: "#333", fontSize: "10px" }}>{h.issues} issues</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
