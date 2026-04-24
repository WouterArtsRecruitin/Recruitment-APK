import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { trackLinkedInConversion } from './LinkedInInsightTag';

// ============================================================================
// TYPES
// ============================================================================

type TextScreen = { type: 'text'; id: string; question: string; hint?: string; placeholder: string; inputType?: string; required: boolean };
type ChoiceScreen = { type: 'choice'; id: string; question: string; hint?: string; options: string[]; required: boolean };
type RadioScreen = { type: 'radio'; id: string; question: string; options: string[]; required: boolean };
type ConsentScreen = { type: 'consent'; id: string; question: string; label: string; required: boolean };
type Screen = TextScreen | ChoiceScreen | RadioScreen | ConsentScreen;

// ============================================================================
// VRAGEN — 29 assessment + 7 contact (contact aan het einde voor hogere conversie)
// ============================================================================

const SCREENS: Screen[] = [
  // ── ASSESSMENT (29) ───────────────────────────────────────────────────
  {
    type: 'radio', id: 'q15_hoeVaak', required: true,
    question: 'Hoe vaak evalueert jullie organisatie het recruitment proces?',
    options: ['Nooit of sporadisch bij grote problemen', 'Jaarlijkse evaluatie op ad-hoc basis', 'Kwartaalbasis met gestructureerd overleg en actieplannen', 'Maandelijks met data-gedreven verbetercycli en continue optimalisatie'],
  },
  {
    type: 'radio', id: 'q16_beschiktJullie', required: true,
    question: 'Beschikt jullie organisatie over een gestructureerd onboarding programma?',
    options: ['Geen onboarding programma aanwezig', 'Basis introductie bij aanstelling, weinig structuur', 'Gestructureerd programma met begeleiding en checkpoints', 'Volledig geïntegreerd onboarding traject met mentoring en 90-dagen plan'],
  },
  {
    type: 'radio', id: 'q17_hoeMeet', required: true,
    question: 'Hoe meet jullie organisatie de effectiviteit van recruitment?',
    options: ['We meten dit niet', 'Informeel, alleen bij grote problemen', 'Systematische KPI tracking per kwartaal', 'Real-time dashboards met predictive analytics en benchmarks'],
  },
  {
    type: 'radio', id: 'q18_welkeModerne', required: true,
    question: 'Welke moderne recruitment tools gebruikt jullie organisatie?',
    options: ['Geen speciale tools, alleen handmatige processen', 'Basis tools (LinkedIn/Indeed), geen integratie', 'ATS met geautomatiseerde workflows en rapportages', 'Volledig geïntegreerd AI-recruitment platform end-to-end'],
  },
  {
    type: 'radio', id: 'q19_hoeIs', required: true,
    question: 'Hoe is de samenwerking tussen HR en hiring managers?',
    options: ['Minimale afstemming, volledig ad-hoc', 'Informele contactmomenten zonder structuur', 'Gestructureerde samenwerking met vaste overlegmomenten', 'Volledig geïntegreerd proces met gedeelde KPIs en verantwoordelijkheid'],
  },
  {
    type: 'radio', id: 'q20_hoeLang', required: true,
    question: 'Hoe lang duurt jullie gemiddelde recruitment proces?',
    options: ['Meer dan 3 maanden — processen lopen regelmatig vast', '2-3 maanden gemiddeld', '1-2 maanden via gestructureerde aanpak', 'Minder dan 1 maand dankzij geoptimaliseerd proces'],
  },
  {
    type: 'radio', id: 'q21_heeftJullie', required: true,
    question: 'Heeft jullie organisatie een duidelijke employer branding strategie?',
    options: ['Geen employer branding aanwezig', 'Basis aanwezigheid zonder strategie', 'Actieve employer branding met professionele content en campagnes', 'Premium employer brand met award-winning strategie en sterke marktpositie'],
  },
  {
    type: 'radio', id: 'q22_hoeGoed', required: true,
    question: 'Hoe goed zijn jullie recruitment processen gedocumenteerd?',
    options: ['Niet gedocumenteerd, iedereen werkt anders', 'Basisprocessen globaal genoteerd', 'Volledig gedocumenteerde procesbeschrijvingen en handboeken', 'Geïntegreerde procesflows met continue optimalisatie en versiebeheer'],
  },
  {
    type: 'radio', id: 'q23_welkPercentage', required: true,
    question: 'Welk percentage van jullie vacatures wordt intern vervuld?',
    options: ['0-10%, bijna altijd extern geworven', '10-25%, incidenteel intern', '25-40% intern via mobiliteitsbeleid', '40%+ via volledig gestructureerd intern mobiliteitsbeleid'],
  },
  {
    type: 'radio', id: 'q24_hoeVaak24', required: true,
    question: 'Hoe vaak trainen jullie hiring managers in interview technieken?',
    options: ['Nooit, geen training aanwezig', 'Eenmalig bij aanstelling of sporadisch', 'Jaarlijkse training met gestructureerd programma', 'Kwartaalreviews met gestructureerde train-the-trainer aanpak'],
  },
  {
    type: 'radio', id: 'q25_gebruiktJullie', required: true,
    question: 'Gebruikt jullie organisatie data-driven recruitment decisions?',
    options: ['Geen data gebruik bij beslissingen', 'Basis rapportages, weinig actie hierop', 'Systematische data-analyse bij elke beslissing', 'Volledig data-driven met predictive analytics en forecasting'],
  },
  {
    type: 'radio', id: 'q26_hoeProactief', required: true,
    question: 'Hoe proactief is jullie talent acquisition strategie?',
    options: ['Alleen reactief bij openstaande vacatures', 'Af en toe proactieve activiteiten zonder structuur', 'Gestructureerde proactieve pipelining en talent mapping', 'Voortdurende talent community met geautomatiseerde nurturing'],
  },
  {
    type: 'radio', id: 'q27_welkeDiversiteit', required: true,
    question: 'Welke diversiteit en inclusie maatregelen zijn er in recruitment?',
    options: ['Geen D&I beleid of bewustzijn', 'Bewustzijn aanwezig maar geen concrete actie', 'Gestructureerde D&I strategie met meetbare doelen', 'Volledig geïntegreerd D&I programma met aantoonbare resultaten'],
  },
  {
    type: 'radio', id: 'q28_hoeSnel', required: true,
    question: 'Hoe snel kunnen jullie reageren op urgente recruitment behoeften?',
    options: ['Meer dan 3 maanden — processen lopen vast', '2-3 maanden minimaal', 'Binnen een week dankzij gestructureerde processen', 'Binnen 24 uur via proactieve talentpool en netwerk'],
  },
  {
    type: 'radio', id: 'q29_hoeGoed29', required: true,
    question: 'Hoe goed is de candidate experience in jullie wervingsproces?',
    options: ['Minimale aandacht voor kandidaatervaring', 'Standaard communicatie zonder persoonlijke aandacht', 'Professionele begeleiding met feedback en duidelijke tijdlijnen', 'Uitgebreide gepersonaliseerde candidate journey van A tot Z'],
  },
  {
    type: 'radio', id: 'q30_welkeRecruitment', required: true,
    question: 'Welke recruitment marketing strategieën gebruikt jullie organisatie?',
    options: ['Geen actieve recruitment marketing', 'Alleen standaard vacatureadvertenties op job boards', 'Multi-channel aanpak met gerichte targeting', 'Geïntegreerde data-driven multi-channel campagnes met A/B testing'],
  },
  {
    type: 'radio', id: 'q31_hoeEffectief', required: true,
    question: 'Hoe effectief is jullie employee referral programma?',
    options: ['Geen referral programma aanwezig', 'Informeel programma zonder structuur of incentives', 'Gestructureerd programma met incentives en kwartaalrapportage', 'Geavanceerd automated referral systeem met data tracking en gamification'],
  },
  {
    type: 'radio', id: 'q32_hoeGoed32', required: true,
    question: 'Hoe goed wordt de cultural fit geëvalueerd tijdens recruitment?',
    options: ['Geen systematische cultural fit beoordeling', 'Ad-hoc op basis van gevoel en intuïtie', 'Gestructureerde cultural fit assessment als vast onderdeel', 'Volledig gevalideerde meetmethode met data en wetenschappelijke basis'],
  },
  {
    type: 'radio', id: 'q33_welkeTechnologie', required: true,
    question: 'Welke technologie wordt gebruikt voor candidate screening?',
    options: ['Alleen handmatige CV review, geen tools', 'Basis ATS gebruik voor opslag en beheer', 'Automated screening tools met scorecard systeem', 'AI-powered screening volledig geïntegreerd in selectieproces'],
  },
  {
    type: 'radio', id: 'q34_hoeWordt', required: true,
    question: 'Hoe wordt feedback verzameld van kandidaten na het proces?',
    options: ['Geen feedback verzameling', 'Informeel alleen bij klachten of problemen', 'Gestructureerde enquêtes na elk traject', 'Real-time systematische feedback met actieve opvolging en NPS tracking'],
  },
  {
    type: 'radio', id: 'q35_hoeEffectief35', required: true,
    question: 'Hoe effectief is de talent pool management?',
    options: ['Geen talent pool aanwezig', 'Basislijst met namen zonder actieve opvolging', 'Actieve talent pool met regelmatig gestructureerd contact', 'Volledig geautomatiseerde talent community met AI-matching en nurturing'],
  },
  {
    type: 'radio', id: 'q36_welkeAssessment', required: true,
    question: 'Welke assessment methoden worden gebruikt voor skills evaluatie?',
    options: ['Geen formele assessment, alleen gesprekken', 'Basis sollicitatievragen zonder gestructureerde methodiek', 'Gestructureerde assessments en praktijkopdrachten', 'Volledig geautomatiseerde validated assessment suite met benchmarking'],
  },
  {
    type: 'radio', id: 'q37_hoeWordt37', required: true,
    question: 'Hoe wordt de recruitment ROI gemeten en geoptimaliseerd?',
    options: ['ROI wordt niet gemeten', 'Basiscijfers bijgehouden, weinig analyse', 'Kwartaalrapportage met gestructureerde analyse en optimalisatie', 'Real-time ROI dashboard met voortdurende optimalisatie en forecasting'],
  },
  {
    type: 'radio', id: 'q38_hoeGoed38', required: true,
    question: 'Hoe goed is de communicatie met kandidaten tijdens het proces?',
    options: ['Minimale communicatie, kandidaten moeten zelf navragen', 'Standaard statusupdates alleen bij mijlpalen', 'Proactieve gestructureerde updates op vaste momenten', 'Volledig gepersonaliseerd geautomatiseerd communicatieproces'],
  },
  {
    type: 'radio', id: 'q39_welkeSocial', required: true,
    question: 'Welke social media strategieën worden gebruikt voor recruitment?',
    options: ['Geen social media gebruik voor recruitment', 'Sporadische posts zonder structuur of planning', 'Actieve multi-platform aanwezigheid met contentkalender', 'Geïntegreerde social media strategie met employee advocacy programma'],
  },
  {
    type: 'radio', id: 'q40_hoeEffectief40', required: true,
    question: 'Hoe effectief is de salary benchmarking en compensatiestrategie?',
    options: ['Geen benchmarking, salarissen ad-hoc bepaald', 'Jaarlijkse globale marktverkenning', 'Reguliere benchmarking met actuele externe marktdata', 'Real-time salary intelligence volledig geïntegreerd in recruitment'],
  },
  {
    type: 'radio', id: 'q41_welkeVideo', required: true,
    question: 'Welke video interviewing en remote assessment tools worden gebruikt?',
    options: ['Geen video tools, alleen fysieke gesprekken', 'Ad-hoc video calls zonder structuur', 'Gestructureerde video interview software met evaluatieformulieren', 'Volledig geïntegreerd AI-gestuurde video assessment platform'],
  },
  {
    type: 'radio', id: 'q42_hoeGoed42', required: true,
    question: 'Hoe goed wordt er samengewerkt met externe recruitment partners?',
    options: ['Geen externe partners of bureaus', 'Ad-hoc gebruik bij acute nood, geen afspraken', 'Gestructureerd partnernetwerk met duidelijke afspraken en SLAs', 'Strategisch geïntegreerd ecosysteem met preferred supplier agreements'],
  },
  {
    type: 'radio', id: 'q43_welkeContinuous', required: true,
    question: 'Welke continuous improvement processen zijn er voor recruitment?',
    options: ['Geen verbeterprocessen aanwezig', 'Incidenteel actie bij problemen, geen structuur', 'Kwartaalreviews met gestructureerde actieplannen', 'Voortdurend verbeterproces met maandelijkse data-gedreven retrospectives'],
  },

  // ── CONTACT (7) — AAN HET EINDE VOOR HOGERE CONVERSIE ─────────────────
  { type: 'text', id: 'bedrijfsnaam', question: 'Laatste stap — wat is de naam van jullie bedrijf?', hint: 'Zo kunnen we je rapport personaliseren', placeholder: 'bijv. Janssen Techniek BV', required: true },
  { type: 'text', id: 'naam', question: 'Jouw naam?', hint: 'Voornaam en achternaam', placeholder: 'bijv. Jan Janssen', required: true },
  { type: 'text', id: 'email', question: 'Zakelijk e-mailadres', hint: 'Hierop ontvang je het APK rapport', placeholder: 'jan@janssen.nl', inputType: 'email', required: true },
  { type: 'text', id: 'telefoon', question: 'Telefoonnummer', hint: 'Optioneel — overslaan kan via Volgende', placeholder: '+31 6 12 34 56 78', inputType: 'tel', required: false },
  {
    type: 'choice', id: 'sector', question: 'In welke sector is jullie bedrijf actief?', hint: 'Optioneel — overslaan kan via Volgende', required: false,
    options: ['Bouw & Constructie', 'Techniek / Engineering', 'Automation & Techniek', 'Productie & Industrie', 'Energie & Utilities', 'Transport & Logistiek', 'IT & Software', 'Overig'],
  },
  {
    type: 'choice', id: 'regio', question: 'In welke provincie is de hoofdvestiging?', hint: 'Optioneel — overslaan kan via Volgende', required: false,
    options: ['Groningen', 'Friesland', 'Drenthe', 'Overijssel', 'Flevoland', 'Gelderland', 'Utrecht', 'Noord-Holland', 'Zuid-Holland', 'Zeeland', 'Noord-Brabant', 'Limburg', 'Heel Nederland'],
  },
  {
    type: 'consent', id: 'privacy_consent', required: true,
    question: 'Nog één ding — we hebben je akkoord nodig',
    label: 'Ik ga akkoord met de <a href="/privacy" target="_blank" style="color:#09aedd;text-decoration:underline">privacyverklaring</a> en <a href="/voorwaarden" target="_blank" style="color:#09aedd;text-decoration:underline">algemene voorwaarden</a>.',
  },
];

const TOTAL_QUESTIONS = 29; // 29 assessment vragen (contact velden staan na deze)
const CONTACT_COUNT = 7;

const TOTAL = SCREENS.length;
const KEYS = ['A', 'B', 'C', 'D'];

// ============================================================================
// ANIMATIONS
// ============================================================================

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, y: 0 },
  exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -40 : 40 }),
};

// ============================================================================
// COMPONENT
// ============================================================================

export function TypeformAssessment({ onClose }: { onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [hp, setHp] = useState(''); // honeypot — mag nooit ingevuld zijn
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_FREE = 2;

  // Check rate limit bij start
  useEffect(() => {
    const count = parseInt(localStorage.getItem('apk_submissions') || '0');
    if (count >= MAX_FREE) setLimitReached(true);
  }, []);

  // Save-and-resume draft (P0-B)
  useEffect(() => {
    try {
      const draft = localStorage.getItem('apk_draft');
      if (!draft) return;
      const parsed = JSON.parse(draft);
      const age = Date.now() - (parsed.ts || 0);
      if (age > 24 * 3600 * 1000) {
        localStorage.removeItem('apk_draft');
        return;
      }
      const resumeIdx = parsed.idx || 0;
      if (resumeIdx <= 0) return; // niks om te hervatten
      // eslint-disable-next-line no-alert
      if (window.confirm(`Je hebt al een APK in gang gezet (stap ${resumeIdx + 1} van ${TOTAL}). Hervatten?`)) {
        setAnswers(parsed.answers || {});
        setIdx(resumeIdx);
      } else {
        localStorage.removeItem('apk_draft');
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const screen = SCREENS[idx];
  const progress = Math.round(((idx) / TOTAL) * 100);

  // Focus input on slide change
  useEffect(() => {
    if (screen.type === 'text') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [idx, screen.type]);

  const persistDraft = (nextAnswers: Record<string, string>, nextIdx: number) => {
    try {
      localStorage.setItem('apk_draft', JSON.stringify({ answers: nextAnswers, idx: nextIdx, ts: Date.now() }));
    } catch {
      /* ignore quota/privacy errors */
    }
  };

  const goNext = useCallback(() => {
    const val = answers[screen.id] || '';
    if (screen.required && !val.trim()) {
      setError(screen.type === 'consent' ? 'Je moet akkoord gaan om door te gaan' : 'Vul dit veld in om door te gaan');
      return;
    }
    if (screen.id === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setError('Voer een geldig e-mailadres in');
      return;
    }
    setError('');
    if (idx < TOTAL - 1) {
      setDir(1);
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      persistDraft(answers, nextIdx);
    } else {
      handleSubmit();
    }
  }, [answers, screen, idx]);

  const goPrev = useCallback(() => {
    if (idx > 0) {
      setDir(-1);
      const nextIdx = idx - 1;
      setIdx(nextIdx);
      persistDraft(answers, nextIdx);
      setError('');
    }
  }, [idx, answers]);

  const setAnswer = (id: string, val: string) => {
    setAnswers(prev => {
      const next = { ...prev, [id]: val };
      persistDraft(next, idx);
      return next;
    });
    setError('');
  };

  const selectRadio = (val: string) => {
    // Direct updaten EN persist zodat de autoshift de nieuwe answers meeneemt
    setAnswers(prev => {
      const next = { ...prev, [screen.id]: val };
      persistDraft(next, idx);
      return next;
    });
    setError('');
    setTimeout(() => {
      if (idx < TOTAL - 1) {
        setDir(1);
        const nextIdx = idx + 1;
        setIdx(nextIdx);
        persistDraft({ ...answers, [screen.id]: val }, nextIdx);
      } else {
        handleSubmit();
      }
    }, 350);
  };

  const handleSubmit = async () => {
    // Honeypot: als het verborgen veld ingevuld is, silent-fail (geen error)
    if (hp && hp.trim().length > 0) {
      setSubmitting(true);
      setTimeout(() => {
        window.location.href = '/bedankt';
      }, 1500);
      return;
    }

    setSubmitting(true);

    // Transform answers: voor radio-vragen sturen we de option-index (0-3) i.p.v. label-tekst
    const payloadAnswers: Record<string, unknown> = {};
    for (const s of SCREENS) {
      const raw = answers[s.id];
      if (raw === undefined || raw === '') continue;
      if (s.type === 'radio') {
        const optionIdx = s.options.indexOf(raw);
        payloadAnswers[s.id] = optionIdx >= 0 ? optionIdx : raw;
      } else {
        payloadAnswers[s.id] = raw;
      }
    }

    // UTM + referrer attribution (P1-B)
    const urlParams = new URLSearchParams(window.location.search);
    const attribution = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_content: urlParams.get('utm_content'),
      utm_term: urlParams.get('utm_term'),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      landing_path: (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('apk_landing_path'))
        || (window.location.pathname + window.location.search),
    };

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payloadAnswers,
          _attribution: attribution,
          website: hp, // honeypot — backend mag dit ook checken
        }),
      });
      const data = await res.json();

      // Meta Pixel: track Lead conversie
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Recruitment APK Assessment',
          content_category: 'Assessment',
        });
      }
      // GA4: track form submission
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', {
          event_category: 'assessment',
          event_label: 'apk_completed',
          value: 1,
        });
      }
      // LinkedIn: track conversie
      trackLinkedInConversion();

      // Rate limit: tel submission
      const count = parseInt(localStorage.getItem('apk_submissions') || '0');
      localStorage.setItem('apk_submissions', (count + 1).toString());

      // Draft opruimen — submission succesvol
      try { localStorage.removeItem('apk_draft'); } catch { /* ignore */ }

      if (data.rapportUrl) {
        window.location.href = data.rapportUrl;
      } else {
        window.location.href = '/bedankt';
      }
    } catch {
      setSubmitting(false);
      setError('Er ging iets mis. Probeer opnieuw.');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (submitting) return;
      if (e.key === 'Enter' && screen.type !== 'radio') goNext();
      if (e.key === 'ArrowDown' && screen.type !== 'text' && screen.type !== 'radio') goNext();
      if ((e.key === 'Escape' || e.key === 'ArrowUp') && screen.type !== 'text') goPrev();
      if (screen.type === 'radio') {
        const ki = KEYS.indexOf(e.key.toUpperCase());
        if (ki >= 0 && (screen as RadioScreen).options[ki]) {
          selectRadio((screen as RadioScreen).options[ki]);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, goNext, goPrev, submitting, selectRadio]);

  // Rate limit screen
  if (limitReached) {
    return (
      <div style={{ minHeight: '100dvh', background: '#05080c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Outfit, system-ui, sans-serif' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>{'\uD83D\uDD12'}</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f0f4f8', marginBottom: '8px' }}>Je 2 gratis APK-rapporten zijn gebruikt</h2>
          <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
            Je eerste {MAX_FREE} APK-rapporten waren gratis. Voor een 3e assessment (bijvoorbeeld een dochterbedrijf of andere business unit) betaal je {'€'}49 per rapport.
          </p>

          {/* Pricing card — extra assessment */}
          <div style={{ background: 'rgba(17,24,34,0.8)', border: '2px solid #09aedd', borderRadius: '16px', padding: '32px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#09aedd', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Extra APK-assessment</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '6px' }}>
              <span style={{ fontSize: '42px', fontWeight: 900, color: '#f0f4f8' }}>{'\u20AC'}49</span>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>per rapport</span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
              Eenmalig, vrijblijvend, geen abonnement
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', textAlign: 'left' }}>
              {[
                'Zelfde 29-vragen assessment',
                'Volledig AI-gegenereerd rapport',
                'SWOT + peer benchmark',
                'Actieplan 30/60/90 dagen',
                'PDF export',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', color: '#94a3b8' }}>
                  <span style={{ color: '#09aedd' }}>{'\u2713'}</span> {item}
                </div>
              ))}
            </div>
            <a href="https://buy.stripe.com/dRm7sE0Xnd9Vfs9fA34Rq06" target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', background: '#09aedd', color: '#05080c', padding: '16px', borderRadius: '10px', fontSize: '16px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
              Koop extra assessment ({'\u20ac'}49) {'\u2192'}
            </a>
          </div>

          {/* Upgrade bestaand rapport naar Verbeterplan \u20ac249 \u2014 secundair */}
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', lineHeight: 1.6 }}>
            Of upgrade je huidige rapport naar het{' '}
            <a href="https://buy.stripe.com/dRm14g8pP0n9a7P5Zt4Rq07" target="_blank" rel="noopener noreferrer" style={{ color: '#E8630A', textDecoration: 'underline', fontWeight: 600 }}>
              volledige Verbeterplan ({'\u20ac'}249)
            </a>{' '}
            {'\u2014'} unlock alle acties en KPI{"'"}s per categorie {'\u2192'}
          </div>

          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            Of <a href="https://wa.me/31614314593" target="_blank" rel="noopener noreferrer" style={{ color: '#09aedd', textDecoration: 'underline' }}>neem contact op</a> voor maatwerk
          </div>

          <button onClick={onClose} style={{ marginTop: '24px', background: 'none', border: '1px solid rgba(30,45,64,0.6)', borderRadius: '8px', padding: '10px 20px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
            SLUITEN
          </button>
        </motion.div>
      </div>
    );
  }

  // Loading screen
  if (submitting) {
    return (
      <div style={{ minHeight: '100dvh', background: '#05080c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 48, height: 48, border: '3px solid rgba(9,174,221,0.2)', borderTopColor: '#09aedd', borderRadius: '50%' }}
        />
        <div style={{ color: '#94a3b8', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Jouw APK wordt verwerkt...
        </div>
      </div>
    );
  }

  // Contact-velden staan NA de 29 assessment-vragen
  const isContact = idx >= TOTAL_QUESTIONS;
  const qNum = isContact
    ? `Stap ${idx - TOTAL_QUESTIONS + 1} van ${CONTACT_COUNT}`
    : `Vraag ${idx + 1} van ${TOTAL_QUESTIONS}`;

  return (
    <div style={{ minHeight: '100dvh', background: '#05080c', display: 'flex', flexDirection: 'column', fontFamily: 'Outfit, system-ui, sans-serif' }}>

      {/* ── HONEYPOT (anti-bot) — off-screen, aria-hidden, autocomplete off ── */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={hp}
        onChange={e => setHp(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', top: '-9999px', height: 0, width: 0, overflow: 'hidden', opacity: 0 }}
      />

      {/* ── PROGRESS BAR ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'rgba(30,45,64,0.6)', zIndex: 50 }}>
        <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #09aedd, #0cc0f4)', borderRadius: 2 }} />
      </div>

      {/* ── HEADER ── */}
      <div style={{ position: 'fixed', top: 3, left: 0, right: 0, height: 52, background: 'rgba(5,8,12,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(30,45,64,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 49 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: 'rgba(9,174,221,0.12)', border: '1px solid rgba(9,174,221,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#09aedd', letterSpacing: '0.08em' }}>APK</div>
          <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#f0f4f8' }}>Recruitment APK</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#94a3b8', letterSpacing: '0.08em' }}>{qNum}</span>
          <button onClick={onClose} style={{ background: 'rgba(30,45,64,0.6)', border: '1px solid rgba(30,45,64,0.6)', borderRadius: 6, padding: '6px 12px', color: '#94a3b8', fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.06em' }}>
            SLUITEN
          </button>
        </div>
      </div>

      {/* ── MAIN SLIDE ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 80px', minHeight: '100dvh' }}>
        <div style={{ maxWidth: 680, width: '100%' }}>

          {/* Section label */}
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#09aedd', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 2, background: '#09aedd', borderRadius: 1 }} />
            {isContact ? 'Contactgegevens' : 'Assessment'}
          </div>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={idx} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.28, ease: [0.25, 0.8, 0.25, 1] }}>

              {/* Question */}
              <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 700, color: '#f0f4f8', lineHeight: 1.3, marginBottom: 32, letterSpacing: '-0.01em' }}>
                {screen.question}
                {screen.required && <span style={{ color: '#09aedd', marginLeft: 4 }}>*</span>}
              </h2>

              {/* Hint */}
              {'hint' in screen && screen.hint && (
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#94a3b8', letterSpacing: '0.06em', marginTop: -20, marginBottom: 24 }}>
                  {screen.hint}
                </div>
              )}

              {/* TEXT INPUT */}
              {screen.type === 'text' && (
                <div style={{ marginBottom: 32 }}>
                  <input
                    ref={inputRef}
                    type={(screen as TextScreen).inputType || 'text'}
                    value={answers[screen.id] || ''}
                    onChange={e => setAnswer(screen.id, e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && goNext()}
                    placeholder={(screen as TextScreen).placeholder}
                    style={{
                      width: '100%', padding: '18px 20px', fontSize: 18, fontFamily: 'Outfit, sans-serif',
                      background: 'rgba(17,24,34,0.8)', border: `2px solid ${answers[screen.id] ? '#09aedd' : 'rgba(30,45,64,0.6)'}`,
                      borderRadius: 12, color: '#f0f4f8', outline: 'none', transition: 'border-color 0.15s',
                    }}
                  />
                  <div style={{ marginTop: 10, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#94a3b8', letterSpacing: '0.06em' }}>
                    Druk <strong style={{ color: '#f0f4f8' }}>Enter ↵</strong> om door te gaan
                  </div>
                </div>
              )}

              {/* CHOICE (dropdown-style grid) */}
              {screen.type === 'choice' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 32 }}>
                  {(screen as ChoiceScreen).options.map(opt => {
                    const selected = answers[screen.id] === opt;
                    return (
                      <button key={opt} onClick={() => { setAnswer(screen.id, opt); setTimeout(goNext, 300); }}
                        style={{
                          padding: '14px 16px', textAlign: 'left', fontSize: 14, fontFamily: 'Outfit, sans-serif',
                          background: selected ? 'rgba(9,174,221,0.12)' : 'rgba(17,24,34,0.8)',
                          border: `1px solid ${selected ? '#09aedd' : 'rgba(30,45,64,0.6)'}`,
                          borderRadius: 10, color: selected ? '#f0f4f8' : '#94a3b8', cursor: 'pointer',
                          transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                        {selected && <Check size={14} style={{ color: '#09aedd', flexShrink: 0 }} />}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* RADIO (4 opties) */}
              {screen.type === 'radio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                  {(screen as RadioScreen).options.map((opt, oi) => {
                    const selected = answers[screen.id] === opt;
                    return (
                      <motion.button key={opt} onClick={() => selectRadio(opt)} whileHover={{ y: -1 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', textAlign: 'left',
                          background: selected ? 'rgba(9,174,221,0.1)' : 'rgba(17,24,34,0.7)',
                          border: `1px solid ${selected ? '#09aedd' : 'rgba(30,45,64,0.6)'}`,
                          borderRadius: 12, color: selected ? '#f0f4f8' : '#94a3b8', cursor: 'pointer', width: '100%',
                          transition: 'all 0.15s', fontFamily: 'Outfit, sans-serif',
                        }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: selected ? '#09aedd' : 'rgba(30,45,64,0.8)',
                          border: `1px solid ${selected ? '#09aedd' : 'rgba(30,45,64,0.6)'}`,
                          fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 700,
                          color: selected ? '#05080c' : '#94a3b8', transition: 'all 0.15s',
                        }}>
                          {KEYS[oi]}
                        </div>
                        <span style={{ fontSize: 15, lineHeight: 1.45 }}>{opt}</span>
                      </motion.button>
                    );
                  })}
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.06em', marginTop: 4 }}>
                    Druk <strong>A – D</strong> om te selecteren
                  </div>
                </div>
              )}

              {/* CONSENT CHECKBOX */}
              {screen.type === 'consent' && (
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', padding: '18px 20px', background: answers[screen.id] === 'yes' ? 'rgba(9,174,221,0.08)' : 'rgba(17,24,34,0.7)', border: `1px solid ${answers[screen.id] === 'yes' ? '#09aedd' : 'rgba(30,45,64,0.6)'}`, borderRadius: 12, transition: 'all 0.15s' }}>
                    <input
                      type="checkbox"
                      checked={answers[screen.id] === 'yes'}
                      onChange={e => setAnswer(screen.id, e.target.checked ? 'yes' : '')}
                      aria-label="Privacy consent"
                      style={{ width: 20, height: 20, marginTop: 2, accentColor: '#09aedd', flexShrink: 0, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 15, color: '#f0f4f8', lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: (screen as ConsentScreen).label }} />
                  </label>
                </div>
              )}

              {/* Error */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ color: '#f87171', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.06em', marginBottom: 16 }}>
                  ⚠ {error}
                </motion.div>
              )}

              {/* Next button — text, choice, consent (not radio — auto-advances) */}
              {screen.type !== 'radio' && (
                <button onClick={goNext}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 28px', background: '#09aedd', border: 'none', borderRadius: 8,
                    color: '#05080c', fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                    letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(9,174,221,0.25)', transition: 'all 0.15s',
                  }}>
                  {idx === TOTAL - 1 ? 'Verstuur' : 'Volgende'}
                  <ArrowRight size={16} />
                </button>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 52, background: 'rgba(5,8,12,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(30,45,64,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 49 }}>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#94a3b8', letterSpacing: '0.06em' }}>
          {idx + 1} / {TOTAL}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={goPrev} disabled={idx === 0}
            style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(30,45,64,0.6)', border: '1px solid rgba(30,45,64,0.6)', color: idx === 0 ? 'rgba(148,163,184,0.3)' : '#94a3b8', cursor: idx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronUp size={16} />
          </button>
          <button onClick={goNext}
            style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(9,174,221,0.12)', border: '1px solid rgba(9,174,221,0.3)', color: '#09aedd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}
