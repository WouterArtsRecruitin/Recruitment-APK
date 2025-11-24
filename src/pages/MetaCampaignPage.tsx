import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Phone, MessageCircle, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { event as trackFbEvent } from '../components/MetaPixel';

// REPLACE WITH YOUR TYPEFORM ID
const TYPEFORM_ID = "01KARQKA6091587B0YQE19KZB5";

interface TypeformWindow extends Window {
  tf?: {
    load: () => void;
  };
}

export function MetaCampaignPage() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'assessment' | 'success'>('welcome');
  const [userData, setUserData] = useState({ firstName: '', email: '' });

  useEffect(() => {
    // Check for URL parameters to see if user has been redirected from Typeform
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    const firstName = params.get('first_name') || params.get('name') || '';
    const email = params.get('email') || '';

    if (stepParam === 'success' || params.get('typeform-submission-id')) {
      setUserData({ firstName, email });
      setCurrentStep('success');
      trackFbEvent('CompleteRegistration', { content_name: 'Recruitment Quickscan' });
    }
  }, []);

  // Re-initialize Typeform when switching to assessment step
  useEffect(() => {
    if (currentStep === 'assessment') {
      const scriptSrc = "//embed.typeform.com/next/embed.js";

      if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        document.body.appendChild(script);
      } else {
        const tfWindow = window as TypeformWindow;
        if (tfWindow.tf && typeof tfWindow.tf.load === 'function') {
          tfWindow.tf.load();
        }
      }
    }
  }, [currentStep]);

  const handleStart = () => {
    trackFbEvent('InitiateCheckout', { content_name: 'Recruitment Quickscan' });
    setCurrentStep('assessment');
  };

  // ---------------------------------------------------------------------------
  // SUCCESS VIEW
  // ---------------------------------------------------------------------------
  const SuccessView = () => (
    <div className="min-h-dvh relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden font-sans text-slate-200">
       <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>

       <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center"
       >
          <h2 className="text-2xl font-bold text-white mb-4">
            Bedankt!
          </h2>

          <p className="text-slate-300 mb-6 text-sm leading-relaxed">
            Je Recruitment APK Rapport wordt nu gemaakt en komt binnen 24 uur in je inbox.
          </p>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-8 text-sm">
            <p className="font-medium text-blue-200 mb-1">📧 Check je mail:</p>
            <p className="text-slate-300 break-all">{userData.email || 'je inbox'}</p>
            <p className="text-xs text-slate-500 mt-2">(check ook je spam!)</p>
          </div>

          <div className="w-full h-px bg-white/10 my-6"></div>

          <h3 className="text-lg font-semibold text-white mb-4">Wil je direct aan de slag?</h3>

          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 text-lg rounded-xl shadow-lg mb-8"
            onClick={() => window.open('https://calendly.com/recruitin/kennismaking', '_blank')}
          >
            <Calendar className="mr-2 w-5 h-5" />
            Boek gratis 15-min gesprek
          </Button>

          <div className="w-full h-px bg-white/10 my-6"></div>

          <p className="text-sm text-slate-400 mb-4">Of neem anders contact op:</p>

          <div className="flex flex-col gap-3">
            <a href="tel:0614314593" className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium border border-white/5">
              <Phone className="w-4 h-4 text-green-500" />
              Bel: 06 14314593
            </a>

            <a
              href={`https://wa.me/31614314593?text=${encodeURIComponent("Hi Wouter, ik heb net het assessment ingevuld!")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium border border-white/5"
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              WhatsApp: 06 14314593
            </a>
            <p className="text-[10px] text-slate-500 italic">
              (Opslaan & verstuur: "Hi Wouter, ik heb net het assessment ingevuld!")
            </p>
          </div>

          <div className="w-full h-px bg-white/10 my-6"></div>

          <p className="text-xs text-slate-500">
            Geen email na 24 uur? Bel 06 14314593
          </p>
       </motion.div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // CONVERSION COMPONENTS
  // ---------------------------------------------------------------------------
  const ValueCheckmarks = ({ centered = false }: { centered?: boolean }) => (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-6 mt-6 text-sm text-slate-300 ${centered ? 'items-center justify-center' : ''}`}>
      {['Direct benchmark score', 'Bespaartips op maat', 'Gratis PDF Rapport'].map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="bg-green-500/20 p-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
          </div>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );

  // ---------------------------------------------------------------------------
  // WELCOME VIEW - Meta Optimized Landing Page
  // ---------------------------------------------------------------------------
  const WelcomeView = () => (
    <div className="min-h-dvh relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden font-sans">
      {/* Background - Tech Minimalist */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-950"></div>
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full bg-blue-900/20 blur-[120px] opacity-50 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase mb-4 drop-shadow-2xl">
            Recruitment <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">APK</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 font-light max-w-3xl leading-relaxed mb-8">
            Deze quickscan met 10 vragen laat zien waar jouw wervingsproces hapert. Vergelijk jouw prestaties met de markt en ontvang binnen 24 uur jouw actieplan.
          </p>

          <div className="relative group inline-block mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 -z-10"></div>
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white text-lg md:text-xl px-12 py-8 h-auto rounded-full shadow-2xl transition-all font-bold tracking-wide w-full sm:w-auto"
            >
              Start Quickscan
              <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <ValueCheckmarks centered />

          <div className="mt-12 opacity-60 hover:opacity-100 transition-all duration-500">
             <a href="https://recruitin.nl" target="_blank" rel="noopener noreferrer" className="inline-block">
               <div className="text-2xl font-bold text-white">Recruitin</div>
             </a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 pt-8 border-t border-white/10 w-full max-w-2xl text-center"
        >
          <div className="mb-4">
            <div className="text-xl font-bold text-white mb-3 opacity-80">Recruitin</div>
            <p className="text-sm text-slate-400 italic">The Right People, Right Now</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-400">
            <a href="https://www.recruitin.nl" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
              www.recruitin.nl
            </a>
            <span className="hidden sm:inline text-slate-600">•</span>
            <a href="mailto:info@recruitin.nl" className="hover:text-orange-400 transition-colors">
              info@recruitin.nl
            </a>
            <span className="hidden sm:inline text-slate-600">•</span>
            <a href="tel:+31313410507" className="hover:text-orange-400 transition-colors">
              +31 313 410 507
            </a>
          </div>
        </motion.footer>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // ASSESSMENT VIEW
  // ---------------------------------------------------------------------------
  const AssessmentView = () => (
    <div className="fixed inset-0 w-full h-screen bg-slate-900 flex flex-col">
       <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-slate-900/50 backdrop-blur-md border-b border-white/10 z-50 flex-none">
          <div className="text-white font-bold text-lg">Recruitin</div>
          <button
            onClick={() => setCurrentStep('welcome')}
            className="text-slate-400 hover:text-white transition-colors text-xs md:text-sm font-medium"
          >
            Sluiten
          </button>
       </div>
       <div className="flex-1 w-full overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
          <div
            data-tf-live={TYPEFORM_ID}
            data-tf-iframe-props="title=Recruitment APK"
            data-tf-medium="snippet"
            style={{ width: '100%', height: '100%' }}
          ></div>
       </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------
  if (currentStep === 'success') {
    return <SuccessView />;
  }

  if (currentStep === 'assessment') {
    return <AssessmentView />;
  }

  return <WelcomeView />;
}
