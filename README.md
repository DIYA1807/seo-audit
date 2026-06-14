# 🔍 AI-Powered SEO Auditor

A browser-based SEO audit tool powered by the **Claude AI API**. Enter any URL and get a detailed SEO health report with actionable fixes — instantly.

![SEO Audit Tool](https://img.shields.io/badge/Built%20With-React-61dafb?style=flat-square&logo=react)
![Claude API](https://img.shields.io/badge/Powered%20By-Claude%20AI-00ff88?style=flat-square)
![Status](https://img.shields.io/badge/Status-Live-success?style=flat-square)

---

## ✨ Features

- **AI Analysis** — Claude analyzes any URL and returns real SEO issues with severity ratings
- **Score Ring** — Visual SEO health score (0–100) with Good / Fair / Poor indicator
- **Issue Cards** — Expandable cards with description, fix, and code snippet for each issue
- **Category Filters** — Filter by Meta, Content, OpenGraph, Schema, Performance, Accessibility
- **Severity Filters** — Quickly view Critical, Warning, or Info issues
- **Export Options**
  - Copy plain-text report to clipboard
  - Download raw JSON data
  - Download a styled standalone HTML report
- **Audit History** — Last 10 audits saved in-session, reload any past result in one click
- **Smart URL Validation** — Auto-adds `https://`, catches invalid domains, blocks localhost

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (JSX), plain CSS-in-JS |
| AI Backend | Anthropic Claude API (`claude-sonnet-4-6`) |
| Rendering | Claude.ai Artifact (no build step needed) |
| State | React `useState` hooks |
| Export | Blob API, Clipboard API |

---

## 🚀 How It Works

1. User enters a URL
2. URL is validated and normalized (auto `https://`)
3. A structured prompt is sent to Claude via `POST /v1/messages`
4. Claude returns a JSON audit report with score, issues, fixes, and passing checks
5. Results render with interactive filters and export options
6. Audit is saved to session history automatically

```
User Input → URL Validation → Claude API Prompt → JSON Parse → Render Results → Save History
```

---

## 📦 Audit Report Structure

Claude returns structured JSON on every audit:

```json
{
  "score": 72,
  "url": "https://example.com",
  "summary": "Brief SEO health overview...",
  "issues": [
    {
      "id": "issue_001",
      "title": "Missing meta description",
      "severity": "critical",
      "category": "Meta",
      "description": "Why this matters...",
      "fix": "What to do...",
      "code": "<meta name='description' content='...'>"
    }
  ],
  "passed": ["HTTPS enabled", "Mobile viewport set"],
  "stats": { "critical": 3, "warning": 5, "info": 2 }
}
```

---

## 🔍 SEO Checks Covered

- Title tag length and relevance
- Meta description presence and length
- Open Graph tags (og:title, og:description, og:image)
- Twitter Card metadata
- Canonical URL
- H1 / H2 heading structure
- Image alt attributes
- JSON-LD structured data / Schema.org
- Core Web Vitals hints
- Mobile viewport meta tag
- robots.txt and sitemap.xml
- HTTPS
- Internal linking structure

---

## 🏗️ Project Structure

```
seo-audit-tool/
├── seo-audit-tool.jsx   # Main React component (single file)
└── README.md
```

---

## 💡 What I Learned

- **Prompt Engineering** — Structuring prompts so Claude reliably returns valid JSON
- **API Error Handling** — Typed errors for rate limits, auth failures, network issues, JSON parse failures
- **React Patterns** — Component composition, lifting state, conditional rendering
- **Export APIs** — Using `Blob` + `URL.createObjectURL` for client-side file downloads
- **URL Validation** — Edge cases: missing protocol, localhost, invalid TLDs

---

## 🙋 About

Built by **Diya Bisht** — BCA Final Year, Graphic Era Hill University  
Focus: Cybersecurity & AI/ML  
GitHub: [@DIYA1807](https://github.com/DIYA1807)

---

> *"An SEO audit tool that actually explains the fix — not just the problem."*
