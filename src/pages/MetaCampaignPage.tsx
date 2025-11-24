import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Clock, Users, TrendingUp, Phone, Mail, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { event as trackFbEvent } from '../components/MetaPixel';

const TYPEFORM_ID = "01KARQKA6091587B0YQE19KZB5";
const TYPEFORM_SCRIPT_URL = "//embed.typeform.com/next/embed.js";

interface TypeformWindow extends Window {
  tf?: {
    load: () => void;
  };
}

export function MetaCampaignPage() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Typeform script
  useEffect(() => {
    if (!document.querySelector(`script[src="${TYPEFORM_SCRIPT_URL}"]`)) {
      const script = document.createElement('script');
      script.src = TYPEFORM_SCRIPT_URL;
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  // Reinitialize Typeform when modal opens
  useEffect(() => {
    if (showAssessment && scriptLoaded) {
      const tfWindow = window as TypeformWindow;
      if (tfWindow.tf && typeof tfWindow.tf.load === 'function') {
        tfWindow.tf.load();
      }
    }
  }, [showAssessment, scriptLoaded]);

  const handleStartAssessment = () => {
    trackFbEvent('Lead', {
      content_name: 'Recruitment APK - Meta Campaign',
      content_category: 'Assessment',
    });
    setShowAssessment(true);
  };

  const benefits = [
    { icon: Clock, text: '10 vragen, 3 minuten', color: 'text-blue-500' },
    { icon: TrendingUp, text: 'Direct je benchmark score', color: 'text-green-500' },
    { icon: Users, text: 'Gratis actieplan op maat', color: 'text-purple-500' },
  ];

  const socialProof = [
    { metric: '200+', label: 'Bedrijven geholpen' },
    { metric: '4.9/5', label: 'Gemiddelde score' },
    { metric: '24u', label: 'Rapport klaar' },
  ];

  return (
    <>
      {/* Main Landing Page */}
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
        {/* Hero Section */}
        <div className="relative">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-20 sm:pb-32">
            {/* Logo/Brand */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Recruitin
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">The Right People, Right Now</p>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6">
                Verlies je nog steeds
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                  topkandidaten?
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Ontdek in 3 minuten waar jouw wervingsproces hapert en krijg een <span className="font-semibold text-white">gratis actieplan</span> om sneller betere mensen te vinden.
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12"
            >
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all"
                >
                  <benefit.icon className={`w-8 h-8 ${benefit.color} mx-auto mb-3`} />
                  <p className="text-sm sm:text-base font-medium">{benefit.text}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <Button
                onClick={handleStartAssessment}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xl px-12 py-8 h-auto rounded-full shadow-2xl transition-all font-bold group"
              >
                Start Gratis Quickscan
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-sm text-slate-400 mt-4">
                <CheckCircle2 className="w-4 h-4 inline mr-1 text-green-500" />
                100% Gratis • Geen creditcard nodig • Direct resultaat
              </p>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8 border-t border-white/10"
            >
              {socialProof.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-1">
                    {item.metric}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400">{item.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-slate-900/50 border-y border-white/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Wat krijg je?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Jouw APK Score',
                  description: 'Zie direct hoe jij scoort op 6 cruciale recruitment metrics',
                },
                {
                  title: 'Benchmark Vergelijking',
                  description: 'Vergelijk jezelf met 200+ andere bedrijven in jouw sector',
                },
                {
                  title: 'Persoonlijk Actieplan',
                  description: 'Krijg concrete stappen om morgen al betere resultaten te halen',
                },
                {
                  title: 'PDF Rapport',
                  description: 'Professioneel rapport om te delen met je team binnen 24u',
                },
                {
                  title: 'Gratis Adviesgesprek',
                  description: 'Optioneel 15-min gesprek om je vragen te beantwoorden',
                },
                {
                  title: '100% Gratis',
                  description: 'Geen verborgen kosten, geen verplichtingen, gewoon waardevol inzicht',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">
              Klaar om je recruitment te verbeteren?
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 mb-10">
              Start nu de gratis quickscan en ontvang binnen 24 uur je persoonlijke rapport
            </p>

            <Button
              onClick={handleStartAssessment}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xl px-12 py-8 h-auto rounded-full shadow-2xl transition-all font-bold group"
            >
              Start Nu Gratis
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
              <div className="text-center sm:text-left">
                <p className="font-semibold text-white mb-1">Recruitin</p>
                <p>The Right People, Right Now</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a href="https://www.recruitin.nl" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                  www.recruitin.nl
                </a>
                <span className="hidden sm:inline text-slate-600">•</span>
                <a href="mailto:info@recruitin.nl" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  info@recruitin.nl
                </a>
                <span className="hidden sm:inline text-slate-600">•</span>
                <a href="tel:+31313410507" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  +31 313 410 507
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Typeform Modal */}
      <AnimatePresence>
        {showAssessment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          >
            <div className="w-full h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-white/10">
                <div className="text-white font-bold text-lg">Recruitin</div>
                <button
                  onClick={() => setShowAssessment(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2"
                  aria-label="Sluiten"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Typeform Embed */}
              <div className="flex-1 w-full">
                <div data-tf-live={TYPEFORM_ID} className="w-full h-full"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
