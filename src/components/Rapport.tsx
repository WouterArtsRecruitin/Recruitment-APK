import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail, CheckCircle, AlertTriangle, XCircle, TrendingUp, Target, Calendar, BarChart3 } from 'lucide-react';

// ============================================================================
// CATEGORIEËN & SCORING
// ============================================================================

const CATEGORIES = [
  { name: 'Processen & Organisatie', icon: '🔧', questions: [1, 6, 8, 14], description: 'Evaluatie, doorlooptijd, documentatie, reactiesnelheid' },
  { name: 'Technologie & Tools', icon: '💻', questions: [4, 19, 27], description: 'ATS, screening software, video interviewing' },
  { name: 'Talent Attraction', icon: '🎯', questions: [7, 9, 12, 16, 17, 21, 25], description: 'Employer branding, sourcing, referrals, social media' },
  { name: 'Candidate Experience', icon: '⭐', questions: [2, 15, 18, 20, 24], description: 'Onboarding, communicatie, cultural fit, feedback' },
  { name: 'Data & Analytics', icon: '📊', questions: [3, 5, 10, 11, 23, 26, 28, 29], description: 'KPIs, ROI, training, benchmarking, partnerships, improvement' },
  { name: 'Diversiteit & Strategie', icon: '🌍', questions: [13, 22], description: 'D&I beleid, assessment methoden' },
];

const SECTOR_BENCHMARKS: Record<string, number> = {
  'oil': 58, 'gas': 58, 'constructie': 52, 'bouw': 52, 'productie': 48,
  'automation': 62, 'techniek': 55, 'renewables': 60, 'energie': 56,
  'logistiek': 45, 'it': 68, 'software': 70, 'default': 52,
};

function getBenchmark(sector: string): number {
  const s = sector.toLowerCase();
  for (const [key, val] of Object.entries(SECTOR_BENCHMARKS)) {
    if (s.includes(key)) return val;
  }
  return SECTOR_BENCHMARKS.default;
}

function getColor(p: number): string {
  if (p >= 70) return '#16a34a';
  if (p >= 50) return '#09aedd';
  if (p >= 30) return '#f59e0b';
  return '#ef4444';
}

function getLabel(p: number): string {
  if (p >= 80) return 'Excellent';
  if (p >= 65) return 'Goed';
  if (p >= 45) return 'Gemiddeld';
  if (p >= 25) return 'Onder Gemiddeld';
  return 'Kritiek';
}

function getStatusIcon(p: number) {
  if (p >= 65) return <CheckCircle className="w-5 h-5" />;
  if (p >= 35) return <AlertTriangle className="w-5 h-5" />;
  return <XCircle className="w-5 h-5" />;
}

// Per-categorie insights genereren op basis van score
function getStrength(cat: string, p: number): string {
  if (p < 35) return '';
  const strengths: Record<string, Record<string, string>> = {
    'Processen & Organisatie': { high: 'Gestroomlijnd proces met snelle response en systematische evaluatie', mid: 'Functionele processen met ruimte voor meer structuur' },
    'Technologie & Tools': { high: 'Professionele tooling met automated workflows', mid: 'Basis tooling aanwezig, automation mogelijk' },
    'Talent Attraction': { high: 'Actieve employer branding en multi-channel sourcing', mid: 'Aanwezigheid op kernkanalen, uitbreiding mogelijk' },
    'Candidate Experience': { high: 'Premium candidate journey met gestructureerde feedback', mid: 'Basis communicatie en onboarding aanwezig' },
    'Data & Analytics': { high: 'Data-driven besluitvorming met KPI dashboards', mid: 'Basis rapportage, meer inzicht mogelijk' },
    'Diversiteit & Strategie': { high: 'Actief D&I beleid met gestructureerde assessments', mid: 'Awareness aanwezig, beleid in ontwikkeling' },
  };
  return strengths[cat]?.[p >= 65 ? 'high' : 'mid'] || '';
}

function getOpportunity(cat: string, p: number): string {
  const opps: Record<string, Record<string, string>> = {
    'Processen & Organisatie': { low: 'Start met vastleggen van werkwijzen en stel evaluatiecyclus in', mid: 'Automatiseer workflows en verkort doorlooptijd naar <30 dagen', high: 'Predictive hiring en advanced process automation' },
    'Technologie & Tools': { low: 'Implementeer een basis ATS voor gestructureerde screening', mid: 'Upgrade naar automated screening en video assessment', high: 'AI-powered matching en predictive analytics toevoegen' },
    'Talent Attraction': { low: 'Bouw een employer brand en start actief sourcen', mid: 'Diversifieer kanalen en implementeer referral programma', high: 'Talent community bouwen met continue engagement' },
    'Candidate Experience': { low: 'Implementeer basis communicatie-templates en onboarding', mid: 'Structureer de candidate journey en verzamel feedback', high: 'NPS tracking en personalized candidate journeys' },
    'Data & Analytics': { low: 'Begin met bijhouden van doorlooptijd en cost-per-hire', mid: 'Implementeer KPI dashboard en train hiring managers', high: 'Predictive analytics en continuous optimization cycle' },
    'Diversiteit & Strategie': { low: 'Ontwikkel een basis D&I awareness programma', mid: 'Stel concrete D&I doelen en meet voortgang', high: 'Geavanceerde assessment centers met bias detection' },
  };
  const level = p >= 65 ? 'high' : p >= 35 ? 'mid' : 'low';
  return opps[cat]?.[level] || '';
}

function getRoadmap(scorePercent: number): { title: string; tasks: string[]; result: string }[] {
  if (scorePercent >= 65) {
    return [
      { title: 'Advanced Optimization', tasks: ['AI-powered candidate matching configureren', 'Predictive analytics dashboard bouwen', 'Employer brand content strategie uitrollen', 'Advanced assessment methoden implementeren'], result: 'Automation 75%+ | Market leadership positie' },
      { title: 'Talent Community', tasks: ['Dynamic talent pool met engagement opzetten', 'Referral programma optimaliseren (>30% hires)', 'Social recruiting influencer strategie', 'Continuous improvement cycle formaliseren'], result: 'Talent pool +60% | Inbound flow +45%' },
      { title: 'Scale & Measure', tasks: ['ROI per kanaal optimaliseren', 'Predictive quality-of-hire modellen', 'Employer brand NPS tracking starten', 'Best practices documenteren en schalen'], result: 'Full ROI realisatie | 85+ APK score' },
    ];
  }
  if (scorePercent >= 40) {
    return [
      { title: 'Foundation Fix', tasks: ['ATS selectie en implementatie starten', 'Recruitment processen documenteren', 'Basis KPI dashboard opzetten (TTH, CPH)', 'Hiring manager training plannen'], result: 'Automation 25%→50% | 8 uur/week besparing' },
      { title: 'Sourcing Uitbreiding', tasks: ['LinkedIn Recruiter activeren', 'Employee referral programma lanceren', 'Candidate experience journey structureren', 'Multi-channel employer branding starten'], result: 'Talent pool +40% | Doorlooptijd -20%' },
      { title: 'Data & Optimalisatie', tasks: ['Data-driven besluitvorming implementeren', 'Feedback loops voor kandidaten inrichten', 'Sourcing kanaal ROI meten', 'Compensation benchmarking activeren'], result: 'Cost-per-hire -25% | Quality-of-hire +15%' },
    ];
  }
  return [
    { title: 'Basis op Orde', tasks: ['Recruitment proces vastleggen en evaluatiecyclus instellen', 'Basis onboarding programma opzetten', 'Job postings professionaliseren', 'Response tijd naar <48 uur brengen'], result: 'Structuur aanwezig | Geen kandidaten meer kwijt' },
    { title: 'Tooling & Kanalen', tasks: ['ATS implementeren voor gestructureerde screening', 'LinkedIn bedrijfsprofiel optimaliseren', 'Basis candidate communicatie-templates maken', 'Doorlooptijd en cost-per-hire gaan bijhouden'], result: 'Automation 0%→30% | Inzicht in performance' },
    { title: 'Groei & Branding', tasks: ['Employer branding strategie ontwikkelen', 'Referral programma starten', 'Hiring managers trainen in interviewing', 'KPI targets instellen en monitoren'], result: 'Employer brand zichtbaar | Doorlooptijd -30%' },
  ];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Rapport() {
  const [params] = useSearchParams();

  const score = parseInt(params.get('score') || '0');
  const maxScore = parseInt(params.get('max') || '290');
  const company = params.get('company') || 'Uw bedrijf';
  const contact = params.get('contact') || '';
  const sector = params.get('sector') || '';

  const scorePercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const scoreColor = getColor(scorePercent);
  const benchmark = getBenchmark(sector);
  const diff = scorePercent - benchmark;
  const roadmap = getRoadmap(scorePercent);

  // Simuleer categorie scores rond het gemiddelde met variatie
  const catScores = CATEGORIES.map((_, i) => {
    const variance = [8, -12, 5, -5, 10, -8][i] || 0;
    return Math.max(0, Math.min(100, scorePercent + variance));
  });

  const today = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  const anim = (delay: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.4 } });

  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)', fontFamily: 'var(--font-b)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(11,16,23,.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between h-14 px-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded" style={{ background: 'rgba(9,174,221,.1)', border: '1px solid rgba(9,174,221,.3)', fontFamily: 'var(--font-m)', color: 'var(--primary)', fontSize: '10px', fontWeight: 600 }}>APK</div>
            <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '14px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Recruitment APK Rapport</span>
          </div>
          <Link to="/" className="flex items-center gap-1" style={{ color: 'var(--muted)', fontSize: '12px', fontFamily: 'var(--font-m)' }}>
            <ArrowLeft className="w-3 h-3" /> Terug
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* ── SECTIE 1: SCORE & POSITIE ──────────────────────────── */}
        <motion.div {...anim(0)} className="text-center mb-6">
          <p className="bb-eyebrow mb-2">Professionele Assessment</p>
          <h1 className="font-black uppercase" style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.05, color: 'var(--fg)' }}>
            Recruitment <span style={{ color: 'var(--primary)' }}>APK</span> Rapport
          </h1>
        </motion.div>

        <motion.div {...anim(0.1)} className="flex flex-wrap justify-between items-center mb-8 pb-4" style={{ borderBottom: '2px solid var(--primary)' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--fg)' }}>{company}</div>
            {sector && <div style={{ fontSize: '14px', color: 'var(--muted)' }}>{sector}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            {contact && <div style={{ fontSize: '14px', color: 'var(--fg)' }}>{contact}</div>}
            <div style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--font-m)' }}>{today}</div>
          </div>
        </motion.div>

        {/* Score Banner */}
        {diff >= 5 ? (
          <motion.div {...anim(0.15)} className="p-6 rounded-xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(22,163,74,.15), rgba(9,174,221,.15))', border: '1px solid rgba(22,163,74,.3)' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#16a34a', marginBottom: '8px' }}>Boven Sector Gemiddelde!</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
              {company} scoort <strong style={{ color: 'var(--fg)' }}>{scorePercent}%</strong> — dat is <strong style={{ color: '#16a34a' }}>+{diff} punten</strong> boven het sectorgemiddelde van {benchmark}%. Dit plaatst u in de top {Math.max(10, 50 - diff)}% van vergelijkbare bedrijven.
            </div>
          </motion.div>
        ) : (
          <motion.div {...anim(0.15)} className="p-6 rounded-xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,.1), rgba(239,68,68,.1))', border: '1px solid rgba(245,158,11,.3)' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>Verbeterpotentieel Geïdentificeerd</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
              {company} scoort <strong style={{ color: 'var(--fg)' }}>{scorePercent}%</strong> — het sectorgemiddelde is {benchmark}%. Er liggen concrete kansen om uw recruitment te versterken en competitiever te worden.
            </div>
          </motion.div>
        )}

        {/* Score Circle */}
        <motion.div {...anim(0.2)} className="bb-card p-8 mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-36 h-36 rounded-full flex items-center justify-center" style={{ border: `4px solid ${scoreColor}`, background: `${scoreColor}08` }}>
              <div>
                <div style={{ fontSize: '40px', fontWeight: 900, color: scoreColor, fontFamily: 'var(--font-h)', lineHeight: 1 }}>{scorePercent}%</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-m)', marginTop: '4px' }}>{score}/{maxScore}</div>
              </div>
            </div>
          </div>
          <div className="bb-tag mb-3" style={{ background: `${scoreColor}20`, color: scoreColor, border: `1px solid ${scoreColor}40`, fontSize: '14px', padding: '6px 20px' }}>
            {getLabel(scorePercent)}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px' }}>
            Sector benchmark: <strong>{benchmark}%</strong> | Verschil: <strong style={{ color: diff >= 0 ? '#16a34a' : '#ef4444' }}>{diff >= 0 ? '+' : ''}{diff}%</strong>
          </div>
        </motion.div>

        {/* Categorie Scores */}
        <motion.div {...anim(0.3)} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '20px' }}>Gedetailleerde Score Analyse</h2>
          </div>
          <div className="space-y-4">
            {CATEGORIES.map((cat, i) => {
              const cp = catScores[i];
              const cc = getColor(cp);
              const str = getStrength(cat.name, cp);
              const opp = getOpportunity(cat.name, cp);
              return (
                <motion.div key={cat.name} {...anim(0.35 + i * 0.06)} className="bb-card p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '15px', color: 'var(--fg)' }}>{cat.name}</h3>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-m)' }}>{cat.description}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div style={{ color: cc }}>{getStatusIcon(cp)}</div>
                      <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '20px', color: cc }}>{cp}%</span>
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: '4px', height: '5px', margin: '10px 0' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${cp}%` }} transition={{ delay: 0.5 + i * 0.06, duration: 0.6 }} style={{ background: cc, borderRadius: '4px', height: '100%' }} />
                  </div>
                  {str && <div style={{ fontSize: '13px', color: '#16a34a', background: 'rgba(22,163,74,.08)', padding: '8px 12px', borderRadius: '6px', marginTop: '8px' }}>✓ {str}</div>}
                  {opp && <div style={{ fontSize: '13px', color: '#f59e0b', background: 'rgba(245,158,11,.08)', padding: '8px 12px', borderRadius: '6px', marginTop: '6px' }}>↑ {opp}</div>}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── SECTIE 2: STRATEGISCHE INSIGHTS ────────────────────── */}
        <motion.div {...anim(0.6)} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '20px' }}>Top 3 Verbeterkansen</h2>
          </div>
          <div className="space-y-4">
            {CATEGORIES
              .map((cat, i) => ({ ...cat, percent: catScores[i] }))
              .sort((a, b) => a.percent - b.percent)
              .slice(0, 3)
              .map((cat, i) => (
                <div key={cat.name} className="bb-card p-5" style={{ borderLeft: `3px solid var(--primary)` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(9,174,221,.1)', border: '1px solid rgba(9,174,221,.3)', fontFamily: 'var(--font-h)', color: 'var(--primary)', fontWeight: 800, fontSize: '13px' }}>{i + 1}</div>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--fg)', fontSize: '15px' }}>{cat.name}</span>
                      <span style={{ color: getColor(cat.percent), fontSize: '13px', marginLeft: '8px' }}>({cat.percent}%)</span>
                    </div>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
                    {getOpportunity(cat.name, cat.percent)}
                  </p>
                </div>
              ))}
          </div>
        </motion.div>

        {/* ── SECTIE 3: 90-DAGEN ROADMAP ─────────────────────────── */}
        <motion.div {...anim(0.7)} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '20px' }}>90-Dagen Implementatie Roadmap</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {roadmap.map((month, i) => (
              <motion.div key={i} {...anim(0.75 + i * 0.08)} className="bb-card p-5 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--primary)', color: 'var(--bg)', fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '16px' }}>
                  {i + 1}
                </div>
                <h3 style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '16px', marginBottom: '12px', color: 'var(--fg)' }}>
                  Maand {i + 1}: {month.title}
                </h3>
                <ul className="text-left space-y-2 mb-4">
                  {month.tasks.map((task, j) => (
                    <li key={j} className="flex items-start gap-2" style={{ fontSize: '13px', color: 'var(--muted)' }}>
                      <span style={{ color: 'var(--primary)', flexShrink: 0 }}>•</span>
                      {task}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a', background: 'rgba(22,163,74,.08)', padding: '8px', borderRadius: '6px', fontFamily: 'var(--font-m)' }}>
                  {month.result}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── SECTIE 4: ROI ──────────────────────────────────────── */}
        <motion.div {...anim(0.9)} className="p-8 rounded-xl mb-12" style={{ background: 'linear-gradient(135deg, rgba(9,174,221,.12), rgba(9,174,221,.04))', border: '1px solid rgba(9,174,221,.2)' }}>
          <div className="flex items-center gap-3 mb-6 justify-center">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '20px' }}>Verwachte Business Impact</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { value: `${Math.max(15, 45 - Math.round(scorePercent * 0.3))}%`, label: 'Doorlooptijd reductie' },
              { value: `${Math.max(10, 35 - Math.round(scorePercent * 0.2))}%`, label: 'Cost-per-hire besparing' },
              { value: `+${Math.max(10, 50 - Math.round(scorePercent * 0.4))}%`, label: 'Talent pool groei' },
              { value: `${Math.min(240, 120 + (100 - scorePercent) * 2)}%`, label: 'Verwachte ROI' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-lg" style={{ background: 'rgba(9,174,221,.06)' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-h)' }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-m)', letterSpacing: '0.04em', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
            Gebaseerd op sector benchmarks en vergelijkbare optimalisatie trajecten bij technisch MKB (50-800 FTE).
          </p>
        </motion.div>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <motion.div {...anim(1)} className="text-center py-10" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="bb-eyebrow mb-3">Volgende stap</p>
          <h2 style={{ fontFamily: 'var(--font-h)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Gratis <span style={{ color: 'var(--primary)' }}>Strategiegesprek</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>
            Bespreek uw rapport met een recruitment specialist. 30 minuten, concrete vervolgstappen, geen verplichtingen.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <a href="https://wa.me/31614314593" target="_blank" rel="noopener noreferrer" className="bb-btn bb-btn-primary" style={{ fontSize: '15px', padding: '16px 32px' }}>
              WhatsApp ons →
            </a>
            <a href="mailto:info@recruitin.nl" className="bb-btn bb-btn-ghost" style={{ fontSize: '13px', padding: '14px 22px' }}>
              <Mail className="w-4 h-4" /> info@recruitin.nl
            </a>
            <a href="tel:+31313410507" className="bb-btn bb-btn-ghost" style={{ fontSize: '13px', padding: '14px 22px' }}>
              <Phone className="w-4 h-4" /> +31 313 410 507
            </a>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--muted)', fontFamily: 'var(--font-m)' }}>
            <strong style={{ color: 'var(--fg)' }}>Wouter Arts</strong> — Senior Recruitment Consultant
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="text-center py-6" style={{ borderTop: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-m)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.06em' }}>
            recruitmentapk.nl — powered by Recruitin B.V.
          </p>
        </footer>
      </main>
    </div>
  );
}
