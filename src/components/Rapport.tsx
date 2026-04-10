import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail, CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';

// Categorieën met vraagnummers (1-indexed)
const CATEGORIES = [
  { name: 'Proces & Strategie', questions: [1, 6, 8, 14], description: 'Evaluatie, documentatie, doorlooptijd en reactiesnelheid' },
  { name: 'Technologie & Tools', questions: [4, 19, 27], description: 'ATS, screening software, video interviewing' },
  { name: 'Talent Acquisition', questions: [9, 12, 17, 21], description: 'Sourcing, talent pools, referrals, interne mobiliteit' },
  { name: 'Employer Branding', questions: [7, 16, 25], description: 'Branding strategie, recruitment marketing, social media' },
  { name: 'Candidate Experience', questions: [2, 15, 18, 20, 24], description: 'Onboarding, communicatie, feedback, cultural fit' },
  { name: 'Data & Optimalisatie', questions: [3, 5, 10, 11, 13, 22, 23, 26, 28, 29], description: 'KPIs, ROI, training, D&I, samenwerking, continuous improvement' },
];

function getScoreColor(percent: number): string {
  if (percent >= 70) return '#16a34a';
  if (percent >= 40) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(percent: number): string {
  if (percent >= 80) return 'Excellent';
  if (percent >= 70) return 'Goed';
  if (percent >= 50) return 'Gemiddeld';
  if (percent >= 30) return 'Matig';
  return 'Kritiek';
}

function getScoreIcon(percent: number) {
  if (percent >= 70) return <CheckCircle className="w-5 h-5" />;
  if (percent >= 40) return <AlertTriangle className="w-5 h-5" />;
  return <XCircle className="w-5 h-5" />;
}

function getAdvice(catName: string, percent: number): string {
  if (percent >= 70) {
    const good: Record<string, string> = {
      'Proces & Strategie': 'Jullie processen zijn goed ingericht. Focus op het vasthouden van deze standaard en deel best practices met nieuwe teamleden.',
      'Technologie & Tools': 'Goede tooling in huis. Overweeg of AI-integraties de volgende stap kunnen zijn voor nog meer efficiency.',
      'Talent Acquisition': 'Sterke talent acquisition. Blijf investeren in talent pools om proactief te blijven sourcen.',
      'Employer Branding': 'Jullie employer brand is sterk. Meet de impact en optimaliseer continu op basis van data.',
      'Candidate Experience': 'Goede candidate experience. Gebruik NPS metingen om de journey te blijven verbeteren.',
      'Data & Optimalisatie': 'Data-gedreven aanpak werkt. Implementeer predictive analytics voor de volgende stap.',
    };
    return good[catName] || 'Goed op weg. Blijf optimaliseren.';
  }
  if (percent >= 40) {
    const medium: Record<string, string> = {
      'Proces & Strategie': 'Jullie processen zijn functioneel maar kunnen strakker. Documenteer workflows en stel kwartaalevaluaties in om doorlooptijden te verkorten.',
      'Technologie & Tools': 'Er is ruimte voor betere tooling. Een ATS en geautomatiseerde screening kunnen de efficiency fors verhogen.',
      'Talent Acquisition': 'Sourcing is overwegend reactief. Bouw een talent pool op en start met proactief candidate engagement.',
      'Employer Branding': 'Er is een basis maar geen actieve strategie. Investeer in multi-channel employer branding met meetbare campagnes.',
      'Candidate Experience': 'De basis is er maar niet gestructureerd. Implementeer een gestandaardiseerde candidate journey met feedback loops.',
      'Data & Optimalisatie': 'Jullie werken deels op data maar missen systematiek. Stel KPI dashboards in en train hiring managers structureel.',
    };
    return medium[catName] || 'Er is een basis maar verbetering is mogelijk. Focus op structuur en meetbaarheid.';
  }
  const low: Record<string, string> = {
    'Proces & Strategie': 'Recruitment processen zijn ad-hoc en niet gedocumenteerd. Start met het vastleggen van de huidige werkwijze en stel een evaluatiecyclus in.',
    'Technologie & Tools': 'Jullie werken grotendeels handmatig. Begin met een basis ATS en gestructureerde screening om direct tijd te besparen.',
    'Talent Acquisition': 'Volledig reactief — pas zoeken bij een vacature. Dit kost tijd en geld. Begin met het opbouwen van een eenvoudige talent database.',
    'Employer Branding': 'Geen employer branding strategie. Kandidaten weten niet waarom ze bij jullie zouden willen werken. Start met een overtuigend werkgeversprofiel.',
    'Candidate Experience': 'Kandidaten ervaren een rommelig proces. Dit leidt tot afhakers. Implementeer basis communicatie-templates en een onboarding checklist.',
    'Data & Optimalisatie': 'Geen metingen, geen inzicht. Zonder data kun je niet verbeteren. Begin met het bijhouden van doorlooptijd en cost-per-hire.',
  };
  return low[catName] || 'Dit gebied vraagt urgente aandacht. Begin met de basis en bouw van daaruit op.';
}

export function Rapport() {
  const [params] = useSearchParams();

  const score = parseInt(params.get('score') || '0');
  const maxScore = parseInt(params.get('max') || '290');
  const company = params.get('company') || 'Uw bedrijf';
  const contact = params.get('contact') || '';
  const sector = params.get('sector') || '';
  const catScoresRaw = params.get('cats') || '';

  const scorePercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const scoreColor = getScoreColor(scorePercent);

  // Categorie scores decoderen: "70,45,30,60,55,40"
  const catScores = catScoresRaw ? catScoresRaw.split(',').map(Number) : CATEGORIES.map(() => scorePercent);

  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)', fontFamily: 'var(--font-b)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{ background: 'rgba(11,16,23,.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between h-16 px-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded"
              style={{ background: 'rgba(9,174,221,.1)', border: '1px solid rgba(9,174,221,.3)', fontFamily: 'var(--font-m)', color: 'var(--primary)', fontSize: '11px', fontWeight: 600 }}
            >
              APK
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Recruitment APK
              </div>
              <div style={{ fontFamily: 'var(--font-m)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Assessment Rapport
              </div>
            </div>
          </div>
          <Link to="/" className="bb-btn bb-btn-ghost" style={{ padding: '8px 16px', fontSize: '12px' }}>
            <ArrowLeft className="w-3 h-3" /> Terug
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Rapport Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="bb-eyebrow mb-4">Recruitment Maturity Assessment</p>
          <h1 className="font-black uppercase mb-2" style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.05, color: 'var(--fg)' }}>
            APK Rapport
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
            {company}{sector ? ` — ${sector}` : ''}
          </p>
          {contact && <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>{contact}</p>}
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bb-card p-8 mb-8 text-center"
        >
          <p className="bb-eyebrow mb-6">Totaalscore</p>
          <div className="flex justify-center mb-4">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{ border: `4px solid ${scoreColor}` }}
            >
              <div>
                <div style={{ fontSize: '36px', fontWeight: 900, color: scoreColor, fontFamily: 'var(--font-h)', lineHeight: 1 }}>
                  {scorePercent}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-m)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '4px' }}>
                  {score}/{maxScore}
                </div>
              </div>
            </div>
          </div>
          <span
            className="bb-tag"
            style={{
              background: `${scoreColor}20`,
              color: scoreColor,
              border: `1px solid ${scoreColor}40`,
              fontSize: '13px',
              padding: '6px 16px',
            }}
          >
            {getScoreLabel(scorePercent)}
          </span>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '16px', maxWidth: '500px', margin: '16px auto 0' }}>
            {scorePercent >= 70
              ? 'Jullie recruitment proces is bovengemiddeld. Er zijn gerichte verbetermogelijkheden om naar het volgende niveau te groeien.'
              : scorePercent >= 40
              ? 'Er is een solide basis maar meerdere gebieden vragen aandacht om competitief te blijven in de huidige arbeidsmarkt.'
              : 'Jullie recruitment proces heeft urgente verbeterpunten. Zonder actie lopen jullie kandidaten en omzet mis.'}
          </p>
        </motion.div>

        {/* Categorieën */}
        <div className="space-y-4 mb-12">
          <p className="bb-eyebrow mb-2">Analyse per categorie</p>
          {CATEGORIES.map((cat, i) => {
            const catPercent = catScores[i] || scorePercent;
            const catColor = getScoreColor(catPercent);
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="bb-card p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div style={{ color: catColor }}>{getScoreIcon(catPercent)}</div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '16px', color: 'var(--fg)' }}>
                        {cat.name}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-m)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.04em' }}>
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className="bb-tag"
                    style={{ background: `${catColor}15`, color: catColor, border: `1px solid ${catColor}30`, whiteSpace: 'nowrap' }}
                  >
                    {catPercent}%
                  </span>
                </div>
                {/* Score bar */}
                <div style={{ background: 'var(--bg)', borderRadius: '4px', height: '6px', marginBottom: '12px' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${catPercent}%` }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                    style={{ background: catColor, borderRadius: '4px', height: '100%' }}
                  />
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6 }}>
                  {getAdvice(cat.name, catPercent)}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Wins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bb-card p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '20px' }}>Top 3 Quick Wins</h2>
          </div>
          <div className="space-y-4">
            {CATEGORIES
              .map((cat, i) => ({ ...cat, percent: catScores[i] || scorePercent }))
              .sort((a, b) => a.percent - b.percent)
              .slice(0, 3)
              .map((cat, i) => (
                <div key={cat.name} className="flex items-start gap-4 p-4" style={{ background: 'var(--bg)', borderRadius: '8px' }}>
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(9,174,221,.1)', border: '1px solid rgba(9,174,221,.3)', fontFamily: 'var(--font-h)', color: 'var(--primary)', fontWeight: 800, fontSize: '14px' }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--fg)', fontSize: '14px', marginBottom: '4px' }}>
                      {cat.name} <span style={{ color: getScoreColor(cat.percent), fontSize: '12px' }}>({cat.percent}%)</span>
                    </p>
                    <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.5 }}>
                      {getAdvice(cat.name, cat.percent)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center py-12"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="bb-eyebrow mb-4">Volgende stap</p>
          <h2 style={{ fontFamily: 'var(--font-h)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Gratis <span style={{ color: 'var(--primary)' }}>Strategiegesprek</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '28px', maxWidth: '500px', margin: '0 auto 28px' }}>
            Bespreek je rapport met een recruitment specialist. 30 minuten, geen verplichtingen.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/31614314593"
              target="_blank"
              rel="noopener noreferrer"
              className="bb-btn bb-btn-primary"
              style={{ fontSize: '15px', padding: '16px 32px' }}
            >
              WhatsApp ons →
            </a>
            <a href="mailto:info@recruitin.nl" className="bb-btn bb-btn-ghost" style={{ fontSize: '14px', padding: '14px 24px' }}>
              <Mail className="w-4 h-4" /> info@recruitin.nl
            </a>
            <a href="tel:+31313410507" className="bb-btn bb-btn-ghost" style={{ fontSize: '14px', padding: '14px 24px' }}>
              <Phone className="w-4 h-4" /> Bel direct
            </a>
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
