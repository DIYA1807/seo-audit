export function validateUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, msg: "URL cannot be empty." };

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const u = new URL(withProtocol);
    if (!["http:", "https:"].includes(u.protocol))
      return { ok: false, msg: "Only http/https URLs are supported." };
    if (!u.hostname.includes("."))
      return { ok: false, msg: "Enter a valid domain (e.g. example.com)." };
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1")
      return { ok: false, msg: "Localhost URLs can't be audited. Use a live URL." };
    return { ok: true, normalized: withProtocol };
  } catch {
    return { ok: false, msg: "Invalid URL. Try: https://yoursite.com" };
  }
}

export function friendlyError(err) {
  const msg = err.message || "";
  if (msg.startsWith("auth:"))
    return { message: "Authentication failed.", hint: "Check your API key in the .env file." };
  if (msg.startsWith("ratelimit:"))
    return { message: "Rate limit hit.", hint: "Wait a few seconds and try again." };
  if (msg.startsWith("parse:"))
    return { message: msg.replace("parse:", ""), hint: "Try running the audit again." };
  if (msg.startsWith("empty:"))
    return { message: "Empty response from Claude.", hint: "Try again." };
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("Failed to fetch"))
    return { message: "Network error.", hint: "Check your internet connection." };
  if (msg.includes("API key missing"))
    return { message: "API key not set.", hint: "Add VITE_ANTHROPIC_API_KEY to your .env file." };
  return { message: msg, hint: "If this keeps happening, try a different URL." };
}
