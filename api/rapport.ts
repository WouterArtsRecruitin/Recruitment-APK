import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

/**
 * GET /api/rapport?id=<uuid>
 *   → Fetches rapport data from Supabase by UUID (primary path).
 *
 * GET /api/rapport?score=&cats=&email=&sig=...
 *   → Backward-compat for emails sent in the last 7 days that used the
 *     legacy URL-param scheme. Only honoured when `RAPPORT_URL_SECRET` env
 *     is set AND the HMAC signature verifies. Returns a minimal read-only
 *     view constructed from the signed params. Otherwise 404.
 *
 * The old fallback that accepted ?score=&cats=&ai=<base64> WITHOUT a
 * signature is gone — it allowed arbitrary score impersonation.
 */

/**
 * Verify HMAC signature over the legacy URL params. Uses first-16 hex chars
 * of SHA256(HMAC(secret, `score|cats|email`)). Rejects on any mismatch.
 */
function verifySig(params: URLSearchParams, secret: string): boolean {
  const sig = params.get('sig') || '';
  if (!sig) return false;
  const payload = `${params.get('score') || ''}|${params.get('cats') || ''}|${params.get('email') || ''}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16);
  if (sig.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = req.query.id as string | undefined;

  // --- PATH A: UUID lookup (primary, required going forward) ---
  if (id) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({ error: 'Ongeldig rapport ID' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ error: 'Server configuratie ontbreekt' });
    }

    const fetchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/apk_rapports?id=eq.${id}&select=*&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!fetchRes.ok) {
      return res.status(500).json({ error: 'Database fout' });
    }

    const rows = await fetchRes.json();
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Rapport niet gevonden' });
    }

    const row = rows[0];

    // Cache for 1 year (rapport data is immutable)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    return res.status(200).json({
      id: row.id,
      score: row.score,
      maxScore: row.max_score,
      scorePercent: row.score_percent,
      companyName: row.company_name,
      contactName: row.contact_name,
      sector: row.sector,
      categories: row.category_scores,
      individualScores: row.individual_scores,
      aiAnalysis: row.ai_analysis,
      createdAt: row.created_at,
    });
  }

  // --- PATH B: backward-compat signed legacy URL (only when RAPPORT_URL_SECRET is set) ---
  const RAPPORT_URL_SECRET = process.env.RAPPORT_URL_SECRET;
  if (!RAPPORT_URL_SECRET) {
    // Legacy path disabled by config — no id, no signed fallback → 404 hard.
    return res.status(404).json({ error: 'Rapport niet gevonden' });
  }

  // Build URLSearchParams from req.query. sig must be present.
  const sigParam = req.query.sig;
  if (!sigParam || typeof sigParam !== 'string') {
    return res.status(404).json({ error: 'Rapport niet gevonden' });
  }

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (typeof v === 'string') params.set(k, v);
  }

  if (!verifySig(params, RAPPORT_URL_SECRET)) {
    return res.status(404).json({ error: 'Rapport niet gevonden' });
  }

  // Signed legacy params accepted — return a minimal read-only view.
  // NOTE: we deliberately do NOT reconstruct AI analysis from client-supplied
  // base64; only score + cats + email can be trusted.
  const score = parseInt(params.get('score') || '0', 10) || 0;
  const cats = (params.get('cats') || '').split(',').map(s => parseInt(s, 10) || 0);
  const email = params.get('email') || '';

  res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
  return res.status(200).json({
    legacy: true,
    score,
    maxScore: 100,
    scorePercent: score,
    email,
    categories: cats,
    note: 'Dit rapport komt uit een eerdere (legacy) email. Voor volledige AI-analyse: open het rapport opnieuw via de /rapport?id=<uuid> URL.',
  });
}
