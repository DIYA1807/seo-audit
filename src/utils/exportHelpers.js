export function buildPlainText(result) {
  const date = new Date().toLocaleString();
  const lines = [
    `SEO AUDIT REPORT`,
    `Generated: ${date}`,
    `URL: ${result.url}`,
    `Score: ${result.score}/100`,
    ``,
    `SUMMARY`,
    result.summary,
    ``,
    `ISSUES (${result.issues.length} total)`,
    `Critical: ${result.stats.critical} | Warning: ${result.stats.warning} | Info: ${result.stats.info}`,
    ``,
  ];

  result.issues.forEach((issue, i) => {
    lines.push(`${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title} (${issue.category})`);
    lines.push(`   ${issue.description}`);
    lines.push(`   FIX: ${issue.fix}`);
    if (issue.code)
      lines.push(`   CODE:\n${issue.code.split("\n").map((l) => "   " + l).join("\n")}`);
    lines.push(``);
  });

  if (result.passed?.length) {
    lines.push(`PASSING CHECKS`);
    result.passed.forEach((p) => lines.push(`✓ ${p}`));
  }

  return lines.join("\n");
}

export function buildHtmlReport(result) {
  const date = new Date().toLocaleString();
  const scoreColor = result.score >= 80 ? "#00ff88" : result.score >= 50 ? "#ffcc00" : "#ff6b6b";
  const sevColor = (s) =>
    s === "critical" ? "#ff6b6b" : s === "warning" ? "#ffcc00" : "#00cfff";
  const catColor = (c) =>
    ({ Meta: "#00ff88", Content: "#00cfff", OpenGraph: "#bf7fff", Schema: "#ffcc00", Performance: "#ff6b6b", Accessibility: "#ff9f43" }[c] || "#aaa");

  const issueRows = result.issues
    .map(
      (issue) => `
    <div style="background:#0d1117;border:1px solid #1e2a3a;border-left:3px solid ${sevColor(issue.severity)};border-radius:6px;padding:14px 18px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div>
          <span style="color:${sevColor(issue.severity)};font-size:10px;font-weight:bold;text-transform:uppercase;margin-right:10px;">${issue.severity}</span>
          <span style="color:#e0e0e0;font-size:13px;">${issue.title}</span>
        </div>
        <span style="color:${catColor(issue.category)};font-size:10px;border:1px solid ${catColor(issue.category)}44;padding:2px 7px;border-radius:3px;">${issue.category}</span>
      </div>
      <p style="color:#aaa;font-size:12px;margin:0 0 8px;line-height:1.7;">${issue.description}</p>
      <div style="background:#0a1a10;border:1px solid #00ff8822;border-radius:4px;padding:8px 12px;font-size:11px;">
        <span style="color:#00ff88;">✦ FIX: </span><span style="color:#ccc;">${issue.fix}</span>
      </div>
      ${issue.code ? `<pre style="background:#0a0f1a;color:#7dd3fc;font-size:11px;padding:10px;border-radius:4px;margin-top:8px;overflow-x:auto;white-space:pre-wrap;">${issue.code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>` : ""}
    </div>`
    )
    .join("");

  const passedRows = (result.passed || [])
    .map((p) => `<div style="color:#555;font-size:12px;margin-bottom:4px;"><span style="color:#00ff8888;">✓ </span>${p}</div>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SEO Audit — ${result.url}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{background:#060910;color:#e0e0e0;font-family:monospace;padding:32px 20px;}</style>
</head>
<body>
<div style="max-width:820px;margin:0 auto;">
  <div style="color:#00ff88;font-size:11px;letter-spacing:3px;margin-bottom:4px;">▸ SEO AUDIT REPORT</div>
  <h1 style="color:#fff;font-size:22px;margin-bottom:4px;">AI-Powered SEO Auditor</h1>
  <p style="color:#555;font-size:11px;margin-bottom:24px;">Generated: ${date} · <a href="${result.url}" style="color:#00ff88;" target="_blank">${result.url}</a></p>
  <div style="background:#0d1117;border:1px solid #1e2a3a;border-radius:10px;padding:24px;display:flex;align-items:center;gap:24px;margin-bottom:24px;flex-wrap:wrap;">
    <div style="text-align:center;">
      <div style="font-size:52px;font-weight:bold;color:${scoreColor};">${result.score}</div>
      <div style="color:#888;font-size:11px;">/100 SEO SCORE</div>
    </div>
    <div style="flex:1;min-width:200px;">
      <p style="color:#aaa;font-size:12px;line-height:1.7;margin-bottom:12px;">${result.summary}</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <span style="color:#ff6b6b;font-size:11px;">● ${result.stats.critical} Critical</span>
        <span style="color:#ffcc00;font-size:11px;">● ${result.stats.warning} Warning</span>
        <span style="color:#00cfff;font-size:11px;">● ${result.stats.info} Info</span>
      </div>
    </div>
  </div>
  <div style="color:#555;font-size:11px;letter-spacing:1px;margin-bottom:12px;">ISSUES</div>
  ${issueRows}
  ${result.passed?.length ? `<div style="background:#0a1a10;border:1px solid #00ff8818;border-radius:8px;padding:16px 20px;margin-top:16px;"><div style="color:#00ff88;font-size:11px;letter-spacing:2px;margin-bottom:10px;">✓ PASSING CHECKS</div>${passedRows}</div>` : ""}
</div>
</body>
</html>`;
}

export function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
