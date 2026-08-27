import { useState } from "react";
import jsPDF from "jspdf";
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

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const maxWidth = pageWidth - margin * 2;
    let y = 50;

    const severityColor = {
      critical: [255, 90, 90],
      warning: [230, 180, 30],
      info: [0, 150, 220],
    };

    const checkPageBreak = (needed = 20) => {
      if (y + needed > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = 50;
      }
    };

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    doc.text("SEO Audit Report", margin, y);
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(result.url, margin, y);
    y += 14;
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 28;

    // Score
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    const scoreColor = result.score >= 80 ? [0, 170, 90] : result.score >= 50 ? [220, 160, 20] : [220, 60, 60];
    doc.setTextColor(...scoreColor);
    doc.text(`${result.score}/100`, margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("SEO HEALTH SCORE", margin, y + 12);
    y += 34;

    // Summary
    doc.setFontSize(10.5);
    doc.setTextColor(50, 50, 50);
    const summaryLines = doc.splitTextToSize(result.summary || "", maxWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 14 + 20;

    // Stats row
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const stats = result.stats || {};
    doc.setTextColor(220, 60, 60);
    doc.text(`Critical: ${stats.critical || 0}`, margin, y);
    doc.setTextColor(200, 150, 20);
    doc.text(`Warning: ${stats.warning || 0}`, margin + 130, y);
    doc.setTextColor(0, 130, 190);
    doc.text(`Info: ${stats.info || 0}`, margin + 250, y);
    y += 26;

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 24;

    // Issues
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text(`Issues Found (${result.issues?.length || 0})`, margin, y);
    y += 20;

    (result.issues || []).forEach((issue, idx) => {
      checkPageBreak(60);

      const color = severityColor[issue.severity] || [100, 100, 100];
      doc.setFillColor(...color);
      doc.circle(margin + 3, y - 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(`${idx + 1}. ${issue.title}`, margin + 14, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...color);
      doc.text(`${issue.severity?.toUpperCase()} · ${issue.category}`, margin + 14, y);
      y += 14;

      doc.setFontSize(9.5);
      doc.setTextColor(70, 70, 70);
      const descLines = doc.splitTextToSize(issue.description || "", maxWidth - 14);
      checkPageBreak(descLines.length * 12 + 20);
      doc.text(descLines, margin + 14, y);
      y += descLines.length * 12 + 6;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 130, 90);
      doc.setFontSize(9);
      doc.text("Fix:", margin + 14, y);
      y += 12;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      const fixLines = doc.splitTextToSize(issue.fix || "", maxWidth - 14);
      checkPageBreak(fixLines.length * 12 + 10);
      doc.text(fixLines, margin + 14, y);
      y += fixLines.length * 12 + 20;
    });

    // Passed checks
    if (result.passed?.length > 0) {
      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(0, 150, 90);
      doc.text(`Passing Checks (${result.passed.length})`, margin, y);
      y += 20;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(70, 70, 70);
      result.passed.forEach((p) => {
        checkPageBreak(16);
        const lines = doc.splitTextToSize(`✓ ${p}`, maxWidth);
        doc.text(lines, margin, y);
        y += lines.length * 13;
      });
    }

    const hostname = new URL(result.url).hostname;
    doc.save(`seo-audit-${hostname}-${Date.now()}.pdf`);
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
      <button onClick={downloadPdf} style={btnStyle("#ff6b6b")}>↓ PDF</button>
    </div>
  );
}