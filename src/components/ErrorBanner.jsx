export default function ErrorBanner({ message, hint }) {
  return (
    <div style={{
      background: "#140808",
      border: "1px solid #ff6b6b44",
      borderLeft: "3px solid #ff6b6b",
      borderRadius: "6px",
      padding: "12px 16px",
      marginBottom: "20px",
    }}>
      <div style={{ color: "#ff6b6b", fontSize: "12px", fontFamily: "monospace", marginBottom: hint ? "4px" : 0 }}>
        ✗ {message}
      </div>
      {hint && (
        <div style={{ color: "#666", fontSize: "11px", fontFamily: "monospace" }}>→ {hint}</div>
      )}
    </div>
  );
}
