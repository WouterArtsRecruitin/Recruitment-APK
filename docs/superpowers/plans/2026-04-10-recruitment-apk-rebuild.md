# Recruitment APK — Full Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Recruitment APK from a broken landing page into a working assessment pipeline: JotForm → scoring → Pipedrive/Resend/Slack (score ≥10) or Lemlist nurture (score <10), with correct analytics tracking.

**Architecture:** Vite + React SPA with Vercel Functions as backend. JotForm collects assessment answers and POSTs to a Vercel Function webhook. The function calculates a score, creates a Pipedrive deal (Pipeline 14), sends a Resend confirmation email, and fires a Slack notification. Frontend tracks GA4 + Meta Pixel conversions.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS 3, Vercel Functions (Node.js), Resend, Pipedrive API, JotForm Webhooks, GA4, Meta Pixel.

---

## File Structure

```
/Users/wouterarts/projects/Recruitment-APK/
├── api/
│   └── score.ts              ← NEW: Vercel Function — scoring + routing
├── src/
│   ├── App.tsx               ← MODIFY: remove unused components, fix routes
│   ├── main.tsx              ← no change
│   ├── index.css             ← no change
│   ├── components/
│   │   ├── Assessment.tsx    ← MODIFY: set JotForm ID
│   │   ├── AnalyticsProvider.tsx ← MODIFY: fix GA4 ID, remove duplicate FB pixel
│   │   ├── MetaPixel.tsx     ← MODIFY: use correct pixel ID from env/constant
│   │   ├── ThankYou.tsx      ← NEW: React thank-you page (replaces legacy HTML)
│   │   ├── ABTesting.tsx     ← DELETE (unused, no active tests)
│   │   ├── ExitIntentPopup.tsx ← DELETE (not used in Assessment.tsx)
│   │   ├── GoogleAdsRemarketing.tsx ← keep (future use)
│   │   ├── LeadMagnet.tsx    ← DELETE (not used)
│   │   ├── MicrosoftClarity.tsx ← keep
│   │   ├── PerformanceOptimizer.tsx ← keep
│   │   ├── SEOHead.tsx       ← keep
│   │   ├── SocialProofToast.tsx ← DELETE (not used)
│   │   ├── TestimonialsCarousel.tsx ← DELETE (Assessment.tsx has its own)
│   │   ├── TrustBar.tsx      ← DELETE (not used)
│   │   ├── UrgencyBanner.tsx ← DELETE (not used)
│   │   └── WhatsAppButton.tsx ← keep
│   ├── lib/
│   │   ├── analytics.ts     ← MODIFY: set correct GA4 ID
│   │   ├── animations.ts    ← no change
│   │   ├── emailAutomation.ts ← DELETE (replaced by server-side Resend)
│   │   └── utils.ts         ← no change
│   ├── hooks/
│   │   └── useAnalytics.ts  ← no change
│   └── pages/
│       └── MetaCampaignPage.tsx ← MODIFY: switch from Typeform to JotForm
├── .env.local                ← NEW: local env config (gitignored)
├── .env.example              ← MODIFY: update with actual var names
├── vercel.json               ← MODIFY: add API rewrites
├── package.json              ← MODIFY: add resend dependency
└── [cleanup: delete 18 root-level junk files]
```

---

## Phase 1: Cleanup & Configuration

### Task 1: Delete junk files from root

**Files:**
- Delete: 18 root-level files that are legacy copies, old HTML versions, and dead PHP code

- [ ] **Step 1: Remove duplicate/copy files**

```bash
cd /Users/wouterarts/projects/Recruitment-APK
rm "app_css kopie.css" app_css.css
rm "complete_app_tsx_full kopie.ts" complete_app_tsx_full.ts
rm "custom_domain_cname kopie.txt" custom_domain_cname.txt
rm "recruitpro_app_tsx kopie.ts" recruitpro_app_tsx.ts
rm "recruitpro_deploy_workflow kopie.html" "recruitpro_deploy_workflow kopie.txt"
rm recruitpro_deploy_workflow.txt
rm "recruitpro_package kopie.json" recruitpro_package.json
rm "production_html_full (1).html"
```

- [ ] **Step 2: Remove legacy HTML files**

```bash
rm index-new.html index-old.html index-recruitin.html
rm thank-you.html
```

- [ ] **Step 3: Remove dead PHP backend** (Vercel kan geen PHP draaien)

```bash
rm submit_assessment.php
rm api/submit_assessment.php api/submit-assessment.php
rmdir api 2>/dev/null || true
```

- [ ] **Step 4: Remove legacy markdown docs** (info is in CLAUDE.md of verouderd)

```bash
rm AUDIT_EN_VERBETERPLAN.md CODE_IMPROVEMENTS.md DEPLOYMENT_CHECKLIST.md
rm DEPLOYMENT_READY.md NETLIFY_DEPLOY.md SEO_ANIMATION_GUIDE.md
rm TECH_STACK_ADVICE.md VERCEL_DEPLOYMENT.md
rm src/IMPLEMENTATION_GUIDE.md
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove 25+ legacy files (copies, dead PHP, outdated docs)"
```

---

### Task 2: Delete unused React components

**Files:**
- Delete: `src/components/ABTesting.tsx`
- Delete: `src/components/ExitIntentPopup.tsx`
- Delete: `src/components/LeadMagnet.tsx`
- Delete: `src/components/SocialProofToast.tsx`
- Delete: `src/components/TestimonialsCarousel.tsx`
- Delete: `src/components/TrustBar.tsx`
- Delete: `src/components/UrgencyBanner.tsx`
- Delete: `src/lib/emailAutomation.ts`
- Modify: `src/App.tsx` — remove imports of deleted components

- [ ] **Step 1: Delete unused component files**

```bash
cd /Users/wouterarts/projects/Recruitment-APK
rm src/components/ABTesting.tsx
rm src/components/ExitIntentPopup.tsx
rm src/components/LeadMagnet.tsx
rm src/components/SocialProofToast.tsx
rm src/components/TestimonialsCarousel.tsx
rm src/components/TrustBar.tsx
rm src/components/UrgencyBanner.tsx
rm src/lib/emailAutomation.ts
```

- [ ] **Step 2: Update App.tsx — remove deleted imports**

Replace entire `src/App.tsx` with:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Assessment } from './components/Assessment';
import { SEOHead } from './components/SEOHead';
import PerformanceOptimizer, { ResourceHints } from './components/PerformanceOptimizer';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import { MetaPixel } from './components/MetaPixel';
import { MicrosoftClarity } from './components/MicrosoftClarity';
import { GoogleAdsRemarketing } from './components/GoogleAdsRemarketing';
import { MetaCampaignPage } from './pages/MetaCampaignPage';
import { ThankYou } from './components/ThankYou';

function App() {
  return (
    <BrowserRouter>
      <AnalyticsProvider>
        <SEOHead />
        <ResourceHints />
        <PerformanceOptimizer />
        <MetaPixel />
        <MicrosoftClarity projectId={import.meta.env.VITE_CLARITY_PROJECT_ID} />
        <GoogleAdsRemarketing conversionId={import.meta.env.VITE_GOOGLE_ADS_ID} />

        <Routes>
          <Route path="/" element={<Assessment />} />
          <Route path="/meta" element={<MetaCampaignPage />} />
          <Route path="/bedankt" element={<ThankYou />} />
        </Routes>
      </AnalyticsProvider>
    </BrowserRouter>
  );
}

export default App;
```

Note: `ThankYou` component will be created in Task 7. For now this will cause a build error — that's OK, we'll fix it in Phase 2.

- [ ] **Step 3: Verify no other files import deleted components**

```bash
grep -r "ABTesting\|ExitIntentPopup\|LeadMagnet\|SocialProofToast\|TestimonialsCarousel\|TrustBar\|UrgencyBanner\|emailAutomation" src/ --include="*.tsx" --include="*.ts" -l
```

Expected: no results (only App.tsx was updated).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove 8 unused components and email automation stub"
```

---

### Task 3: Configure environment variables

**Files:**
- Create: `.env.local`
- Modify: `.env.example`

- [ ] **Step 1: Create `.env.local` with production values**

```bash
cat > .env.local << 'EOF'
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-67PJ02SXVN

# Meta Pixel (hardcoded in MetaPixel.tsx, env var for AnalyticsProvider)
VITE_FB_PIXEL_ID=238226887541404

# Microsoft Clarity
VITE_CLARITY_PROJECT_ID=

# JotForm
VITE_JOTFORM_FORM_ID=

# API
VITE_API_ENDPOINT=

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SOCIAL_PROOF=true
EOF
```

**BELANGRIJK:** Wouter moet het JotForm form ID en Clarity project ID zelf invullen.

- [ ] **Step 2: Update `.env.example`** — strip onnodige vars, voeg juiste toe

```
# Google Analytics 4
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Meta Pixel
VITE_FB_PIXEL_ID=

# Microsoft Clarity
VITE_CLARITY_PROJECT_ID=

# JotForm Form ID (het nummer uit de JotForm URL)
VITE_JOTFORM_FORM_ID=

# Feature flags
VITE_ENABLE_ANALYTICS=true
```

- [ ] **Step 3: Verify `.env.local` is in `.gitignore`**

```bash
grep -q ".env.local" .gitignore && echo "OK" || echo ".env.local >> .gitignore"
```

If not present, add it.

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: update .env.example with correct variable names"
```

---

## Phase 2: Core Assessment Pipeline

### Task 4: Configure JotForm embed

**Files:**
- Modify: `src/components/Assessment.tsx:12-13`

- [ ] **Step 1: Switch JotForm ID to env var**

In `src/components/Assessment.tsx`, replace lines 12-13:

```typescript
// OLD:
const JOTFORM_FORM_ID = "JOTFORM_ID_HIER";
const JOTFORM_EMBED_URL = `https://form.jotform.com/${JOTFORM_FORM_ID}`;

// NEW:
const JOTFORM_FORM_ID = import.meta.env.VITE_JOTFORM_FORM_ID || "";
const JOTFORM_EMBED_URL = `https://form.jotform.com/${JOTFORM_FORM_ID}`;
```

- [ ] **Step 2: Add fallback UI when JotForm ID is missing**

In the `JotFormView` component, add a check before the iframe (line ~254):

```tsx
{!JOTFORM_FORM_ID ? (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="bb-card p-8 text-center max-w-md">
      <p className="text-lg font-bold mb-2" style={{ color: 'var(--fg)' }}>
        Assessment tijdelijk niet beschikbaar
      </p>
      <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
        Neem contact op via{' '}
        <a href="mailto:info@recruitin.nl" style={{ color: 'var(--primary)' }}>
          info@recruitin.nl
        </a>
      </p>
    </div>
  </div>
) : (
  <iframe
    id="JotFormIFrame"
    title="Recruitment APK Assessment"
    onLoad={() => window.parent.scrollTo(0, 0)}
    allowTransparency={true}
    allow="geolocation; microphone; camera; fullscreen"
    src={JOTFORM_EMBED_URL}
    frameBorder="0"
    style={{
      width: '100%',
      height: '100%',
      minHeight: 'calc(100vh - 64px)',
      border: 'none',
      background: 'var(--bg)',
    }}
  />
)}
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: succeeds (ThankYou component not yet imported if we skipped Task 2 step 2 temporarily).

- [ ] **Step 4: Commit**

```bash
git add src/components/Assessment.tsx
git commit -m "feat: configure JotForm via env var with fallback UI"
```

---

### Task 5: Build scoring Vercel Function

**Files:**
- Create: `api/score.ts`
- Modify: `package.json` — add `resend` dependency
- Modify: `vercel.json` — configure functions

This is the core pipeline endpoint. JotForm webhook → this function → Pipedrive + Resend + Slack.

- [ ] **Step 1: Install dependencies**

```bash
npm install resend
```

- [ ] **Step 2: Update `vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/*.ts": {
      "memory": 256,
      "maxDuration": 30
    }
  }
}
```

- [ ] **Step 3: Create `api/score.ts`**

```typescript
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

interface JotFormSubmission {
  formID: string;
  submissionID: string;
  [key: string]: string;
}

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
  if (challenge.length > 50) score += 2; // Gedetailleerd antwoord = meer betrokkenheid

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
  // Zoek eerst op exacte key match
  for (const key of keywords) {
    if (data[key]) return data[key];
  }
  // Zoek op partial match in keys (JotForm stuurt q123_bedrijfsnaam etc.)
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

  // Zoek of maak organisatie
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

  // Zoek of maak persoon
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

  // Maak deal
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
  // Alleen POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse JotForm data (URL-encoded of JSON)
    const data: Record<string, string> =
      typeof req.body === 'string'
        ? Object.fromEntries(new URLSearchParams(req.body))
        : req.body;

    // Bereken score
    const lead = extractLead(data);

    if (!lead.email && !lead.companyName) {
      return res.status(400).json({ error: 'Geen email of bedrijfsnaam gevonden' });
    }

    let dealId: number | undefined;

    if (lead.score >= SCORE_THRESHOLD) {
      // Path A: Sales outreach
      const dealResult = await createPipedriveDeal(lead);
      dealId = dealResult.dealId;
      await sendConfirmationEmail(lead);
    }
    // Path B (score < threshold): Lemlist nurture wordt later toegevoegd

    // Slack notificatie altijd
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
```

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: succeeds (API functions are built separately by Vercel).

- [ ] **Step 5: Commit**

```bash
git add api/score.ts vercel.json package.json package-lock.json
git commit -m "feat: add scoring Vercel Function with Pipedrive + Resend + Slack"
```

---

### Task 6: Add Vercel env vars for scoring function

**Files:** none (Vercel dashboard or CLI)

- [ ] **Step 1: Set Vercel environment variables**

```bash
cd /Users/wouterarts/projects/Recruitment-APK
vercel env add PIPEDRIVE_API_TOKEN production
vercel env add RESEND_API_KEY production
vercel env add SLACK_WEBHOOK_URL production
```

Waarden:
- `PIPEDRIVE_API_TOKEN`: uit `~/recruitin/.env` (bestaande token)
- `RESEND_API_KEY`: nieuw aanmaken op resend.com → API Keys
- `SLACK_WEBHOOK_URL`: Slack app → Incoming Webhooks → nieuwe webhook voor #recruitment-leads channel

- [ ] **Step 2: Verify env vars are set**

```bash
vercel env ls
```

---

### Task 7: Create React ThankYou page

**Files:**
- Create: `src/components/ThankYou.tsx`

- [ ] **Step 1: Create ThankYou component**

```tsx
import { CheckCircle, Mail, Phone, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function ThankYou() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-16"
      style={{ background: 'var(--bg)', fontFamily: 'var(--font-b)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        {/* Succes icoon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(29,184,122,.12)', border: '2px solid rgba(29,184,122,.3)' }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: 'var(--green)' }} />
          </div>
        </div>

        {/* Titel */}
        <h1
          className="font-black uppercase mb-4"
          style={{
            fontFamily: 'var(--font-h)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.05,
            color: 'var(--fg)',
          }}
        >
          Assessment <span style={{ color: 'var(--green)' }}>Voltooid!</span>
        </h1>

        {/* Uitleg */}
        <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.65, marginBottom: '32px' }}>
          Bedankt voor het invullen van de Recruitment APK. Ons team analyseert je antwoorden
          en je ontvangt binnen <strong style={{ color: 'var(--fg)' }}>24 uur</strong> je
          persoonlijke rapport inclusief verbeterplan.
        </p>

        {/* Verwachtingen */}
        <div className="bb-card p-6 mb-8 text-left">
          <p className="bb-eyebrow mb-4">Wat kun je verwachten?</p>
          <ul className="space-y-3">
            {[
              'Bevestigingsmail met samenvatting',
              'Analyse door recruitment specialist',
              'APK-rapport met concrete verbeterpunten',
              'Optioneel: gratis strategiegesprek',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3" style={{ color: 'var(--muted)', fontSize: '14px' }}>
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--green)' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <a
            href="mailto:info@recruitin.nl"
            className="bb-btn bb-btn-ghost flex items-center gap-2"
            style={{ fontSize: '13px', padding: '10px 18px' }}
          >
            <Mail className="w-4 h-4" />
            info@recruitin.nl
          </a>
          <a
            href="tel:+31313410507"
            className="bb-btn bb-btn-ghost flex items-center gap-2"
            style={{ fontSize: '13px', padding: '10px 18px' }}
          >
            <Phone className="w-4 h-4" />
            Bel direct
          </a>
        </div>

        {/* Terug */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2"
          style={{ color: 'var(--primary)', fontSize: '14px', fontFamily: 'var(--font-m)', letterSpacing: '0.04em' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar homepage
        </Link>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: succeeds — App.tsx already imports `ThankYou` from Task 2.

- [ ] **Step 3: Commit**

```bash
git add src/components/ThankYou.tsx
git commit -m "feat: add ThankYou page for post-assessment redirect"
```

---

## Phase 3: Analytics & Tracking

### Task 8: Fix Meta Pixel — resolve duplicate initialization

**Files:**
- Modify: `src/components/MetaPixel.tsx`
- Modify: `src/components/AnalyticsProvider.tsx`

**Probleem:** MetaPixel.tsx hardcodes pixel ID `757606233848402`. AnalyticsProvider.tsx initialiseert FB Pixel NOGMAALS via env var. Twee pixels die mogelijk conflicteren. De brief noemt pixel `238226887541404`.

- [ ] **Step 1: Update MetaPixel.tsx — gebruik correcte pixel ID**

In `src/components/MetaPixel.tsx`, replace line 4:

```typescript
// OLD:
export const FB_PIXEL_ID = "757606233848402";

// NEW:
export const FB_PIXEL_ID = "238226887541404";
```

- [ ] **Step 2: Remove duplicate FB Pixel init from AnalyticsProvider.tsx**

In `src/components/AnalyticsProvider.tsx`, remove the entire FB Pixel block (lines 39-67). The `MetaPixel` component already handles initialization.

Replace the `useEffect` with only the GA4 part:

```tsx
useEffect(() => {
  // Initialiseer Google Analytics
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!gaId || gaId === 'G-XXXXXXXXXX') return;

  const gaScript = document.createElement('script');
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  gaScript.async = true;
  document.head.appendChild(gaScript);

  gaScript.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    }
    // @ts-ignore
    window.gtag = gtag;
    // @ts-ignore
    gtag('js', new Date());
    // @ts-ignore
    gtag('config', gaId, {
      page_path: window.location.pathname,
      cookie_flags: 'SameSite=None;Secure',
    });
  };
}, []);
```

- [ ] **Step 3: Update analytics.ts — fix default GA4 ID check**

In `src/lib/analytics.ts`, line 44:

```typescript
// OLD:
measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',

// NEW:
measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
```

- [ ] **Step 4: Build check**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/MetaPixel.tsx src/components/AnalyticsProvider.tsx src/lib/analytics.ts
git commit -m "fix: resolve duplicate Meta Pixel init, set correct pixel + GA4 IDs"
```

---

### Task 9: Fix MetaCampaignPage — switch from Typeform to JotForm

**Files:**
- Modify: `src/pages/MetaCampaignPage.tsx`

- [ ] **Step 1: Read current file fully**

```bash
cat src/pages/MetaCampaignPage.tsx
```

- [ ] **Step 2: Replace Typeform reference with JotForm**

Replace the Typeform ID and embed logic. Change line 8:

```typescript
// OLD:
const TYPEFORM_ID = "01KARGCADMYDCG24PA4FWVKZJ2";

// NEW:
const JOTFORM_FORM_ID = import.meta.env.VITE_JOTFORM_FORM_ID || "";
```

Replace the Typeform embed section with JotForm iframe (same pattern as `Assessment.tsx` JotFormView).

Remove `TypeformWindow` interface and `tf.load()` calls.

- [ ] **Step 3: Build check**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/MetaCampaignPage.tsx
git commit -m "fix: switch MetaCampaignPage from Typeform to JotForm embed"
```

---

## Phase 4: JotForm Webhook Configuration

### Task 10: Configure JotForm webhook to scoring endpoint

**Files:** none (JotForm dashboard)

- [ ] **Step 1: Deploy to Vercel first**

```bash
vercel deploy --prod
```

Note the production URL.

- [ ] **Step 2: Configure JotForm webhook**

1. Ga naar JotForm.com → je Recruitment APK formulier
2. Settings → Integrations → Webhooks
3. Voeg webhook URL toe: `https://recruitmentapk.nl/api/score` (of Vercel URL)
4. Method: POST
5. Format: URL-encoded (JotForm default)

- [ ] **Step 3: Test met JotForm test submission**

Vul het formulier in met testdata:
- Bedrijfsnaam: "Test BV"
- Email: warts@recruitin.nl
- Sector: Constructie
- Teamgrootte: 100

Verwacht:
- Slack notificatie met score
- Pipedrive deal "APK — Test BV" in Pipeline 14
- Bevestigingsmail naar warts@recruitin.nl

- [ ] **Step 4: Verifieer in Pipedrive**

Open Pipedrive → Pipeline 14 → controleer of de deal is aangemaakt.

---

## Phase 5: Final Polish

### Task 11: Set up JotForm redirect naar bedankpagina

**Files:** none (JotForm dashboard)

- [ ] **Step 1: In JotForm form settings**

1. Settings → Thank You Page → Redirect to URL
2. URL: `https://recruitmentapk.nl/bedankt`
3. Sla op

- [ ] **Step 2: Test de flow end-to-end**

1. Open https://recruitmentapk.nl
2. Klik "Ontdek Jouw Score"
3. Vul assessment in
4. Na submit → redirect naar `/bedankt`
5. Check: Slack notificatie, Pipedrive deal, bevestigingsmail

---

### Task 12: Update CLAUDE.md project entry

**Files:**
- Modify: `/Users/wouterarts/CLAUDE.md`

- [ ] **Step 1: Voeg RecruitmentAPK toe aan projectentabel**

Na de "Template Factory" rij, voeg toe:

```markdown
| **Recruitment APK** | Recruitment assessment pipeline | 🟢 LIVE | Locatie: `/Users/wouterarts/projects/Recruitment-APK/` |
```

- [ ] **Step 2: Verwijder "Recruitment APK: Report automation" uit TODO**

De Fase 2 taak is nu ingebouwd als Vercel Function.

- [ ] **Step 3: Commit**

```bash
git add /Users/wouterarts/CLAUDE.md
git commit -m "docs: add Recruitment APK to project index"
```

---

## Samenvatting per fase

| Fase | Tasks | Doel |
|------|-------|------|
| **1: Cleanup** | 1-3 | 25+ junk files weg, 8 ongebruikte components weg, env vars correct |
| **2: Pipeline** | 4-7 | JotForm embed werkt, scoring function live, Pipedrive + Resend + Slack |
| **3: Tracking** | 8-9 | GA4 + Meta Pixel correct, geen duplicaten, MetaCampaignPage gefixt |
| **4: Webhook** | 10 | JotForm → Vercel Function webhook actief |
| **5: Polish** | 11-12 | Bedankpagina redirect, CLAUDE.md bijgewerkt |

## Afhankelijkheden

- Task 4 (JotForm ID) vereist dat Wouter het JotForm form ID opgeeft
- Task 6 (env vars) vereist Vercel CLI ingelogd + Resend account
- Task 10 (webhook) vereist dat Task 5 gedeployed is naar Vercel
- Task 11 (redirect) vereist dat Task 7 (ThankYou) en Task 10 (deploy) af zijn
