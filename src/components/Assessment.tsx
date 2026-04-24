import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Mail, Phone, CheckCircle, Users, Star, Award } from 'lucide-react';
import { WhatsAppButton } from './WhatsAppButton';
import { TypeformAssessment } from './TypeformAssessment';

// ============================================================================
// CONSTANTS
// ============================================================================

const CONTACT_INFO = {
  website: "www.recruitin.nl",
  email: "info@recruitin.nl",
  phone: "+31 313 410 507",
  websiteUrl: "https://www.recruitin.nl"
} as const;

// ============================================================================
// DATA
// ============================================================================

// Trust-stats (echte product-facts, geen fake social proof)
const trustStats = [
  { icon: <CheckCircle className="w-4 h-4" />, value: '29', label: 'Vragen per assessment' },
  { icon: <Users className="w-4 h-4" />, value: '4', label: 'Categorieën' },
  { icon: <Star className="w-4 h-4" />, value: '5 min', label: 'Gemiddelde tijd' },
  { icon: <Award className="w-4 h-4" />, value: 'Gratis', label: 'Eerste 2 rapporten' },
];

type AssessmentStep = 'welcome' | 'assessment';

// ============================================================================
// DATA-STRIP (vervangt fake testimonials) — echte product facts
// ============================================================================
function DataStripBlock() {
  return (
    <div
      className="w-full max-w-4xl mx-auto"
      style={{
        padding: '48px 5%',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: 'var(--primary)',
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          marginBottom: 14,
          fontFamily: 'var(--font-m)',
        }}
      >
        Hoe wij scoren
      </div>
      <h2
        style={{
          fontSize: 'clamp(1.5rem, 3.2vw, 2rem)',
          margin: '0 0 24px',
          color: 'var(--fg)',
          lineHeight: 1.25,
          fontFamily: 'var(--font-h)',
          fontWeight: 800,
        }}
      >
        29 vragen {'·'} 4 categorieën {'·'} 1 score
      </h2>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 48,
          flexWrap: 'wrap',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-h)' }}>29</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-m)' }}>Vragen per assessment</div>
        </div>
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-h)' }}>4</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-m)' }}>Categorieën (Processen {'·'} Technologie {'·'} Talent {'·'} Data)</div>
        </div>
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-h)' }}>
            5<span style={{ fontSize: 24 }}>min</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-m)' }}>Gemiddelde tijd</div>
        </div>
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-h)' }}>0</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-m)' }}>Kosten voor eerste 2 rapporten</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN ASSESSMENT COMPONENT
// ============================================================================
export function Assessment() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('welcome');

  // First-touch landing path + query (voor UTM attributie na assessment submit)
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('apk_landing_path')) {
        sessionStorage.setItem(
          'apk_landing_path',
          window.location.pathname + window.location.search,
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleStart = useCallback(() => {
    setCurrentStep('assessment');
    window.scrollTo(0, 0);
  }, []);

  const handleClose = useCallback(() => {
    setCurrentStep('welcome');
  }, []);

  // Assessment view (custom Typeform-achtig)
  if (currentStep === 'assessment') {
    return <TypeformAssessment onClose={handleClose} />;
  }

  // Welcome (landing) view
  return (
    <div
      className="min-h-dvh relative flex flex-col overflow-hidden"
      style={{ background: 'var(--bg)', fontFamily: 'var(--font-b)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            radial-gradient(ellipse 70% 50% at 60% 40%, rgba(9,174,221,.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 20% 70%, rgba(9,174,221,.04) 0%, transparent 60%)
          `
        }} />
      </div>

      {/* Navbar */}
      <nav
        className="sticky top-0 z-50"
        style={{ background: 'rgba(11,16,23,.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between h-16 px-6 max-w-5xl mx-auto">
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
                by Recruitin
              </div>
            </div>
          </div>
          <button
            onClick={handleStart}
            className="bb-btn bb-btn-primary"
            style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '6px' }}
          >
            Start APK →
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section
          className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-16"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Eyebrow */}
            <div className="flex justify-center mb-6">
              <span className="bb-tag bb-tag-primary">GRATIS DOORLICHTING {'·'} 29 VRAGEN {'·'} 5 MINUTEN</span>
            </div>

            {/* H1 */}
            <h1
              className="font-black uppercase mb-3"
              style={{
                fontFamily: 'var(--font-h)',
                fontSize: 'clamp(3rem, 8vw, 6.5rem)',
                lineHeight: 1.0,
                letterSpacing: '-0.01em',
                color: 'var(--fg)',
              }}
            >
              Recruitment{' '}
              <span style={{ color: 'var(--primary)', textShadow: '0 0 40px rgba(9,174,221,0.3)' }}>APK</span>
            </h1>

            {/* Kicker — APK-metafoor expliciet */}
            <div
              style={{
                fontSize: 14,
                color: 'var(--primary)',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-m)',
                marginTop: 12,
                marginBottom: 20,
              }}
            >
              De gratis doorlichting van je wervingsproces
            </div>

            {/* Subheadline */}
            <p
              className="mb-8 mx-auto"
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: 'var(--muted)',
                lineHeight: 1.65,
                maxWidth: '620px',
              }}
            >
              Ontdek binnen 5 minuten waar jouw wervingsproces hapert, vergelijk je prestaties met de markt en ontvang{' '}
              <strong style={{ color: 'var(--fg)' }}>binnen 24 uur je APK-rapport inclusief verbeterplan</strong>.
            </p>

            {/* Value props */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
              {[
                { icon: <CheckCircle className="w-4 h-4" />, text: '100% Gratis', color: 'var(--green)' },
                { icon: <CheckCircle className="w-4 h-4" />, text: 'Binnen 5 minuten klaar', color: 'var(--green)' },
                { icon: <CheckCircle className="w-4 h-4" />, text: 'Direct inzicht', color: 'var(--green)' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: item.color, fontFamily: 'var(--font-m)', letterSpacing: '0.04em' }}
                >
                  {item.icon}
                  {item.text}
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="relative inline-block mb-8"
            >
              <motion.div
                className="absolute -inset-1 rounded-full -z-10"
                style={{ background: 'radial-gradient(ellipse, rgba(9,174,221,.35) 0%, transparent 70%)', filter: 'blur(12px)' }}
                animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                aria-hidden="true"
              />
              <button
                onClick={handleStart}
                className="bb-btn bb-btn-primary"
                style={{ fontSize: '18px', padding: '20px 52px', borderRadius: '8px', boxShadow: '0 0 32px rgba(9,174,221,0.35)' }}
                aria-label="Start jouw gratis recruitment APK assessment"
              >
                Ontdek Jouw Score
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </button>
            </motion.div>

            {/* Trust bar — product-facts, geen fake social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center items-center gap-4 text-sm"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-m)', letterSpacing: '0.04em' }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                <span>29 vragen</span>
              </div>
              <span style={{ color: 'var(--border)' }}>{'•'}</span>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                <span>4 categorieën</span>
              </div>
              <span style={{ color: 'var(--border)' }}>{'•'}</span>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" style={{ color: 'var(--green)' }} />
                <span>Gratis {'&'} vrijblijvend</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── METRICS STRIP ──────────────────────────────────────────── */}
        <section style={{ background: 'var(--bg-up)', borderBottom: '1px solid var(--border)', padding: '40px 24px' }}>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trustStats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(9,174,221,.08)', border: '1px solid rgba(9,174,221,.16)', color: 'var(--primary)' }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '22px', fontWeight: 800, color: 'var(--amber)' }}>{stat.value}</div>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DATA-STRIP (vervangt testimonials) ─────────────────────── */}
        <section style={{ padding: '40px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div className="max-w-4xl mx-auto">
            <DataStripBlock />
          </div>
        </section>

        {/* ── HOE HET WERKT ──────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-up)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="bb-eyebrow mb-4">Hoe het werkt</p>
            <h2 style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: '48px' }}>
              Jouw APK in 3 stappen
            </h2>
            <div
              className="grid grid-cols-3 gap-0 rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              {[
                { n: '01', label: 'Invullen', desc: 'Assessment < 5 min' },
                { n: '02', label: 'Analyse', desc: 'Expert review & benchmarks' },
                { n: '03', label: 'Rapport', desc: 'Verbeterplan binnen 24 uur' },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center text-center p-6"
                  style={{
                    background: 'var(--bg-card)',
                    borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-m)', fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Stap {step.n}
                  </div>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    {step.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-m)', fontSize: '11px', color: 'var(--muted)' }}>
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px', background: 'var(--bg)', textAlign: 'center' }}>
          <div className="max-w-2xl mx-auto">
            <p className="bb-eyebrow mb-4">Klaar voor de volgende stap?</p>
            <h2 style={{ fontFamily: 'var(--font-h)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3rem)', textTransform: 'uppercase', marginBottom: '16px', lineHeight: 1.05 }}>
              Start Jouw <span style={{ color: 'var(--primary)' }}>Gratis APK</span>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '36px', lineHeight: 1.65 }}>
              Geen verborgen kosten. Geen verplichtingen. Alleen concrete inzichten.
            </p>
            <button
              onClick={handleStart}
              className="bb-btn bb-btn-primary"
              style={{ fontSize: '18px', padding: '20px 52px', boxShadow: '0 0 32px rgba(9,174,221,0.3)', marginBottom: '32px' }}
            >
              Ontdek Jouw Score →
            </button>

            {/* Alt contact */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '28px', marginTop: '20px' }}>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>Liever direct contact?</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://wa.me/31313410507"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bb-btn bb-btn-ghost flex items-center gap-2"
                  style={{ fontSize: '14px', padding: '12px 22px', color: '#25D366', borderColor: 'rgba(37,211,102,0.3)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="bb-btn bb-btn-ghost flex items-center gap-2"
                  style={{ fontSize: '14px', padding: '12px 22px' }}
                >
                  <Mail className="w-4 h-4" />
                  {CONTACT_INFO.email}
                </a>
                <a
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="bb-btn bb-btn-ghost flex items-center gap-2"
                  style={{ fontSize: '14px', padding: '12px 22px' }}
                >
                  <Phone className="w-4 h-4" />
                  Bel direct
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 24px' }}>
          <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Recruitin
              </span>
              <span style={{ fontFamily: 'var(--font-m)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                The right people, right now
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href={CONTACT_INFO.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" style={{ fontFamily: 'var(--font-m)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.06em', transition: 'color 0.15s' }}>
                <Globe className="w-3 h-3" />
                {CONTACT_INFO.website}
              </a>
              <a href="/privacy.html" style={{ fontFamily: 'var(--font-m)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.06em', transition: 'color 0.15s' }}>
                Privacybeleid
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* WhatsApp floating button */}
      <WhatsAppButton />
    </div>
  );
}
