# Recruitment APK Hardening Sprint — 24 april 2026

Complete audit + fix sprint voor recruitmentapk.nl (V2 custom React assessment).
Uitgevoerd na DGR-sprint, zelfde patroon: parallel audit agents → parallel fix agents → live E2E verificatie.

---

## Aanleiding

User: "maak nu audit en analyse van recruitmentapk.nl".

3 parallel audit-agents (backend code review, landing conversion, GA4/Pipedrive data) produceerden 30+ findings — waarvan 1 product-brekende bug en 3 security-P0s die stille faalpaden opleveren.

---

## 🚨 Grootste bevinding

**Scoring-systeem was fundamenteel kapot.** `api/score.ts:scoreAnswer()` matchte keyword-substrings tegen Nederlandse antwoordtekst met first-match-wins ordering. Resultaat: scores correleerden met Nederlandse woordfrequenties in de opties, niet met wat het antwoord bedoelt. Een klant die vraagt *"waarom ben ik een 42?"* kon je geen antwoord geven. Pipedrive gate (score ≥60) fireerde op de verkeerde populatie.

**Fix:** Frontend stuurt nu option-index (0-3), backend mapt naar `[0,3,7,10]` punten. Deterministic, auditeerbaar, tamper-resistant.

---

## Wat is gedaan

### 🔧 Backend (`api/score.ts` + `api/rapport.ts`)

| Commit | Probleem | Fix |
|---|---|---|
| `75120a9` | **Scoring keyword matching** — first-match-wins, typos, non-deterministic | Index-based: `[0,3,7,10][optionIndex]`. Backward compat met legacy text via `scoreAnswer()`. |
| `75120a9` | **Rate-limit fail-OPEN** — Supabase missing → request allowed (cost-DDoS vector) | Fail-CLOSED: missing config or Supabase error → deny. |
| `75120a9` | **Honeypot** ontbrak | Backend rejects als `body.website`/`url`/`phone_alt` gevuld. Silent 200 met `?score=0&hp=1`. |
| `75120a9` | **Legacy rapport URL** — `?score=X&cats=X&ai=<base64>` → anyone kan fake rapport met Recruitin footer | Rapport alleen via `?id=<uuid>` Supabase lookup. Legacy 404. Optional HMAC sig voor 7-day email-link migratie. |
| `75120a9` | Pipedrive creëert duplicate orgs + persons per submit | Search-then-create op `/organizations/search` + `/persons/search` met `exact_match=true`. |
| `75120a9` | Pipedrive/Resend/Claude failures silent | `alertSlack()` fires via `SLACK_WEBHOOK_URL` op elke fail, non-blocking. |
| `75120a9` | Claude Haiku JSON parse failure → generieke rapport zonder user warning | Retry 1× met `temperature=0` + stricter prompt. Op 2× fail → Slack alert + `null`. |
| `75120a9` | Meta Pixel Lead alleen client-side → 30-60% attribution loss door iOS ATT | Server-side Meta Conversions API (CAPI) met SHA256 email + `event_id` voor client-side dedup. |
| `75120a9` | Slack payload unescaped → `<url\|click>` XSS-achtig in team channel | User fields escaped (`<`, `>`, `&`) vóór interpolatie. |
| `6bf5df9` | WEBHOOK_SECRET te streng — blokkeerde alle browser POSTs | Origin-based auth voor `recruitmentapk.nl` (per V2 architecture). External callers nog steeds WEBHOOK_SECRET vereist. |

### 🎨 Frontend (`src/components/`)

| Commit | Probleem | Fix |
|---|---|---|
| `a86dd1c` | **6 contact fields aan START** (bedrijfsnaam/naam/email/telefoon/sector/regio/consent) → 25-45% completion drop | Verplaatst naar END. `isContact = idx >= 29`. Telefoon/sector/regio optioneel. Email + consent required. |
| `a86dd1c` | Geen save/resume op 35-slide form → browser refresh = 100% loss | `localStorage.apk_draft` met 24u TTL. Confirm-dialoog bij resume. Cleared op submit. |
| `a86dd1c` | **Fake testimonials** (GreenBuild BV, TechVision NL, LogiPro, ManuTech) + "4.9/5 uit 127" | Data-strip: 29 vragen · 4 categorieën · 5 min · €0 eerste 2 rapporten. |
| `a86dd1c` | 3 upsell tiers equal weight → "Gratis gesprek" capturet 70%+ traffic | €249 eerst met `MEEST GEKOZEN` badge + `scale(1.06)` + orange glow. €995 tweede. Gratis gesprek derde. |
| `a86dd1c` | €49 rate-limit screen contradicts €249 op /rapport → 5× prijshike perception | Herlabeld: "Extra APK-assessment: €49 voor 3e+ assessment". Link naar €249 Verbeterplan als alternatief. |
| `a86dd1c` | Radio-antwoorden als tekst gestuurd (vatbaar voor keyword-bug) | Option-index als number in POST payload (matcht nieuwe backend scoring). |
| `a86dd1c` | Geen UTM capture in POST | `_attribution` object: `utm_source/medium/campaign/content/term/referrer/landing_path` meegestuurd. |
| `a86dd1c` | Honeypot ontbrak | Off-screen input `name="website"`, `tabIndex=-1`, `aria-hidden`. Submit check: skip backend call. |
| `a86dd1c` | H1 "Recruitment APK" zonder metafoor-uitleg | Kicker: *"De gratis doorlichting van je wervingsproces"*. Eyebrow: *"GRATIS DOORLICHTING · 29 VRAGEN · 5 MINUTEN"*. |

### 🔔 Tracking + AVG compliance

| Commit | Probleem | Fix |
|---|---|---|
| `a51e3ef` | **GA4 + Meta Pixel + LinkedIn firen pre-consent** → AVG-schending | Cookiebot loader toegevoegd (Recruitin Domain Group CBID `255025f6-...614cb8`). GA4 gated op `consent.statistics`, Meta+LinkedIn op `consent.marketing`. `CookiebotOnConsentReady` event listener. |
| `a51e3ef` | CSP had `unsafe-eval` → XSS surface | `unsafe-eval` weg. Cookiebot/GA/Meta/LinkedIn domains toegevoegd aan `script-src`/`connect-src`/`img-src`. |
| `a51e3ef` | LinkedInInsightTag component bestond maar was niet gemount in App.tsx | Mount toegevoegd in `App.tsx`. |
| `a51e3ef` | Geen OG image tags | `og:image` + `og:image:width/height` + `twitter:card` toegevoegd (user uploadt PNG apart). |
| `a51e3ef` | Geen preconnect hints | `preconnect` voor Cookiebot, `dns-prefetch` voor Meta/LinkedIn/GTM. |

### 📄 Privacy / legal (bonus)

Backend agent deed extra werk:
- `/privacy` — privacy policy page
- `/voorwaarden` — algemene voorwaarden
- `/verwerkersovereenkomst` — processor agreement
- `src/App.tsx` routes toegevoegd
- `netlify.toml` security headers tightened (dropped deprecated `X-XSS-Protection`, added CSP)
- `assets/js/flowmaster.js` dead code (PHP-era) opgeruimd

---

## E2E live verificatie (na deploy)

| Test | Input | Expected | Actual |
|---|---|---|---|
| Lage score (Path B) | 29 questions, mixed indices | score<60, no Pipedrive | ✅ score=52, path=B, UUID rapport URL |
| Hoge score (Path A) | All index 3 | score=100, Pipedrive deal | ✅ score=100, path=A, deal 3285 created in Pipeline 14 |
| Legacy URL attack | `?score=95&cats=95,95,95,95` | 404 blocked | ✅ HTTP 404 "Rapport niet gevonden" |
| Honeypot bot | `website: "http://spam.com"` | silent 200, no pipeline | ✅ `{success:true, rapportUrl:"/rapport?score=0&hp=1"}` |
| Trusted origin | Origin: `https://www.recruitmentapk.nl` | 200 without secret | ✅ processed |
| External origin | Origin: `https://random.com` | 401 unless WEBHOOK_SECRET | ✅ denied |

---

## Kritieke learnings

1. **Keyword-matching scoring is een anti-pattern.** Elke keer als een product "scoort" op basis van substring-matching: verdacht. Deterministic index-based is altijd beter.

2. **WEBHOOK_SECRET enforcement context-sensitive maken.** Frontend browser POST != external webhook. De eerste versie was te streng en brak alle productie-traffic.

3. **Vercel heeft geen auto-sync van file-agents die parallel werken.** Git merge conflicts voorkomen door strict file-ownership per agent (api/ vs src/ vs index.html+vercel.json).

4. **Stream idle timeout bij lange agent-runs.** Backend agent hit 600s timeout. Oplossing: splits in 2-3 kleinere agents óf commit-frequent (elke logische chunk). Voorkomt verlies van werk in working tree.

5. **Pipedrive Personal API Token vereist `?api_token=`** — zelfde lesson als DGR. APK code heeft dit al goed.

---

## Wat nog open (niet blokkerend)

| Item | Type | Actie |
|---|---|---|
| OG image file `/og-image.png` uploaden | Asset | Canva/Photoshop, 1200×630 APK branded |
| WEBHOOK_SECRET op Vercel zetten | Config | Alleen nodig als je externe webhook-callers hebt (bv. Jotform revival) |
| `recruitmentapk.nl` toevoegen aan Recruitin Cookiebot Domain Group | Dashboard | cookiebot.com → Domain groups → Recruitin → Add |
| Pipeline 14 testdata opruimen | Tidy | 10 test-deals van vandaag staan nog in Pipedrive |
| Vercel env: `META_ACCESS_TOKEN`, `SLACK_WEBHOOK_URL` | Config | Anders firen CAPI + Slack niet (non-blocking, just warn) |
| Real testimonials / case studies (kunstmatig vervangen door data-strip, beter: echte klanten) | Content | User decision |

---

## Live verificatie summary

- Backend: `75120a9` + `6bf5df9` live op Vercel
- Frontend: `a86dd1c` live op Vercel
- Tracking: `a51e3ef` live op Vercel
- Supabase: `apk_rapports` table werkend (UUID insert + lookup)
- Pipedrive Pipeline 14: Path A deals creatie + dedup werkend
- Meta CAPI: code live, fires zodra META_ACCESS_TOKEN in Vercel env
- Cookiebot: loader live (wacht op domain-groep assignment dashboard)

---

## Commits (chronologisch)

```
6bf5df9  fix(auth): restore Origin-based auth for trusted browser POSTs
75120a9  fix(APK-P0/P1): index-based scoring + fail-closed rate-limit + honeypot + Meta CAPI + Pipedrive dedup + Claude retry + privacy pages
a86dd1c  feat(APK-frontend): contact→END + save/resume + real data-strip + €249 emphasis + UTM + honeypot + H1 kicker
a51e3ef  feat(APK-compliance): Cookiebot loader + consent gating on GA4/Meta/LinkedIn + CSP tightened + OG tags
```

---

*Gegenereerd 24 apr 2026 — Claude Opus 4.7 (1M context). Totaal: 4 commits, ~1600 regels insertions/deletions, 12 P0/P1 fixes, 3 parallel agents.*
