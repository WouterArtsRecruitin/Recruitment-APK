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
  for (const key of keywords) {
    if (data[key]) return data[key];
  }
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (keywords.some(kw => lowerKey.includes(kw)) && value) {
      return value;
    }
  }
  return undefined;
}

function extractLead(data: Record<string, string>): ScoredLead {
  const score = calculateScore(data);
  return {
    email: extractField(data, ['email', 'e-mail', 'emailadres']) || '',
    companyName: extractField(data, ['bedrijf', 'company', 'bedrijfsnaam', 'organisatie']) || '',
    contactName: extractField(data, ['naam', 'name', 'contactpersoon']) || '',
    phone: extractField(data, ['telefoon', 'phone', 'telefoonnummer']) || '',
    sector: extractField(data, ['sector', 'branche', 'industrie']) || '',
    teamSize: extractField(data, ['teamgrootte', 'team_size', 'fte']) || '',
    score,
    answers: data,
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

  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: 'Recruitin <noreply@recruitin.nl>',
    to: lead.email,
    subject: 'Je Recruitment APK rapport is onderweg',
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #09aedd; font-size: 24px;">Bedankt voor je Recruitment APK!</h1>
        <p>Beste ${lead.contactName || 'HR-professional'},</p>
        <p>We hebben je assessment ontvangen voor <strong>${lead.companyName}</strong>.</p>
        <p>Ons team analyseert je antwoorden en je ontvangt binnen <strong>24 uur</strong> je persoonlijke APK-rapport inclusief verbeterplan.</p>
        <hr style="border: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #666; font-size: 14px;">
          Vragen? Reply op deze email of bel <a href="tel:+31313410507">+31 313 410 507</a>
        </p>
        <p style="color: #999; font-size: 12px;">— Team Recruitin</p>
      </div>
    `,
  });

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
    const data: Record<string, string> =
      typeof req.body === 'string'
        ? Object.fromEntries(new URLSearchParams(req.body))
        : req.body;

    const lead = extractLead(data);

    if (!lead.email && !lead.companyName) {
      return res.status(400).json({ error: 'Geen email of bedrijfsnaam gevonden' });
    }

    let dealId: number | undefined;

    if (lead.score >= SCORE_THRESHOLD) {
      const dealResult = await createPipedriveDeal(lead);
      dealId = dealResult.dealId;
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
