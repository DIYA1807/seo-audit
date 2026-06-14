import { useState } from "react";
import { runSeoAudit } from "./api/claude";
import { validateUrl, friendlyError } from "./utils/validateUrl";
import ScoreRing from "./components/ScoreRing";
import IssueCard from "./components/IssueCard";
import ExportBar from "./components/ExportBar";
import HistoryPanel from "./components/HistoryPanel";
import ErrorBanner from "./components/ErrorBanner";

const CATEGORIES = ["Meta", "Content", "OpenGraph", "Schema", "Performance", "Accessibility"];
const CAT_COLORS = {
  Meta: "#00ff88", Content: "#00cfff", OpenGraph: "#bf7fff",
  Schema: "#ffcc00", Performance: "#ff6b6b", Accessibility: "#ff9f43",
};

export default function App() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [log, setLog] = useState([]);
  const [history, setHistory] = useState([]);

  const addLog = (msg) => setLog((prev) => [...prev, msg]);

  const saveToHistory = (auditResult) => {
    const entry = {
      id: Date.now(),
      url: auditResult.url,
      score: auditResult.score,
      issues: auditResult.issues.length,
      date: new Date().toLocaleString(),
      full: auditResult,
    };
    setHistory((prev) => [entry, ...prev].slice(0, 10));
  };

  const handleAudit = async () => {
    const validation = validateUrl(url);
    if (!validation.ok) { setUrlError(validation.msg); return; }

    const cleanUrl = validation.normalized;
    setLoading(true);
    setResult(null);
    setError(null);
    setUrlError(null);
    setActiveFilter("All");
    setLog([]);

    try {
      addLog("⟳ Initializing audit engine...");
      addLog(`⟳ Target: ${cleanUrl}`);
      addLog("⟳ Running Claude SEO analysis...");

      const data = await runSeoAudit(cleanUrl);

      addLog("✓ Analysis complete");
      addLog(`✓ Issues found: ${data.issues.length}`);
      addLog(`✓ SEO Score: ${data.score}/100`);

      setResult(data);
      saveToHistory(data);
    } catch (err) {
      const friendly = friendlyError(err);
      addLog("✗ " + friendly.message);
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (h) => {
    setResult(h.full);
    setUrl(h.url);
    setLog([]);
    setError(null);
    setActiveFilter("All");
  };

  const filtered = result?.issues?.filter((i) =>
    activeFilter === "All" ? true : i.category === activeFilter || i.severity === activeFilter
  ) || [];

  const inputBorder = urlError ? "#ff6b6b" : loading ? "#00ff8866" : "#1e2a3a";

  return (
    <div style={{ background: "#060910", minHeight: "100vh", fontFamily: "monospace", color: "#e0e0e0", padding: "24px 20px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ color: "#00ff88", fontSize: "11px", letterSpacing: "3px", marginBottom: "4px" }}>▸ SEO AUDIT ENGINE v1.3</div>
          <h1 style={{ color: "#ffffff", fontSize: "26px", fontWeight: "bold", margin: 0 }}>AI-Powered SEO Auditor</h1>
          <p style={{ color: "#555", fontSize: "12px", marginTop: "4px" }}>Claude-backed analysis · Real fixes · Zero guesswork</p>
        </div>

        {/* History */}
        <HistoryPanel history={history} onLoad={loadFromHistory} onClear={() => setHistory([])} />

        {/* Input */}
        <div style={{ marginBottom: urlError ? "6px" : "20px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={url}
              onChange={(e) => { setUrl(e.target.value); if (urlError) setUrlError(null); }}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleAudit()}
              placeholder="https://yoursite.com"
              style={{ flex: 1, background: "#0d1117", border: `1px solid ${inputBorder}`, borderRadius: "6px", color: "#00ff88", padding: "12px 16px", fontSize: "13px", fontFamily: "monospace", outline: "none" }}
            />
            <button
              onClick={handleAudit}
              disabled={loading}
              style={{ background: loading ? "#1a1a2e" : "#00ff88", color: loading ? "#444" : "#060910", border: "none", borderRadius: "6px", padding: "12px 24px", fontSize: "13px", fontWeight: "bold", fontFamily: "monospace", cursor: loading ? "not-allowed" : "pointer", minWidth: "110px" }}
            >
              {loading ? "SCANNING..." : "RUN AUDIT"}
            </button>
          </div>
          {urlError && (
            <div style={{ color: "#ff6b6b", fontSize: "11px", marginTop: "6px", paddingLeft: "4px" }}>✗ {urlError}</div>
          )}
        </div>

        {/* Log terminal */}
        {log.length > 0 && (
          <div style={{ background: "#0a0f1a", border: "1px solid #1e2a3a", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px" }}>
            {log.map((l, i) => (
              <div key={i} style={{ color: l.startsWith("✗") ? "#ff6b6b" : l.startsWith("✓") ? "#00ff88" : "#444", fontSize: "12px", marginBottom: "2px" }}>
                {l}
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && <ErrorBanner message={error.message} hint={error.hint} />}

        {/* Results */}
        {result && (
          <>
            <ExportBar result={result} />

            {/* Score + stats */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div style={{ background: "#0d1117", border: "1px solid #1e2a3a", borderRadius: "10px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px" }}>
                <ScoreRing score={result.score} />
                <div>
                  <div style={{ color: "#555", fontSize: "10px", marginBottom: "6px", letterSpacing: "1px" }}>SEO HEALTH SCORE</div>
                  <div style={{ color: "#aaa", fontSize: "11px", maxWidth: "240px", lineHeight: "1.7" }}>{result.summary}</div>
                  <div style={{ color: "#333", fontSize: "10px", marginTop: "8px" }}>↳ {result.url}</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, minWidth: "160px" }}>
                {[
                  { label: "CRITICAL", key: "critical", color: "#ff6b6b" },
                  { label: "WARNING", key: "warning", color: "#ffcc00" },
                  { label: "INFO", key: "info", color: "#00cfff" },
                ].map((s) => (
                  <div
                    key={s.key}
                    onClick={() => setActiveFilter(activeFilter === s.key ? "All" : s.key)}
                    style={{ background: activeFilter === s.key ? s.color + "18" : "#0d1117", border: `1px solid ${s.color}${activeFilter === s.key ? "66" : "22"}`, borderLeft: `3px solid ${s.color}`, borderRadius: "6px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  >
                    <span style={{ color: s.color, fontSize: "11px" }}>{s.label}</span>
                    <span style={{ color: "#fff", fontSize: "22px", fontWeight: "bold" }}>{result.stats?.[s.key] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category filters */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
              {["All", ...CATEGORIES].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{ background: activeFilter === f ? "#00ff88" : "#0d1117", color: activeFilter === f ? "#060910" : "#666", border: "1px solid #1e2a3a", borderRadius: "4px", padding: "4px 10px", fontSize: "11px", fontFamily: "monospace", cursor: "pointer" }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Issues */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ color: "#333", fontSize: "11px", marginBottom: "10px" }}>
                SHOWING {filtered.length} OF {result.issues.length} ISSUES
              </div>
              {filtered.length === 0
                ? <div style={{ color: "#333", fontSize: "12px", padding: "20px", textAlign: "center" }}>No issues in this category.</div>
                : filtered.map((issue) => <IssueCard key={issue.id} issue={issue} />)
              }
            </div>

            {/* Passing checks */}
            {result.passed?.length > 0 && (
              <div style={{ background: "#0a1a10", border: "1px solid #00ff8818", borderRadius: "8px", padding: "16px 20px" }}>
                <div style={{ color: "#00ff88", fontSize: "11px", marginBottom: "10px", letterSpacing: "2px" }}>✓ PASSING CHECKS</div>
                {result.passed.map((p, i) => (
                  <div key={i} style={{ color: "#555", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ color: "#00ff8888" }}>✓ </span>{p}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!result && !loading && log.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px", color: "#1a2a1a" }}>◎</div>
            <div style={{ fontSize: "13px", color: "#333" }}>Enter a URL above and press Run Audit</div>
            <div style={{ fontSize: "11px", marginTop: "6px", color: "#222" }}>Claude will analyze SEO health and return actionable fixes</div>
          </div>
        )}

      </div>
    </div>
  );
}
