import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe, Mail, Phone, CheckCircle, Users, Star, Award, TrendingUp, X, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { WhatsAppButton } from './WhatsAppButton';

// ============================================================================
// CONSTANTS
// ============================================================================

// 🔧 JOTFORM: Vervang dit ID met jouw echte JotForm form ID
// Voorbeeld: "https://form.jotform.com/251234567890" → ID is "251234567890"
const JOTFORM_FORM_ID = "JOTFORM_ID_HIER";
const JOTFORM_EMBED_URL = `https://form.jotform.com/${JOTFORM_FORM_ID}`;

const CONTACT_INFO = {
  website: "www.recruitin.nl",
  email: "info@recruitin.nl",
  phone: "+31 313 410 507",
  websiteUrl: "https://www.recruitin.nl"
} as const;

// ============================================================================
// DATA
// ============================================================================

const testimonials = [
  {
    quote: "Binnen 24 uur hadden we een compleet rapport met concrete verbeterpunten. De ROI was al na 2 maanden zichtbaar.",
    result: "€32.000 bespaard op bureaus",
    name: "Jeroen Bakker",
    role: "CEO",
    company: "GreenBuild BV",
    avatar: "JB",
    industry: "Bouw & Constructie",
    rating: 5,
  },
  {
    quote: "We wisten dat er iets mis was met ons wervingsproces, maar niet waar. De APK gaf ons precies de inzichten die we nodig hadden.",
    result: "Doorlooptijd 40% verkort",
    name: "Sandra Visser",
    role: "HR Manager",
    company: "TechVision NL",
    avatar: "SV",
    industry: "Technology",
    rating: 5,
  },
  {
    quote: "Professioneel, snel en concreet. Geen vage adviezen maar een duidelijk actieplan. Dit is precies wat elke HR-afdeling nodig heeft.",
    result: "15 kandidaten extra per kwartaal",
    name: "Mark de Vries",
    role: "Operations Director",
    company: "LogiPro Groep",
    avatar: "MV",
    industry: "Logistiek",
    rating: 5,
  },
  {
    quote: "We zagen direct waar de bottlenecks zaten. Het verbeterplan was zo helder dat we het dezelfde week nog konden implementeren.",
    result: "Vacaturevervulling van 45% → 78%",
    name: "Lisa Hoekstra",
    role: "Talent Acquisition Lead",
    company: "ManuTech Systems",
    avatar: "LH",
    industry: "Productie & Industrie",
    rating: 5,
  },
];

const trustStats = [
  { icon: <Users className="w-4 h-4" />, value: '500+', label: 'Bedrijven geholpen' },
  { icon: <Star className="w-4 h-4" />, value: '4.9/5', label: 'Klanttevredenheid' },
  { icon: <TrendingUp className="w-4 h-4" />, value: '40%', label: 'Gem. kostenbesparing' },
  { icon: <Award className="w-4 h-4" />, value: '24 uur', label: 'Rapport levertijd' },
];

type AssessmentStep = 'welcome' | 'assessment';

// ============================================================================
// TESTIMONIALS CARROUSEL
// ============================================================================
function TestimonialsBlock() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const t = testimonials[currentIndex];

  return (
    <div
      className="w-full max-w-3xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <div className="text-center mb-8">
        <p className="bb-eyebrow mb-3">Klantresultaten</p>
        <h2 className="text-2xl md:text-3xl font-bold text-fg mb-2" style={{ fontFamily: 'var(--font-h)' }}>
          Wat onze klanten zeggen
        </h2>
        <p style={{ fontFamily: 'var(--font-m)', fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.06em' }}>
          500+ bedrijven verbeterden hun recruitment met de APK
        </p>
      </div>

      {/* Card */}
      <div className="relative px-8 md:px-14">
        {/* Nav arrows */}
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bb-card hover:border-primary transition-all"
          aria-label="Vorige"
        >
          <ChevronLeft className="w-4 h-4" style={{ color: 'var(--muted)' }} />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bb-card hover:border-primary transition-all"
          aria-label="Volgende"
        >
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted)' }} />
        </button>

        {/* Testimonial */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="bb-card p-6 md:p-8 text-center"
          >
            {/* Quote icon */}
            <div className="flex justify-center mb-5">
              <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'rgba(9,174,221,.1)', border: '1px solid rgba(9,174,221,.2)' }}>
                <Quote className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              </div>
            </div>

            {/* Quote */}
            <blockquote className="text-lg md:text-xl font-semibold mb-5 leading-relaxed" style={{ color: 'var(--fg)', fontFamily: 'var(--font-h)' }}>
              "{t.quote}"
            </blockquote>

            {/* Result badge */}
            <div className="flex justify-center mb-5">
              <span className="bb-tag bb-tag-green">📈 {t.result}</span>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4" style={{ color: '#f5a009', fill: '#f5a009' }} />
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, rgba(9,174,221,.3), rgba(9,174,221,.1))', border: '2px solid rgba(9,174,221,.4)', color: 'var(--primary)', fontFamily: 'var(--font-h)' }}
              >
                {t.avatar}
              </div>
              <div className="text-left">
                <p className="font-bold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-h)', fontSize: '15px' }}>{t.name}</p>
                <p style={{ fontFamily: 'var(--font-m)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.06em' }}>{t.role} — <span style={{ color: 'var(--primary)' }}>{t.company}</span></p>
              </div>
            </div>

            {/* Industry */}
            <div className="flex justify-center mt-4">
              <span className="bb-tag bb-tag-muted">{t.industry}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-5">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className="rounded-full transition-all"
            style={{
              width: i === currentIndex ? '24px' : '8px',
              height: '8px',
              background: i === currentIndex ? 'var(--primary)' : 'var(--border)',
            }}
            aria-label={`Ga naar testimonial ${i + 1}`}
          />
        ))}
      </div>

      {/* Rating footer */}
      <p className="text-center mt-4" style={{ fontFamily: 'var(--font-m)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.06em' }}>
        Gemiddelde score: 4.9/5 uit 127 beoordelingen
      </p>
    </div>
  );
}

// ============================================================================
// JOTFORM ASSESSMENT VIEW
// ============================================================================
function JotFormView({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 flex-none"
        style={{ background: 'rgba(11,16,23,.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}
      >
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
          onClick={onClose}
          className="flex items-center gap-2 transition-colors"
          style={{
            fontFamily: 'var(--font-m)', fontSize: '11px', letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'var(--muted)', background: 'var(--bg-up)',
            border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer'
          }}
          aria-label="Sluit assessment"
        >
          <X className="w-3 h-3" />
          Sluiten
        </button>
      </header>

      {/* JotForm Embed */}
      <main className="flex-1 w-full overflow-hidden" style={{ minHeight: '600px' }}>
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
      </main>
    </div>
  );
}

// ============================================================================
// MAIN ASSESSMENT COMPONENT
// ============================================================================
export function Assessment() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('welcome');

  const handleStart = useCallback(() => {
    setCurrentStep('assessment');
    window.scrollTo(0, 0);
  }, []);

  const handleClose = useCallback(() => {
    setCurrentStep('welcome');
  }, []);

  // Assessment view (JotForm)
  if (currentStep === 'assessment') {
    return <JotFormView onClose={handleClose} />;
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
              <span className="bb-tag bb-tag-primary">🎯 Gratis Assessment</span>
            </div>

            {/* H1 */}
            <h1
              className="font-black uppercase mb-6"
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

            {/* Trust bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center items-center gap-4 text-sm"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-m)', letterSpacing: '0.04em' }}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                <span>500+ bedrijven</span>
              </div>
              <span style={{ color: 'var(--border)' }}>•</span>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" style={{ color: '#f5a009', fill: '#f5a009' }} />
                <span>4.9/5 rating</span>
              </div>
              <span style={{ color: 'var(--border)' }}>•</span>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" style={{ color: 'var(--green)' }} />
                <span>Gratis & vrijblijvend</span>
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

        {/* ── TESTIMONIALS ───────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div className="max-w-4xl mx-auto">
            <TestimonialsBlock />
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
