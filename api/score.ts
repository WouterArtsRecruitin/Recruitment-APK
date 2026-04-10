import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// ============================================================================
// CONFIGURATIE
// ============================================================================

const PIPEDRIVE_API_TOKEN = process.env.PIPEDRIVE_API_TOKEN || '';
const PIPEDRIVE_PIPELINE_ID = 14;
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
// Score threshold: 60% van 100 = 60 punten → Path A (sales outreach)
const SCORE_THRESHOLD = 60;
const MAX_SCORE = 100; // 4 categorieën × 25 punten

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

  return Object.entries(CATEGORY_QUESTIONS).map(([name, questions]) => {
    let rawScore = 0;
    const maxRaw = questions.length * 10;

    for (const qNum of questions) {
      const answer = questionAnswers[qNum];
      if (answer) {
        rawScore += scoreAnswer(answer);
      }
    }

    // Schaal naar 0-25
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

function extractLead(data: Record<string, any>): ScoredLead {
  const flat = flattenJotFormData(data);
  const categories = calculateCategoryScores(flat);
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
    answers: flat,
  };
}

// ============================================================================
// PIPEDRIVE
// ============================================================================

async function createPipedriveDeal(lead: ScoredLead): Promise<{ success: boolean; dealId?: number }> {
  if (!PIPEDRIVE_API_TOKEN) return { success: false };

  const orgRes = await fetch(
    `https://api.pipedrive.com/v1/organizations?api_token=${PIPEDRIVE_API_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: lead.companyName }),
    }
  );
  const orgData = await orgRes.json();
  const orgId = orgData?.data?.id;

  const personRes = await fetch(
    `https://api.pipedrive.com/v1/persons?api_token=${PIPEDRIVE_API_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: lead.contactName || lead.companyName,
        email: [{ value: lead.email, primary: true }],
        phone: lead.phone ? [{ value: lead.phone, primary: true }] : [],
        org_id: orgId,
      }),
    }
  );
  const personData = await personRes.json();
  const personId = personData?.data?.id;

  const dealRes = await fetch(
    `https://api.pipedrive.com/v1/deals?api_token=${PIPEDRIVE_API_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `APK — ${lead.companyName}`,
        person_id: personId,
        org_id: orgId,
        pipeline_id: PIPEDRIVE_PIPELINE_ID,
        status: 'open',
      }),
    }
  );
  const dealData = await dealRes.json();
  return { success: dealData?.success, dealId: dealData?.data?.id };
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
    from: 'Recruitment APK <noreply@kandidatentekort.nl>',
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
<div style="font-size:14px;color:#6b7280;margin-top:8px;">${lead.companyName}${lead.sector ? ' — ' + lead.sector : ''}</div>
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

<!-- WAT NU -->
<tr><td style="padding:0 30px 30px;border-top:1px solid #e5e7eb;">
<div style="font-weight:bold;font-size:16px;margin:20px 0 15px;">Wat gebeurt er nu?</div>
<table width="100%" cellpadding="0" cellspacing="0">
${['Ons team analyseert uw antwoorden in detail', 'Binnen 24 uur ontvangt u het volledige APK-rapport', 'Inclusief concrete verbeterpunten en actieplan', 'Optioneel: gratis 30-min strategiegesprek'].map((item, i) => `<tr><td style="padding:6px 0;"><table width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="24" style="font-weight:bold;color:#09aedd;">${i + 1}.</td>
<td style="padding-left:8px;color:#1f2937;font-size:13px;">${item}</td>
</tr></table></td></tr>`).join('')}
</table>
</td></tr>

<!-- CTA -->
<tr><td style="padding:0 30px 20px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:#09aedd;padding:15px;text-align:center;border-radius:4px;">
<a href="${rapportUrl}" style="color:white;text-decoration:none;font-weight:bold;font-size:14px;">Bekijk volledig rapport →</a>
</td></tr></table>
</td></tr>

<!-- HELP -->
<tr><td style="padding:20px 30px;background-color:#f3f4f6;border-top:1px solid #e5e7eb;">
<div style="font-weight:bold;color:#1f2937;margin-bottom:6px;">Vragen?</div>
<div style="color:#6b7280;font-size:13px;">Reply op deze email of bel <a href="tel:+31313410507" style="color:#09aedd;">+31 313 410 507</a></div>
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

  try {
    const data: Record<string, any> =
      typeof req.body === 'string'
        ? Object.fromEntries(new URLSearchParams(req.body))
        : req.body;

    console.log('Incoming data keys:', Object.keys(data).join(', '));

    const lead = extractLead(data);

    console.log('Extracted lead:', JSON.stringify({ email: lead.email, company: lead.companyName, score: lead.score }));

    if (!lead.email && !lead.companyName) {
      return res.status(400).json({ error: 'Geen email of bedrijfsnaam gevonden' });
    }

    let dealId: number | undefined;

    // Pipedrive deal alleen bij hoge score
    if (lead.score >= SCORE_THRESHOLD) {
      const dealResult = await createPipedriveDeal(lead);
      dealId = dealResult.dealId;
    }

    // Genereer rapport URL met score data + categorie scores
    const catScores = lead.categories.map(c => c.percent).join(',');
    const rapportParams = new URLSearchParams({
      score: lead.score.toString(),
      max: MAX_SCORE.toString(),
      company: lead.companyName,
      contact: lead.contactName,
      sector: lead.sector,
      cats: catScores,
    });
    const rapportUrl = `https://www.recruitmentapk.nl/rapport?${rapportParams.toString()}`;

    // Email altijd sturen als er een emailadres is
    if (lead.email) {
      await sendConfirmationEmail(lead, rapportUrl);
    }

    await sendSlackNotification(lead, dealId);

    return res.status(200).json({
      success: true,
      score: lead.score,
      path: lead.score >= SCORE_THRESHOLD ? 'A' : 'B',
    });
  } catch (error) {
    console.error('Score handler error:', error);
    return res.status(500).json({ error: 'Interne fout bij verwerking' });
  }
}
