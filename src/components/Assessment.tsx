import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { ArrowRight, Globe, Mail, Phone, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import logo from "figma:asset/87a4b7438908a4a6cba85a1fe483cdd1f613878a.png";
import { SocialProofToast } from './SocialProofToast';
import {
  trackAssessmentStarted,
  trackAssessmentCompleted,
  trackAssessmentAbandoned,
  trackTypeformEvent,
  trackContactClick,
  trackError,
} from '../lib/analytics';
import {
  heroSequence,
  heroTitle,
  heroSubtitle,
  heroCTA,
  staggerContainer,
  staggerItem,
  fadeInUp,
  hoverScale,
  hoverLift,
  tapScale,
  transitions,
} from '../lib/animations';

// ============================================================================
// CONSTANTS
// ============================================================================

const TYPEFORM_ID = "01KARGCADMYDCG24PA4FWVKZJ2";
const TYPEFORM_SCRIPT_URL = "//embed.typeform.com/next/embed.js";

const CONTACT_INFO = {
  website: "www.recruitin.nl",
  email: "info@recruitin.nl",
  phone: "+31 313 410 507",
  websiteUrl: "https://www.recruitin.nl"
} as const;

// ============================================================================
// TYPES
// ============================================================================

type AssessmentStep = 'welcome' | 'assessment';

interface TypeformWindow extends Window {
  tf?: {
    load: () => void;
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Assessment() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('welcome');
  const [isTypeformLoading, setIsTypeformLoading] = useState(false);
  const [typeformError, setTypeformError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // TYPEFORM SCRIPT LOADING
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (currentStep !== 'assessment') return;

    setIsTypeformLoading(true);
    setTypeformError(null);

    const scriptId = 'typeform-embed-script';
    const existingScript = document.getElementById(scriptId);

    // If script already loaded, just reinitialize
    const tfWindow = window as TypeformWindow;
    if (existingScript && tfWindow.tf?.load) {
      try {
        tfWindow.tf.load();
        setIsTypeformLoading(false);
        return;
      } catch (error) {
        console.error('Error loading Typeform:', error);
        const errorMessage = 'Er is een fout opgetreden bij het laden van de vragenlijst.';
        setTypeformError(errorMessage);
        setIsTypeformLoading(false);
        trackError(`Typeform load error: ${error}`, true);
        return;
      }
    }

    // Load script if not present
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = TYPEFORM_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      setIsTypeformLoading(false);
      if (tfWindow.tf?.load) {
        tfWindow.tf.load();
      }
    };

    script.onerror = () => {
      const errorMessage = 'Kan de vragenlijst niet laden. Probeer de pagina te vernieuwen.';
      setTypeformError(errorMessage);
      setIsTypeformLoading(false);
      trackError('Typeform script failed to load', true);
    };

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Only remove script if component unmounts, not on every step change
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove && currentStep === 'welcome') {
        scriptToRemove.remove();
      }
    };
  }, [currentStep]);

  // --------------------------------------------------------------------------
  // TYPEFORM EVENT TRACKING
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (currentStep !== 'assessment') return;

    const handleTypeformMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      switch (event.data.type) {
        case 'form-ready':
          trackTypeformEvent('loaded');
          break;

        case 'form-submit':
          trackAssessmentCompleted();
          trackTypeformEvent('submitted', event.data);
          // Optional: Redirect to thank you page
          setTimeout(() => {
            window.location.href = '/thank-you.html';
          }, 1000);
          break;

        case 'form-screen-changed':
          trackTypeformEvent('screen_changed', event.data);
          break;
      }
    };

    window.addEventListener('message', handleTypeformMessage);
    return () => window.removeEventListener('message', handleTypeformMessage);
  }, [currentStep]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  const handleStart = useCallback(() => {
    trackAssessmentStarted();
    setCurrentStep('assessment');
  }, []);

  const handleClose = useCallback(() => {
    trackAssessmentAbandoned();
    setCurrentStep('welcome');
  }, []);

  // --------------------------------------------------------------------------
  // RENDER: ASSESSMENT VIEW
  // --------------------------------------------------------------------------

  if (currentStep === 'assessment') {
    return (
      <div className="w-full h-dvh bg-slate-900 flex flex-col">
        {/* Header */}
        <header
          className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-slate-900/50 backdrop-blur-md border-b border-white/10 z-50 flex-none"
          role="banner"
        >
          <img
            src={logo}
            alt="Recruitin Logo"
            className="h-6 md:h-8 opacity-80 invert brightness-0"
            loading="eager"
          />
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded px-3 py-1"
            aria-label="Sluit assessment en keer terug naar welkomstpagina"
          >
            Sluiten
          </button>
        </header>

        {/* Typeform Container */}
        <main className="flex-1 w-full h-full bg-slate-900 relative overflow-hidden">
          {isTypeformLoading && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10"
              role="status"
              aria-live="polite"
            >
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-slate-400 text-sm">Assessment wordt geladen...</p>
              </div>
            </div>
          )}

          {typeformError && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10 p-4"
              role="alert"
              aria-live="assertive"
            >
              <div className="max-w-md text-center">
                <p className="text-red-400 text-lg mb-4">{typeformError}</p>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Terug naar start
                </Button>
              </div>
            </div>
          )}

          {!typeformError && (
            <div
              data-tf-live={TYPEFORM_ID}
              className="w-full h-full"
              aria-label="Recruitment APK vragenlijst"
            />
          )}
        </main>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: WELCOME VIEW
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-dvh relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {/* Base */}
        <div className="absolute inset-0 bg-slate-950" />

        {/* Top Glow - Depth behind header */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full bg-blue-900/20 blur-[120px] opacity-50 pointer-events-none" />

        {/* Subtle Grid Pattern - Fades out at bottom */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Noise Texture - High-end finish */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 flex flex-col items-center text-center"
        variants={heroSequence}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          <motion.div key="welcome">
            {/* Heading */}
            <motion.h1
              variants={heroTitle}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase mb-4 drop-shadow-2xl"
            >
              Recruitment{' '}
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 inline-block"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                APK
              </motion.span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={heroSubtitle}
              className="text-xl md:text-2xl text-slate-400 font-light max-w-4xl leading-relaxed mb-12 tracking-wide"
            >
              Ontdek binnen 5 minuten waar jouw wervingsproces hapert,{' '}
              <br className="hidden lg:block" />
              vergelijk jouw prestaties met de markt en ontvang{' '}
              <motion.span
                className="text-white font-bold"
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                binnen 24 uur je recruitment APK rapport inclusief adviezen & verbeterplan
              </motion.span>
              .
            </motion.p>

            {/* CTA Button */}
            <motion.div
              variants={heroCTA}
              className="relative group inline-block mb-12"
            >
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full blur -z-10"
                animate={{
                  opacity: [0.25, 0.4, 0.25],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                aria-hidden="true"
              />
              <motion.div whileHover={hoverLift} whileTap={tapScale}>
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-lg md:text-xl px-12 py-8 h-auto rounded-full shadow-2xl transition-all font-bold tracking-wide focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                  aria-label="Start de Recruitment APK Audit"
                >
                  Start de Audit
                  <motion.span
                    className="inline-block ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Footer - Recruitin Branding */}
            <motion.footer
              variants={staggerContainer}
              className="mt-24 md:mt-40 flex flex-col items-center gap-6"
            >
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={transitions.fast}
              >
                <img
                  src={logo}
                  alt="Recruitin - The right people, right now"
                  className="h-10 md:h-12 invert brightness-0 opacity-60 hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </motion.div>

              <motion.p
                variants={fadeInUp}
                className="text-slate-400 text-sm uppercase tracking-[0.2em] font-medium opacity-60"
              >
                The right people, right now
              </motion.p>

              {/* Contact Links */}
              <motion.nav
                variants={staggerContainer}
                className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-slate-500 text-sm font-medium tracking-wider"
                aria-label="Contact informatie"
              >
                <motion.a
                  variants={staggerItem}
                  href={CONTACT_INFO.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackContactClick('website')}
                  className="flex items-center gap-2 hover:text-orange-400 transition-colors duration-300 focus:outline-none focus:text-orange-400"
                  whileHover={hoverScale}
                  whileTap={tapScale}
                >
                  <Globe className="w-4 h-4" aria-hidden="true" />
                  <span>{CONTACT_INFO.website}</span>
                </motion.a>
                <motion.a
                  variants={staggerItem}
                  href={`mailto:${CONTACT_INFO.email}`}
                  onClick={() => trackContactClick('email')}
                  className="flex items-center gap-2 hover:text-orange-400 transition-colors duration-300 focus:outline-none focus:text-orange-400"
                  whileHover={hoverScale}
                  whileTap={tapScale}
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <span>{CONTACT_INFO.email}</span>
                </motion.a>
                <motion.a
                  variants={staggerItem}
                  href={`tel:${CONTACT_INFO.phone}`}
                  onClick={() => trackContactClick('phone')}
                  className="flex items-center gap-2 hover:text-orange-400 transition-colors duration-300 focus:outline-none focus:text-orange-400"
                  whileHover={hoverScale}
                  whileTap={tapScale}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>{CONTACT_INFO.phone}</span>
                </motion.a>
              </motion.nav>
            </motion.footer>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Social Proof Toast */}
      <SocialProofToast />
    </div>
  );
}
