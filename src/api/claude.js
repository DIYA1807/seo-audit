export async function runSeoAudit(url) {
  const response = await fetch("http://localhost:5000/api/audit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.error || `HTTP ${response.status}`;
    if (response.status === 401 || response.status === 403) throw new Error("auth:" + msg);
    if (response.status === 429) throw new Error("ratelimit:" + msg);
    throw new Error(msg);
  }

  return data;
}