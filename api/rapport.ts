import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/rapport?id=<uuid>
 * Fetches rapport data from Supabase by UUID.
 * Returns JSON with all scoring data + AI analysis.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = req.query.id as string | undefined;
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
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
