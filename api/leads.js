export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, role, building, source, url } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const ts = new Date().toISOString();
  const key = `aibudget:lead:${Date.now()}`;

  // ── UPSTASH REDIS ──────────────────────────────────────────────────────────
  try {
    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, role, building, source, url, ts }),
    });
  } catch (e) { console.error('Upstash error', e); }

  // ── SLACK ──────────────────────────────────────────────────────────────────
  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🧮 *AI Build Budget Calculator — new lead*\n*Name:* ${name || '—'}\n*Email:* ${email}\n*Role:* ${role || '—'}\n*Building:* ${building || '—'}\n*Source:* ${source || '—'}`,
      }),
    });
  } catch (e) { console.error('Slack error', e); }

  // ── RESEND CONFIRMATION EMAIL ──────────────────────────────────────────────
  // Sends automatically on every form submission.
  // From: noreply@rncollins.com (verified via Cloudflare DNS — June 11 2026).
  // Sheet URL: native Google Sheet (not XLSX) — publicly viewable.
  const sheetUrl = 'https://drive.google.com/file/d/1ns5RSnNyDJrqFNNnuMCl_Y_49i5hogSn/view?usp=sharing';
  const firstName = name ? name.split(' ')[0] : 'there';
  const buildingLine = building
    ? `<p style="font-size:15px;line-height:1.7;">You mentioned you're building: <em>${building}</em>. If you have questions about scoping that, reply here — I'm happy to take a look.</p>`
    : '';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RN Collins <noreply@rncollins.com>',
        to: email,
        subject: 'Your AI Build Budget Calculator — PS Google Sheet',
        html: `
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1C1B1F;background:#F6F3EC;">
  <p style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;font-family:monospace;color:#B8842A;margin-bottom:24px;">
    Aloha AI Consulting · Honolulu, HI
  </p>

  <p style="font-size:16px;line-height:1.75;margin-bottom:16px;">Hi ${firstName},</p>

  <p style="font-size:15px;line-height:1.75;margin-bottom:16px;">
    Here is the Professional Services Google Sheet — a live spreadsheet version of the calculator you just used, with all formulas intact so you can customize it for your specific build.
  </p>

  <div style="margin:28px 0;">
    <a href="${sheetUrl}"
       style="display:inline-block;background:#1C1B1F;color:#F6F3EC;font-family:sans-serif;font-size:13px;font-weight:600;letter-spacing:0.05em;padding:14px 28px;border-radius:4px;text-decoration:none;">
      Open the PS Google Sheet →
    </a>
  </div>

  ${buildingLine}

  <p style="font-size:15px;line-height:1.75;margin-bottom:16px;">
    The full paid tool — build materials (26 line items), Year 1 ops costs, mobile app options (PWA / React Native / Native), and the 35-page practitioner's guide — launches at $97. You'll get early access at $67 as a founding buyer. I'll send you a direct link the moment it goes live.
  </p>

  <p style="font-size:15px;line-height:1.75;margin-bottom:32px;">
    Questions in the meantime — just reply here.
  </p>

  <p style="font-size:15px;line-height:1.75;">
    — RN Collins
  </p>

  <hr style="border:none;border-top:1px solid rgba(28,27,31,0.1);margin:32px 0;">

  <p style="font-size:11px;color:#999;font-family:monospace;letter-spacing:0.05em;">
    You received this because you signed up at ai-budget-calc-red.vercel.app ·
    <a href="mailto:collins.ra@northeastern.edu" style="color:#999;">Unsubscribe</a>
  </p>
</div>`,
      }),
    });
  } catch (e) { console.error('Resend error', e); }

  return res.status(200).json({ ok: true });
}
