import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

// ============================================================================
// EXIT INTENT POPUP
// Triggers when user moves mouse towards browser tab (desktop)
// Or after scroll up + time on page (mobile)
// Expected conversion lift: +10-15%
// ============================================================================

interface ExitIntentPopupProps {
  onClose?: () => void;
  onConvert?: (email: string) => void;
}

export function ExitIntentPopup({ onClose, onConvert }: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if popup was already shown this session
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('exitIntentShown');
    if (alreadyShown) {
      setHasShown(true);
    }
  }, []);

  // Desktop: Track mouse leaving viewport
  useEffect(() => {
    if (hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse moves to top of viewport (towards tab/URL bar)
      if (e.clientY <= 5 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    };

    // Delay enabling exit intent to avoid false triggers on page load
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000); // 5 seconds delay

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  // Mobile: Track scroll behavior + time on page
  useEffect(() => {
    if (hasShown) return;

    let lastScrollY = window.scrollY;
    let scrollUpCount = 0;
    let timeOnPage = 0;

    const scrollHandler = () => {
      const currentScrollY = window.scrollY;

      // If user scrolls up significantly and has been on page > 30 seconds
      if (currentScrollY < lastScrollY - 50 && timeOnPage > 30000) {
        scrollUpCount++;
        if (scrollUpCount >= 2 && !hasShown) {
          setIsVisible(true);
          setHasShown(true);
          sessionStorage.setItem('exitIntentShown', 'true');
        }
      }

      lastScrollY = currentScrollY;
    };

    const timeInterval = setInterval(() => {
      timeOnPage += 1000;
    }, 1000);

    // Only add scroll listener on touch devices
    if ('ontouchstart' in window) {
      window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [hasShown]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);

    // Simulate API call - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setIsLoading(false);
    onConvert?.(email);

    // Close popup after showing success
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  }, [email, isLoading, onConvert]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-intent-title"
          >
            <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10 p-1"
                aria-label="Sluiten"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content */}
              <div className="p-8 md:p-10">
                {!isSubmitted ? (
                  <>
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                      className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Gift className="w-8 h-8 text-orange-400" />
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      id="exit-intent-title"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl md:text-3xl font-bold text-white text-center mb-3"
                    >
                      Wacht even!
                    </motion.h2>

                    {/* Subtitle */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-slate-300 text-center mb-8 leading-relaxed"
                    >
                      Download gratis onze{' '}
                      <span className="text-orange-400 font-semibold">
                        "Recruitment Optimalisatie Checklist"
                      </span>{' '}
                      met 15 directe verbeterpunten voor jouw wervingsproces.
                    </motion.p>

                    {/* Benefits */}
                    <motion.ul
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-2 mb-8"
                    >
                      {[
                        'Direct toepasbare tips',
                        'Benchmark data uit 500+ bedrijven',
                        'Bespaart gemiddeld 40% wervingskosten',
                      ].map((benefit, index) => (
                        <li key={index} className="flex items-center gap-3 text-slate-300 text-sm">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </motion.ul>

                    {/* Form */}
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jouw@email.nl"
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        aria-label="E-mailadres"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 h-auto rounded-lg font-semibold transition-all disabled:opacity-50"
                      >
                        {isLoading ? (
                          'Verzenden...'
                        ) : (
                          <>
                            Download Gratis Checklist
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.form>

                    {/* Skip link */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      onClick={handleClose}
                      className="w-full mt-4 text-slate-500 text-sm hover:text-slate-300 transition-colors"
                    >
                      Nee bedankt, ik ga door naar de audit →
                    </motion.button>
                  </>
                ) : (
                  /* Success State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Check je inbox!
                    </h3>
                    <p className="text-slate-300">
                      De checklist is onderweg naar {email}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Bottom decoration */}
              <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
