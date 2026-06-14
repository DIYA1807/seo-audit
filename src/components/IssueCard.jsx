import { useState } from "react";

const CAT_COLORS = {
  Meta: "#00ff88",
  Content: "#00cfff",
  OpenGraph: "#bf7fff",
  Schema: "#ffcc00",
  Performance: "#ff6b6b",
  Accessibility: "#ff9f43",
};

export default function IssueCard({ issue }) {
  const [open, setOpen] = useState(false);
  const sevColor = issue.severity === "critical" ? "#ff6b6b" : issue.severity === "warning" ? "#ffcc00" : "#00cfff";
  const catColor = CAT_COLORS[issue.category] || "#aaa";

  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: "#0d1117",
        border: `1px solid ${open ? sevColor + "66" : "#1e2a3a"}`,
        borderLeft: `3px solid ${sevColor}`,
        borderRadius: "6px",
        padding: "12px 16px",
        cursor: "pointer",
        marginBottom: "8px",
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: sevColor, fontSize: "10px", fontFamily: "monospace", textTransform: "uppercase", fontWeight: "bold", minWidth: "52px" }}>
            {issue.severity}
          </span>
          <span style={{ color: "#e0e0e0", fontSize: "13px", fontFamily: "monospace" }}>{issue.title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: catColor, fontSize: "10px", fontFamily: "monospace", border: `1px solid ${catColor}44`, padding: "2px 7px", borderRadius: "3px" }}>
            {issue.category}
          </span>
          <span style={{ color: "#444", fontSize: "11px" }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: "10px", borderTop: "1px solid #1e2a3a", paddingTop: "10px" }}>
          <p style={{ color: "#aaa", fontSize: "12px", fontFamily: "monospace", marginBottom: "8px", lineHeight: "1.7" }}>
            {issue.description}
          </p>
          <div style={{ background: "#0a1a10", border: "1px solid #00ff8822", borderRadius: "4px", padding: "8px 12px" }}>
            <span style={{ color: "#00ff88", fontSize: "11px", fontFamily: "monospace" }}>✦ FIX: </span>
            <span style={{ color: "#ccc", fontSize: "11px", fontFamily: "monospace" }}>{issue.fix}</span>
          </div>
          {issue.code && (
            <pre style={{
              background: "#0a0f1a", color: "#7dd3fc", fontSize: "11px",
              fontFamily: "monospace", padding: "10px 12px", borderRadius: "4px",
              marginTop: "8px", overflowX: "auto", whiteSpace: "pre-wrap",
              border: "1px solid #1e3a5a",
            }}>
              {issue.code}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
