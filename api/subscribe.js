/* POST /api/subscribe {email} → adds the address to the Perks Ledger contact list in Resend.
   Env: RESEND_API_KEY (required), RESEND_SEGMENT_ID (optional: the list/segment to put contacts in). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "method_not_allowed" }); }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  if (body.company) return res.status(200).json({ ok: true }); // honeypot field: bots fill it, people never see it
  const email = String(body.email || "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return res.status(400).json({ error: "invalid_email" });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ error: "not_configured" });
  const segment = process.env.RESEND_SEGMENT_ID;
  try {
    const r = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email, unsubscribed: false, ...(segment ? { segments: [{ id: segment }] } : {}) }),
    });
    if (r.ok) return res.status(200).json({ ok: true });
    const text = await r.text();
    if (/already exist/i.test(text)) return res.status(200).json({ ok: true });
    console.error("resend contacts", r.status, text.slice(0, 300));
    return res.status(502).json({ error: "upstream" });
  } catch (e) {
    console.error("resend contacts", e && e.message);
    return res.status(502).json({ error: "upstream" });
  }
};
