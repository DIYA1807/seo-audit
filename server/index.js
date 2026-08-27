import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Cache lives OUTSIDE the route handler so it persists across requests
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

app.post("/api/audit", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        const cached = cache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return res.json({ ...cached.data, fromCache: true });
        }
        const pageRes = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (SEO-Audit-Bot)" },
            timeout: 10000,
        });

        if (!pageRes.ok) {
            return res.status(400).json({ error: `Could not fetch URL (HTTP ${pageRes.status})` });
        }

        const html = await pageRes.text();
        const $ = cheerio.load(html);

        const extracted = {
            title: $("title").text() || null,
            metaDescription: $('meta[name="description"]').attr("content") || null,
            canonical: $('link[rel="canonical"]').attr("href") || null,
            ogTitle: $('meta[property="og:title"]').attr("content") || null,
            ogDescription: $('meta[property="og:description"]').attr("content") || null,
            ogImage: $('meta[property="og:image"]').attr("content") || null,
            twitterCard: $('meta[name="twitter:card"]').attr("content") || null,
            viewport: $('meta[name="viewport"]').attr("content") || null,
            robotsMeta: $('meta[name="robots"]').attr("content") || null,
            h1Count: $("h1").length,
            h1Text: $("h1").first().text() || null,
            h2Count: $("h2").length,
            totalImages: $("img").length,
            imagesWithoutAlt: $("img:not([alt])").length,
            hasSchema: $('script[type="application/ld+json"]').length > 0,
            internalLinks: $(`a[href^="/"], a[href*="${new URL(url).hostname}"]`).length,
            isHttps: url.startsWith("https://"),
        };

        const prompt = `You are an expert SEO auditor. Here is REAL extracted data from ${url}:

${JSON.stringify(extracted, null, 2)}

Based on this actual data, return ONLY a valid JSON object (no markdown, no backticks, no explanation):
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
Base every issue strictly on the extracted data above — do not invent facts. Flag missing title, missing/short meta description, missing OG tags, missing canonical, missing/multiple H1, images without alt, missing schema, missing viewport, non-HTTPS. Include 3-5 passed checks for things that ARE present.`;

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }],
        });

        const text = completion.choices?.[0]?.message?.content || "";
        let parsed;
        try {
            parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        } catch {
            return res.status(500).json({ error: "parse:Couldn't parse AI response. Try again." });
        }

        parsed.stats = {
            critical: parsed.issues.filter((i) => i.severity === "critical").length,
            warning: parsed.issues.filter((i) => i.severity === "warning").length,
            info: parsed.issues.filter((i) => i.severity === "info").length,
        };
        parsed.extracted = extracted;

        cache.set(url, { data: parsed, timestamp: Date.now() });

        res.json(parsed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || "Something went wrong" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));