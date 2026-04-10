import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// ============================================================================
// CONFIGURATIE
// ============================================================================

const PIPEDRIVE_API_TOKEN = process.env.PIPEDRIVE_API_TOKEN || '';
const PIPEDRIVE_PIPELINE_ID = 14;
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const SCORE_THRESHOLD = 10;

// ============================================================================
// TYPES
// ============================================================================

interface ScoredLead {
  email: string;
  companyName: string;
  contactName: string;
  phone: string;
  sector: string;
  teamSize: string;
  score: number;
  answers: Record<string, string>;
}

// ============================================================================
// SCORING
// ============================================================================

function calculateScore(data: Record<string, string>): number {
  let score = 0;

  // Teamgrootte: groter team = hogere urgentie
  const teamSize = parseInt(extractField(data, ['teamgrootte', 'team_size', 'fte']) || '0');
  if (teamSize >= 200) score += 4;
  else if (teamSize >= 100) score += 3;
  else if (teamSize >= 50) score += 2;
  else if (teamSize >= 20) score += 1;

  // Sector: technisch MKB scoort hoger
  const sector = extractField(data, ['sector', 'branche', 'industrie']) || '';
  const techSectors = ['oil', 'gas', 'constructie', 'bouw', 'productie', 'automation', 'renewables', 'energie', 'techniek', 'industrie'];
  if (techSectors.some(s => sector.toLowerCase().includes(s))) score += 3;

  // Regio: Gelderland/Overijssel/Noord-Brabant = doelregio
  const regio = extractField(data, ['regio', 'provincie', 'locatie', 'vestiging']) || '';
  const targetRegios = ['gelderland', 'overijssel', 'noord-brabant', 'brabant'];
  if (targetRegios.some(r => regio.toLowerCase().includes(r))) score += 2;

  // Uitdaging/pijn: specifieke recruitment pijn scoort hoger
  const challenge = extractField(data, ['uitdaging', 'challenge', 'probleem', 'wervingsuitdaging']) || '';
  if (challenge.length > 50) score += 2;

  // Email kwaliteit: zakelijk email scoort hoger
  const email = extractField(data, ['email', 'e-mail', 'emailadres']) || '';
  const freeProviders = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.nl'];
  if (email && !freeProviders.some(p => email.toLowerCase().includes(p))) score += 2;

  // Telefoon ingevuld = extra engagement
  const phone = extractField(data, ['telefoon', 'phone', 'telefoonnummer']) || '';
  if (phone && phone.length >= 10) score += 1;

  return score;
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
  const score = calculateScore(flat);
  return {
    email: extractField(flat, ['email', 'e-mail', 'emailadres', 'zakelijk']) || '',
    companyName: extractField(flat, ['bedrijfsnaam', 'bedrijf', 'company', 'organisatie']) || '',
    contactName: extractField(flat, ['naam', 'name', 'contactpersoon']) || '',
    phone: extractField(flat, ['telefoon', 'phone', 'telefoonnummer']) || '',
    sector: extractField(flat, ['sector', 'branche', 'industrie']) || '',
    teamSize: extractField(flat, ['teamgrootte', 'team_size', 'fte']) || '',
    score,
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

async function sendConfirmationEmail(lead: ScoredLead): Promise<boolean> {
  if (!RESEND_API_KEY) return false;

  // Score kleur bepalen
  const scorePercent = Math.round((lead.score / 14) * 100);
  const scoreColor = scorePercent >= 70 ? '#16a34a' : scorePercent >= 40 ? '#f59e0b' : '#ef4444';
  const scoreLabel = scorePercent >= 70 ? 'GOED' : scorePercent >= 40 ? 'MATIG' : 'KRITIEK';

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
<div style="font-size:14px;color:#6b7280;margin-top:8px;">${lead.companyName}${lead.sector ? ' — ' + lead.sector : ''}</div>
</td></tr>

<!-- SCORE -->
<tr><td style="padding:30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;border:1px solid #e5e7eb;border-radius:4px;">
<tr><td style="padding:24px;text-align:center;">
<table cellpadding="0" cellspacing="0" align="center">
<tr><td style="width:80px;height:80px;border:3px solid ${scoreColor};border-radius:50%;text-align:center;font-size:28px;font-weight:bold;color:${scoreColor};line-height:80px;">${lead.score}/14</td></tr>
</table>
<div style="margin-top:12px;font-weight:bold;color:white;background-color:${scoreColor};padding:4px 14px;display:inline-block;border-radius:4px;font-size:12px;letter-spacing:1px;">${scoreLabel}</div>
<div style="margin-top:12px;font-size:13px;color:#6b7280;">Recruitment Gereedheid Score</div>
</td></tr>
</table>
</td></tr>

<!-- BEVINDINGEN -->
<tr><td style="padding:0 30px 30px;">
<div style="font-weight:bold;font-size:16px;margin-bottom:15px;">Beoordeelde gebieden</div>
<table width="100%" cellpadding="0" cellspacing="0">
${[
  { name: 'Teamgrootte & Schaal', ok: (parseInt(lead.teamSize) || 0) >= 50 },
  { name: 'Sector Match', ok: ['oil','gas','constructie','bouw','productie','automation','renewables','energie','techniek'].some(s => (lead.sector || '').toLowerCase().includes(s)) },
  { name: 'Regionale Positionering', ok: lead.score >= 8 },
  { name: 'Employer Branding', ok: lead.email && !['gmail.com','hotmail.com','outlook.com'].some(p => lead.email.includes(p)) },
  { name: 'Candidate Engagement', ok: (lead.phone || '').length >= 10 },
].map(cat => `<tr><td style="padding:8px 12px;background-color:white;border:1px solid #e5e7eb;margin-bottom:6px;border-radius:4px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="24" style="font-size:16px;padding-right:8px;">${cat.ok ? '✓' : '⚠'}</td>
<td><span style="font-weight:bold;color:#1f2937;font-size:13px;">${cat.name}</span></td>
<td width="60" style="text-align:right;font-size:12px;color:${cat.ok ? '#16a34a' : '#f59e0b'};">${cat.ok ? 'Goed' : 'Aandacht'}</td>
</tr></table></td></tr>`).join('')}
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
<a href="https://www.recruitmentapk.nl/bedankt" style="color:white;text-decoration:none;font-weight:bold;font-size:14px;">Plan een gratis strategiegesprek →</a>
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
      text: `${emoji} *Nieuwe APK Assessment*\n*Bedrijf:* ${lead.companyName}\n*Contact:* ${lead.contactName}\n*Score:* ${lead.score}/14 → ${path}\n*Sector:* ${lead.sector}\n*Team:* ${lead.teamSize} FTE${dealId ? `\n*Pipedrive:* <https://recruitin.pipedrive.com/deal/${dealId}|Deal #${dealId}>` : ''}`,
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

    // Email altijd sturen als er een emailadres is
    if (lead.email) {
      await sendConfirmationEmail(lead);
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
