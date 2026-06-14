const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function runSeoAudit(url) {
  if (!API_KEY) throw new Error("API key missing. Add VITE_GEMINI_API_KEY to your .env file.");

  const prompt = `You are an expert SEO auditor. Analyze this URL: ${url}

Since you cannot directly fetch the page, perform a comprehensive audit based on best practices and known info about this domain.

Return ONLY a valid JSON object (no markdown, no backticks, no explanation):
{
  "score": <0-100>,
  "url": "${url}",
  "summary": "<2-3 sentence SEO health overview>",
  "issues": [
    { "id": "<id>", "title": "<title>", "severity": "<critical|warning|info>", "category": "<Meta|Content|OpenGraph|Schema|Performance|Accessibility>", "description": "<why it matters>", "fix": "<actionable fix>", "code": "<snippet or null>" }
  ],
  "passed": ["<passing checks>"],
  "stats": { "critical": <n>, "warning": <n>, "info": <n> }
}
Cover 8-14 issues: title, meta desc, OG tags, Twitter card, canonical, H1/H2, alt text, schema, Core Web Vitals, viewport, robots.txt, sitemap, HTTPS, internal links. Include 3-5 passed checks.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
      }),
    }
  );

  if (!response.ok) {
    const e = await response.json().catch(() => ({}));
    const msg = e?.error?.message || `HTTP ${response.status}`;
    if (response.status === 401 || response.status === 403) throw new Error("auth:" + msg);
    if (response.status === 429) throw new Error("ratelimit:" + msg);
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) throw new Error("Empty response. Try again.");

  let parsed;
  try {
    parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error("parse:Couldn't parse response. Try again.");
  }

  if (!parsed.score || !parsed.issues) throw new Error("parse:Incomplete data. Try again.");

  parsed.stats = {
    critical: parsed.issues.filter((i) => i.severity === "critical").length,
    warning: parsed.issues.filter((i) => i.severity === "warning").length,
    info: parsed.issues.filter((i) => i.severity === "info").length,
  };

  return parsed;
}
