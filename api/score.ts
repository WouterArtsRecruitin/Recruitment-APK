import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// ============================================================================
// CONFIGURATIE
// ============================================================================

const PIPEDRIVE_API_TOKEN = process.env.PIPEDRIVE_API_TOKEN || '';
const PIPEDRIVE_PIPELINE_ID = 14;
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
// Score threshold: 60% van 100 = 60 punten → Path A (sales outreach)
const SCORE_THRESHOLD = 60;
const MAX_SCORE = 100; // 4 categorieën × 25 punten
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

// ============================================================================
// TYPES
// ============================================================================

interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  percent: number;
  questionCount: number;
}

interface ScoredLead {
  email: string;
  companyName: string;
  contactName: string;
  phone: string;
  sector: string;
  teamSize: string;
  score: number;
  scorePercent: number;
  categories: CategoryScore[];
  answers: Record<string, string>;
}

// ============================================================================
// SCORING — 29 vragen → 4 categorieën (0-25 elk, totaal 0-100)
// ============================================================================

// Vraagnummers (1-indexed, zoals in questions.js) per categorie
// Processen: evaluatie(1), doorlooptijd(6), documentatie(8), reactiesnelheid(14), samenwerking(5)
// Technologie: tools(4), screening(19), video(27), assessment(22)
// Talent: branding(7), intern(9), proactief(12), marketing(16), referral(17), talentpool(21), social(25), D&I(13)
// Data: effectiviteit(3), training(10), datadriven(11), feedback(20), ROI(23), communicatie(24), salary(26), partners(28), improvement(29), cultural(18)

const CATEGORY_QUESTIONS: Record<string, number[]> = {
  'Processen': [1, 5, 6, 8, 14],       // 5 vragen → max 50 raw → schaal naar 25
  'Technologie': [4, 19, 22, 27],       // 4 vragen → max 40 raw → schaal naar 25
  'Talent Attraction': [7, 9, 12, 13, 16, 17, 21, 25], // 8 vragen → max 80 raw → schaal naar 25
  'Data & Analytics': [2, 3, 10, 11, 15, 18, 20, 23, 24, 26, 28, 29], // 12 vragen → max 120 raw → schaal naar 25
};

function scoreAnswer(answerText: string): number {
  if (!answerText) return 0;
  const v = answerText.toLowerCase();

  // 10 punten — top niveau
  if (v.includes('volledig') || v.includes('advanced') || v.includes('geavanceerd') ||
      v.includes('ai-') || v.includes('predictive') || v.includes('continuous') ||
      v.includes('40%+') || v.includes('minder dan 1') || v.includes('dynamic') ||
      v.includes('premium') || v.includes('high-performance') || v.includes('award') ||
      v.includes('personalized') || v.includes('integrated') || v.includes('binnen 24') ||
      v.includes('real-time') || v.includes('innovation') || v.includes('voortdurend') ||
      v.includes('maandelijks met data')) {
    return 10;
  }

  // 7 punten — goed niveau
  if (v.includes('gestructureer') || v.includes('regulier') || v.includes('actieve') ||
      v.includes('kwartaal') || v.includes('25-40%') || v.includes('1-2 maanden') ||
      v.includes('uitgebreid') || v.includes('proactieve') || v.includes('multi-') ||
      v.includes('automated') || v.includes('systematisch') || v.includes('strategisch') ||
      v.includes('binnen een week') || v.includes('professionele')) {
    return 7;
  }

  // 3 punten — basis niveau
  if (v.includes('basis') || v.includes('basic') || v.includes('ad-hoc') ||
      v.includes('jaarlijks') || v.includes('10-25%') || v.includes('2-3 maanden') ||
      v.includes('informeel') || v.includes('occasione') || v.includes('standard') ||
      v.includes('bij aanstelling')) {
    return 3;
  }

  // 0 punten — niet aanwezig
  if (v.includes('nooit') || v.includes('geen') || v.includes('niet') ||
      v.includes('helemaal niet') || v.includes('alleen') || v.includes('handmatig') ||
      v.includes('minimale') || v.includes('0-10%') || v.includes('meer dan 3')) {
    return 0;
  }

  return 0; // Onherkenbaar
}

function calculateCategoryScores(data: Record<string, string>): CategoryScore[] {
  // Bouw een map van vraagnummer → antwoordtekst
  // JotForm vragen Q15-Q43 = assessment vragen 1-29
  const questionAnswers: Record<number, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (!value || typeof value !== 'string') continue;
    const lk = key.toLowerCase();

    // Skip contactvelden
    if (['email', 'naam', 'bedrijf', 'telefoon', 'sector', 'provincie', 'formid', 'submissionid', 'versturen'].some(s => lk.includes(s))) continue;

    // Probeer vraagnummer te extracten uit JotForm key (q15_, q16_, etc.)
    const qMatch = key.match(/q(\d+)/i);
    if (qMatch) {
      const qNum = parseInt(qMatch[1]);
      // Q15 in JotForm = vraag 1, Q16 = vraag 2, etc.
      if (qNum >= 15 && qNum <= 43) {
        questionAnswers[qNum - 14] = value;
      }
    }
  }

  // Als geen q-nummers gevonden, probeer op volgorde (voor directe API tests)
  if (Object.keys(questionAnswers).length === 0) {
    let questionIndex = 1;
    for (const [key, value] of Object.entries(data)) {
      if (!value || typeof value !== 'string') continue;
      const lk = key.toLowerCase();
      if (['email', 'naam', 'bedrijf', 'telefoon', 'sector', 'provincie', 'formid', 'submissionid', 'versturen', 'score', 'max', 'company', 'contact'].some(s => lk.includes(s))) continue;
      // Alleen antwoorden die op assessment lijken (niet kort, niet email-achtig)
      if (value.length > 10 && !value.includes('@')) {
        questionAnswers[questionIndex] = value;
        questionIndex++;
      }
    }
  }

  console.log(`Found ${Object.keys(questionAnswers).length} assessment answers`);

  // Individuele vraagscores opslaan
  const individualScores: Record<number, number> = {};
  for (let q = 1; q <= 29; q++) {
    const answer = questionAnswers[q];
    individualScores[q] = answer ? scoreAnswer(answer) : 0;
  }

  const categories = Object.entries(CATEGORY_QUESTIONS).map(([name, questions]) => {
    let rawScore = 0;
    const maxRaw = questions.length * 10;

    for (const qNum of questions) {
      rawScore += individualScores[qNum] || 0;
    }

    const scaledScore = maxRaw > 0 ? Math.round((rawScore / maxRaw) * 25) : 0;
    const percent = maxRaw > 0 ? Math.round((rawScore / maxRaw) * 100) : 0;

    return {
      name,
      score: scaledScore,
      maxScore: 25,
      percent,
      questionCount: questions.length,
    };
  });

  return { categories, individualScores };
}

function calculateTotalScore(categories: CategoryScore[]): number {
  return categories.reduce((sum, cat) => sum + cat.score, 0);
}

function extractField(data: Record<string, string>, keywords: string[]): string | undefined {
  // Exacte key match
  for (const key of keywords) {
    if (data[key]) return data[key];
  }
  // Partial match in keys (JotForm stuurt q2_bedrijfsnaam, q4_zakelijkE etc.)
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (keywords.some(kw => lowerKey.includes(kw)) && value) {
      return value;
    }
  }
  return undefined;
}

function flattenJotFormData(data: Record<string, any>): Record<string, string> {
  // JotForm stuurt nested objecten: q3_uwNaam[first], q5_telefoonnummer[full]
  // Flatten naar platte key-value pairs + voeg herkenbare aliases toe
  const flat: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      flat[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      // Nested: {first: "Wouter", last: "Arts"} → combineer
      if (value.first || value.last) {
        flat[key] = `${value.first || ''} ${value.last || ''}`.trim();
      } else if (value.full) {
        flat[key] = value.full;
      } else {
        flat[key] = JSON.stringify(value);
      }
    }
  }

  // JotForm veldnaam mapping → herkenbare aliases
  // q2_bedrijfsnaam → bedrijfsnaam, q4_zakelijkE → email, etc.
  const aliases: Record<string, string[]> = {
    bedrijfsnaam: ['q2_', 'bedrijf', 'company'],
    email: ['q4_', 'zakelijk', 'emailadres', 'e-mail', 'e_mail'],
    naam: ['q3_', 'uwNaam', 'contactpersoon'],
    telefoon: ['q5_', 'telefoonnummer', 'phone'],
    sector: ['q6_', 'welke.*sector', 'branche', 'industrie'],
    regio: ['q7_', 'provincie', 'vestiging', 'locatie'],
    teamgrootte: ['q8_', 'hoeveel.*technisch', 'team_size', 'fte'],
    uitdaging: ['q12_', 'grootste.*uitdaging', 'challenge', 'probleem'],
  };

  for (const [alias, patterns] of Object.entries(aliases)) {
    if (flat[alias]) continue; // Al gezet
    for (const [key, value] of Object.entries(flat)) {
      const lk = key.toLowerCase();
      if (patterns.some(p => lk.includes(p.replace('.*', '')))) {
        flat[alias] = value;
        break;
      }
    }
  }

  return flat;
}

function extractLead(data: Record<string, any>): ScoredLead & { individualScores: Record<number, number> } {
  const flat = flattenJotFormData(data);
  const { categories, individualScores } = calculateCategoryScores(flat);
  const score = calculateTotalScore(categories);
  const scorePercent = Math.round((score / MAX_SCORE) * 100);

  console.log('Category scores:', categories.map(c => `${c.name}: ${c.score}/25 (${c.percent}%)`).join(', '));
  console.log(`Total: ${score}/${MAX_SCORE} (${scorePercent}%)`);

  return {
    email: extractField(flat, ['email', 'e-mail', 'emailadres', 'zakelijk']) || '',
    companyName: extractField(flat, ['bedrijfsnaam', 'bedrijf', 'company', 'organisatie']) || '',
    contactName: extractField(flat, ['naam', 'name', 'contactpersoon']) || '',
    phone: extractField(flat, ['telefoon', 'phone', 'telefoonnummer']) || '',
    sector: extractField(flat, ['sector', 'branche', 'industrie']) || '',
    teamSize: extractField(flat, ['teamgrootte', 'team_size', 'fte']) || '',
    score,
    scorePercent,
    categories,
    individualScores,
    answers: flat,
  };
}

// ============================================================================
// PIPEDRIVE
// ============================================================================

async function createPipedriveDeal(lead: ScoredLead): Promise<{ success: boolean; dealId?: number }> {
  if (!PIPEDRIVE_API_TOKEN) return { success: false };

  // Pipedrive personal API tokens require api_token query param (not Bearer header)
  const pd = (path: string) => `https://api.pipedrive.com/v1/${path}?api_token=${PIPEDRIVE_API_TOKEN}`;
  const headers = { 'Content-Type': 'application/json' };

  const orgRes = await fetch(pd('organizations'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: lead.companyName }),
  });
  if (!orgRes.ok) {
    console.error('Pipedrive org creation failed:', orgRes.status);
    return { success: false };
  }
  const orgData = await orgRes.json();
  const orgId = orgData?.data?.id;

  const personRes = await fetch(pd('persons'), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: lead.contactName || lead.companyName,
      email: [{ value: lead.email, primary: true }],
      phone: lead.phone ? [{ value: lead.phone, primary: true }] : [],
      org_id: orgId,
    }),
  });
  if (!personRes.ok) {
    console.error('Pipedrive person creation failed:', personRes.status);
    return { success: false };
  }
  const personData = await personRes.json();
  const personId = personData?.data?.id;

  const dealRes = await fetch(pd('deals'), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: `APK — ${lead.companyName}`,
      person_id: personId,
      org_id: orgId,
      pipeline_id: PIPEDRIVE_PIPELINE_ID,
      status: 'open',
    }),
  });
  if (!dealRes.ok) {
    console.error('Pipedrive deal creation failed:', dealRes.status);
    return { success: false };
  }
  const dealData = await dealRes.json();
  return { success: dealData?.success, dealId: dealData?.data?.id };
}

// ============================================================================
// CLAUDE ANALYSE — Gepersonaliseerde rapport insights
// ============================================================================

interface ClaudeAnalysis {
  executive_summary: string;
  category_insights: Record<string, { strengths: string; improvements: string; impact: string }>;
  quick_wins?: string[];
  roi_estimate: string;
  top_strengths: string[];
  weakest_points: string[];
  action_plan_30: string[];
  action_plan_60: string[];
  action_plan_90: string[];
  roi_explanation?: string;
  biggest_opportunity: string;
  opportunity_hook: string;
}

async function generateClaudeAnalysis(lead: ScoredLead): Promise<ClaudeAnalysis | null> {
  if (!ANTHROPIC_API_KEY) {
    console.log('No ANTHROPIC_API_KEY, skipping Claude analysis');
    return null;
  }

  const catSummary = lead.categories.map(c => `${c.name}: ${c.score}/25 (${c.percent}%)`).join('\n');

  const prompt = `Je bent een senior recruitment consultant bij Recruitin B.V. Genereer een professionele Nederlandse analyse voor dit bedrijf.

BEDRIJFSDATA:
Bedrijf: ${lead.companyName}
Contact: ${lead.contactName}
Sector: ${lead.sector}
Totaalscore: ${lead.score}/100

CATEGORIE SCORES:
${catSummary}

INSTRUCTIE: Genereer een uitgebreid JSON object. Dit rapport wordt getoond na het invullen van 29 assessment vragen — de gebruiker verwacht diepgang en waarde. Gebruik deze exacte structuur (geen markdown, alleen pure JSON):
{
  "executive_summary": "3-4 zinnen. Positioneer het bedrijf qua recruitment maturity, vergelijk met sectorgemiddelde, benoem de sterkste en zwakste categorie, en geef de #1 strategische prioriteit.",
  "category_insights": {
    "Processen": {
      "strengths": "2-3 zinnen over wat goed gaat. Wees specifiek over welke processen sterk zijn en waarom dit waardevol is voor het bedrijf in deze sector.",
      "improvements": "2-3 zinnen over concrete verbeterpunten. Noem specifieke tools, methoden of frameworks die het bedrijf kan implementeren.",
      "impact": "Verwachte impact bij verbetering met concrete cijfers, bijv. 'Doorlooptijd -30%, €25.000 besparing/jaar, 2 FTE minder extern bureau'"
    },
    "Technologie": { "strengths": "2-3 zinnen...", "improvements": "2-3 zinnen...", "impact": "..." },
    "Talent Attraction": { "strengths": "2-3 zinnen...", "improvements": "2-3 zinnen...", "impact": "..." },
    "Data & Analytics": { "strengths": "2-3 zinnen...", "improvements": "2-3 zinnen...", "impact": "..." }
  },
  "top_strengths": ["Sterkste punt met korte toelichting (max 15 woorden)", "Tweede sterkste punt (max 15 woorden)", "Derde sterkste punt (max 15 woorden)"],
  "weakest_points": ["Zwakste punt met korte toelichting (max 15 woorden)", "Tweede zwakste punt (max 15 woorden)", "Derde zwakste punt (max 15 woorden)"],
  "action_plan_30": ["Concrete actie 1 met verwacht resultaat (2 zinnen)", "Actie 2 met verwacht resultaat (2 zinnen)", "Actie 3 met verwacht resultaat (2 zinnen)"],
  "action_plan_60": ["Actie 1 dag 30-60, bouwt voort op fase 1 (2 zinnen)", "Actie 2 dag 30-60 (2 zinnen)", "Actie 3 (2 zinnen)"],
  "action_plan_90": ["Actie 1 dag 60-90, meten en optimaliseren (2 zinnen)", "Actie 2 dag 60-90 (2 zinnen)"],
  "roi_estimate": "ALLEEN het bedrag, bijv. '€35.000 - €65.000' — max 20 tekens",
  "biggest_opportunity": "De naam van de zwakste categorie (exact: Processen, Technologie, Talent Attraction, of Data & Analytics)",
  "opportunity_hook": "1 prikkelende, confronterende zin die het bedrijf laat voelen wat ze mislopen. Gebruik een concreet bedrag of tijdverspilling, bijv. 'Jullie verliezen maandelijks €8.000 aan inefficiënte werving terwijl concurrenten al geautomatiseerd werven'"
}

REGELS:
- Nederlands, professioneel maar direct en confronterend waar nodig
- Specifiek voor de sector "${lead.sector}" en het bedrijf "${lead.companyName}"
- Gebruik concrete cijfers, tijdslijnen, tools en methoden — noem specifieke software, frameworks, KPIs
- Het actieplan moet logisch opbouwen: 30d = quick wins, 60d = structureel, 90d = meten
- Elke categorie-insight moet genoeg diepgang hebben om waardevol te voelen na 29 vragen
- Output ALLEEN het JSON object, geen tekst eromheen`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text;

    if (!text) {
      console.error('Claude empty response:', JSON.stringify(data));
      return null;
    }

    // Parse JSON — strip eventuele markdown code blocks
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(jsonStr) as ClaudeAnalysis;
    console.log('Claude analysis generated successfully');
    return analysis;
  } catch (error) {
    console.error('Claude analysis error:', error);
    return null;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Strip control characters and trim. Safe for Pipedrive/external API fields. */
function sanitizeString(str: string): string {
  // Remove control chars (except newline/tab), trim, collapse whitespace
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

const MAX_BODY_SIZE = 10 * 1024; // 10 KB

// ============================================================================
// RATE LIMITING (Supabase-backed)
// ============================================================================

async function checkRateLimit(req: VercelRequest): Promise<boolean> {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) return true; // fail-open if not configured

  // Hash IP for privacy
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'apk-salt-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const ipHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5; // max 5 per hour per IP
  const since = new Date(Date.now() - windowMs).toISOString();

  // Count recent requests
  const countRes = await fetch(
    `${SUPABASE_URL}/rest/v1/apk_rate_limits?ip_hash=eq.${ipHash}&created_at=gte.${since}&select=id`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  const recent = await countRes.json();
  if (Array.isArray(recent) && recent.length >= maxRequests) return false;

  // Log this request
  await fetch(`${SUPABASE_URL}/rest/v1/apk_rate_limits`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip_hash: ipHash })
  });

  return true;
}

function verifyWebhookSecret(req: VercelRequest): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn('WEBHOOK_SECRET not configured — endpoint is unauthenticated');
    return true;
  }
  // Verify via shared secret only — no Origin-based bypasses
  const tokenParam = req.query?.token as string | undefined;
  if (tokenParam === WEBHOOK_SECRET) return true;
  const headerToken = req.headers['x-webhook-secret'] as string | undefined;
  return headerToken === WEBHOOK_SECRET;
}

// ============================================================================
// RESEND EMAIL
// ============================================================================

async function sendConfirmationEmail(lead: ScoredLead, rapportUrl: string): Promise<boolean> {
  if (!RESEND_API_KEY) return false;

  // Score kleur bepalen (op basis van percentage van 100)
  const scorePercent = lead.scorePercent;
  const scoreColor = scorePercent >= 70 ? '#16a34a' : scorePercent >= 40 ? '#f59e0b' : '#ef4444';
  const scoreLabel = scorePercent >= 80 ? 'EXCELLENT' : scorePercent >= 60 ? 'GOED' : scorePercent >= 40 ? 'GEMIDDELD' : 'ONTWIKKELING NODIG';

  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: 'Recruitment APK <noreply@recruitmentapk.nl>',
    replyTo: 'info@recruitin.nl',
    to: lead.email,
    subject: `Uw Recruitment APK resultaat — ${lead.companyName}`,
    html: `<!DOCTYPE html>
<html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Recruitment APK Resultaat</title></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f9fafb;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;"><tr><td>
<table width="600" cellpadding="0" cellspacing="0" align="center" style="background-color:white;font-size:14px;line-height:1.6;color:#1f2937;">

<!-- HEADER -->
<tr><td style="background-color:#05080c;padding:20px;text-align:center;">
<span style="font-weight:bold;color:#09aedd;font-size:18px;letter-spacing:2px;">RECRUITMENT APK</span>
<br><span style="color:#94a3b8;font-size:11px;letter-spacing:1px;">by Recruitin B.V.</span>
</td></tr>

<!-- HERO -->
<tr><td style="background-color:#f3f4f6;padding:30px;border-bottom:1px solid #e5e7eb;">
<div style="font-size:22px;font-weight:bold;color:#1f2937;">Uw assessment resultaat</div>
<div style="font-size:14px;color:#6b7280;margin-top:8px;">${escapeHtml(lead.companyName)}${lead.sector ? ' — ' + escapeHtml(lead.sector) : ''}</div>
</td></tr>

<!-- SCORE -->
<tr><td style="padding:30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;border:1px solid #e5e7eb;border-radius:4px;">
<tr><td style="padding:24px;text-align:center;">
<table cellpadding="0" cellspacing="0" align="center">
<tr><td style="width:80px;height:80px;border:3px solid ${scoreColor};border-radius:50%;text-align:center;font-size:28px;font-weight:bold;color:${scoreColor};line-height:80px;">${lead.score}</td></tr>
</table>
<div style="margin-top:12px;font-weight:bold;color:white;background-color:${scoreColor};padding:4px 14px;display:inline-block;border-radius:4px;font-size:12px;letter-spacing:1px;">${scoreLabel}</div>
<div style="margin-top:12px;font-size:13px;color:#6b7280;">Score: ${lead.score}/100</div>
</td></tr>
</table>
</td></tr>

<!-- BEVINDINGEN -->
<tr><td style="padding:0 30px 30px;">
<div style="font-weight:bold;font-size:16px;margin-bottom:15px;">Beoordeelde gebieden</div>
<table width="100%" cellpadding="0" cellspacing="0">
${lead.categories.map(cat => {
  const cc = cat.percent >= 70 ? '#16a34a' : cat.percent >= 40 ? '#f59e0b' : '#ef4444';
  const icon = cat.percent >= 70 ? '✓' : cat.percent >= 40 ? '⚠' : '✗';
  return `<tr><td style="padding:10px 12px;background-color:white;border:1px solid #e5e7eb;margin-bottom:6px;border-radius:4px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="24" style="font-size:16px;padding-right:8px;color:${cc};">${icon}</td>
<td><span style="font-weight:bold;color:#1f2937;font-size:13px;">${cat.name}</span></td>
<td width="70" style="text-align:right;font-weight:bold;font-size:14px;color:${cc};">${cat.score}/25</td>
</tr></table></td></tr>`;
}).join('')}
</table>
</td></tr>

<!-- CTA PRIMAIR -->
<tr><td style="padding:24px 30px 8px;text-align:center;">
<div style="font-weight:bold;font-size:18px;color:#1f2937;margin-bottom:8px;">Jouw persoonlijke rapport staat klaar</div>
<div style="font-size:14px;color:#6b7280;margin-bottom:20px;">Bekijk jouw volledige recruitment maturity analyse inclusief AI-insights, benchmark en actieplan</div>
<table cellpadding="0" cellspacing="0" align="center"><tr><td style="background-color:#09aedd;border-radius:6px;padding:16px 32px;">
<a href="${rapportUrl}" style="color:#05080c;text-decoration:none;font-weight:800;font-size:16px;letter-spacing:0.02em;">Bekijk volledig rapport →</a>
</td></tr></table>
<div style="margin-top:12px;font-size:11px;color:#9ca3af;">Klik op de knop of kopieer: recruitmentapk.nl/rapport</div>
</td></tr>

<!-- DIVIDER -->
<tr><td style="padding:0 30px;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>

<!-- WHATSAPP CTA -->
<tr><td style="padding:20px 30px;text-align:center;">
<div style="font-size:13px;color:#6b7280;margin-bottom:12px;">Directe vraag over jouw score?</div>
<a href="https://wa.me/31614314593" style="display:inline-flex;align-items:center;gap:8px;background-color:#25D366;color:white;text-decoration:none;font-weight:bold;font-size:13px;padding:10px 20px;border-radius:20px;">
&#x1F4AC; Stuur een WhatsApp bericht
</a>
</td></tr>

<!-- HELP -->
<tr><td style="padding:16px 30px;background-color:#f3f4f6;border-top:1px solid #e5e7eb;">
<div style="color:#6b7280;font-size:12px;text-align:center;">Wouter Arts · <a href="mailto:warts@recruitin.nl" style="color:#09aedd;">warts@recruitin.nl</a> · +31 6 14 31 45 93</div>
</td></tr>

<!-- FOOTER -->
<tr><td style="padding:16px 30px;text-align:center;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:11px;">
recruitmentapk.nl — powered by Recruitin B.V.
</td></tr>

</table></td></tr></table>
</body></html>`,
  });

  if (error) console.error('Resend error:', error);
  return !error;
}

// ============================================================================
// SLACK NOTIFICATIE
// ============================================================================

async function sendSlackNotification(lead: ScoredLead, dealId?: number): Promise<void> {
  if (!SLACK_WEBHOOK_URL) return;

  const emoji = lead.score >= SCORE_THRESHOLD ? ':fire:' : ':seedling:';
  const path = lead.score >= SCORE_THRESHOLD ? 'Path A (Sales)' : 'Path B (Nurture)';

  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `${emoji} *Nieuwe APK Assessment*\n*Bedrijf:* ${lead.companyName}\n*Contact:* ${lead.contactName}\n*Score:* ${lead.score}/${MAX_SCORE} → ${path}\n${lead.categories.map(c => `  ${c.name}: ${c.score}/25`).join('\n')}\n*Sector:* ${lead.sector}${dealId ? `\n*Pipedrive:* <https://recruitin.pipedrive.com/deal/${dealId}|Deal #${dealId}>` : ''}`,
    }),
  });
}

// ============================================================================
// HANDLER
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyWebhookSecret(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Server-side rate limiting
  const allowed = await checkRateLimit(req);
  if (!allowed) {
    return res.status(429).json({ error: 'Te veel verzoeken. Probeer het later opnieuw.' });
  }

  try {
    // --- Input validation: reject oversized bodies ---
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? '');
    if (Buffer.byteLength(rawBody, 'utf-8') > MAX_BODY_SIZE) {
      return res.status(413).json({ error: 'Request body te groot (max 10 KB)' });
    }

    const data: Record<string, any> =
      typeof req.body === 'string'
        ? Object.fromEntries(new URLSearchParams(req.body))
        : req.body;

    console.log('Incoming data keys:', Object.keys(data).join(', '));

    const lead = extractLead(data);

    // --- Sanitize free-text fields before external API calls ---
    lead.contactName = sanitizeString(lead.contactName);
    lead.phone = sanitizeString(lead.phone);
    lead.companyName = sanitizeString(lead.companyName);
    lead.sector = sanitizeString(lead.sector);

    console.log('Extracted lead:', JSON.stringify({ company: lead.companyName, score: lead.score }));

    // --- Required field validation ---
    if (!lead.companyName || lead.companyName.length > 200) {
      return res.status(400).json({ error: 'Bedrijfsnaam is verplicht (max 200 tekens)' });
    }
    if (!lead.email || !lead.email.includes('@')) {
      return res.status(400).json({ error: 'Geldig e-mailadres is verplicht' });
    }

    let dealId: number | undefined;

    // Pipedrive deal alleen bij hoge score
    if (lead.score >= SCORE_THRESHOLD) {
      const dealResult = await createPipedriveDeal(lead);
      dealId = dealResult.dealId;
    }

    // Claude analyse genereren (parallel met andere acties)
    const claudePromise = generateClaudeAnalysis(lead);

    // Genereer rapport URL met score data + categorie scores + individuele scores
    const catScores = lead.categories.map(c => c.percent).join(',');
    const qScores = Array.from({ length: 29 }, (_, i) => lead.individualScores[i + 1] || 0).join(',');
    const rapportParams = new URLSearchParams({
      score: lead.score.toString(),
      max: MAX_SCORE.toString(),
      company: lead.companyName,
      contact: lead.contactName,
      sector: lead.sector,
      cats: catScores,
      qs: qScores,
    });

    // Wacht op Claude analyse en voeg toe aan rapport URL
    const analysis = await claudePromise;
    if (analysis) {
      rapportParams.set('ai', Buffer.from(JSON.stringify(analysis)).toString('base64'));
    }

    const rapportUrl = `https://www.recruitmentapk.nl/rapport?${rapportParams.toString()}`;

    // Email CTA URL met UTM tracking (GA4 meet doorklikken vanuit email)
    const emailRapportUrl = `${rapportUrl}&utm_source=email&utm_medium=transactional&utm_campaign=apk-rapport&utm_content=cta-button`;

    // Email altijd sturen als er een emailadres is
    if (lead.email) {
      await sendConfirmationEmail(lead, emailRapportUrl);
    }

    await sendSlackNotification(lead, dealId);

    return res.status(200).json({
      success: true,
      score: lead.score,
      path: lead.score >= SCORE_THRESHOLD ? 'A' : 'B',
      rapportUrl,
    });
  } catch (error) {
    console.error('Score handler error:', error);
    return res.status(500).json({ error: 'Interne fout bij verwerking' });
  }
}
