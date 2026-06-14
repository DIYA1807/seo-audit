import { useState } from "react";
import { buildPlainText, buildHtmlReport, downloadFile } from "../utils/exportHelpers";

export default function ExportBar({ result }) {
  const [copied, setCopied] = useState(false);

  const copyReport = async () => {
    await navigator.clipboard.writeText(buildPlainText(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const hostname = new URL(result.url).hostname;
    downloadFile(JSON.stringify(result, null, 2), `seo-audit-${hostname}-${Date.now()}.json`, "application/json");
  };

  const downloadHtml = () => {
    const hostname = new URL(result.url).hostname;
    downloadFile(buildHtmlReport(result), `seo-audit-${hostname}-${Date.now()}.html`, "text/html");
  };

  const btnStyle = (accent) => ({
    background: "#0d1117",
    color: accent,
    border: `1px solid ${accent}44`,
    borderRadius: "5px",
    padding: "7px 14px",
    fontSize: "11px",
    fontFamily: "monospace",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
      <span style={{ color: "#333", fontSize: "11px", marginRight: "4px" }}>EXPORT:</span>
      <button onClick={copyReport} style={btnStyle(copied ? "#00ff88" : "#aaa")}>
        {copied ? "✓ COPIED!" : "⎘ Copy Report"}
      </button>
      <button onClick={downloadJson} style={btnStyle("#bf7fff")}>↓ JSON</button>
      <button onClick={downloadHtml} style={btnStyle("#00cfff")}>↓ HTML Report</button>
    </div>
  );
}
