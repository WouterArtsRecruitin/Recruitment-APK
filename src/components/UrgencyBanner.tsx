import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Zap, X } from 'lucide-react';

// ============================================================================
// URGENCY BANNER
// Creates scarcity and urgency to increase conversions
// Expected conversion lift: +5-8%
// ============================================================================

type UrgencyType = 'spots' | 'time' | 'popularity';

interface UrgencyMessage {
  type: UrgencyType;
  icon: React.ReactNode;
  text: string;
  highlight: string;
}

const urgencyMessages: UrgencyMessage[] = [
  {
    type: 'spots',
    icon: <Users className="w-4 h-4" />,
    text: 'Nog',
    highlight: '3 gratis APK plaatsen deze week',
  },
  {
    type: 'time',
    icon: <Clock className="w-4 h-4" />,
    text: 'Rapport binnen',
    highlight: '24 uur in je inbox',
  },
  {
    type: 'popularity',
    icon: <Zap className="w-4 h-4" />,
    text: 'Vandaag al',
    highlight: '12 bedrijven gestart',
  },
];

interface UrgencyBannerProps {
  variant?: 'banner' | 'inline' | 'floating';
  showCloseButton?: boolean;
  rotateMessages?: boolean;
  rotateInterval?: number;
}

export function UrgencyBanner({
  variant = 'banner',
  showCloseButton = true,
  rotateMessages = true,
  rotateInterval = 5000,
}: UrgencyBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate through messages
  useEffect(() => {
    if (!rotateMessages) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % urgencyMessages.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [rotateMessages, rotateInterval]);

  // Check if banner was dismissed
  useEffect(() => {
    const dismissed = sessionStorage.getItem('urgencyBannerDismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('urgencyBannerDismissed', 'true');
  };

  const currentMessage = urgencyMessages[currentIndex];

  if (!isVisible) return null;

  // Banner variant - full width at top
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative bg-gradient-to-r from-orange-600 to-orange-500 text-white overflow-hidden"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                {currentMessage.icon}
                <span>{currentMessage.text}</span>
                <span className="font-bold">{currentMessage.highlight}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {showCloseButton && (
          <button
            onClick={handleClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
            aria-label="Sluiten"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  }

  // Inline variant - for use within content
  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {currentMessage.icon}
            </motion.span>
            <span>
              {currentMessage.text}{' '}
              <span className="font-semibold text-orange-300">
                {currentMessage.highlight}
              </span>
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  }

  // Floating variant - fixed position notification
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed bottom-24 left-6 z-40 max-w-xs"
      >
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="text-orange-400"
              >
                {currentMessage.icon}
              </motion.span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">
                {currentMessage.text}
              </p>
              <p className="text-orange-400 text-sm font-bold">
                {currentMessage.highlight}
              </p>
            </div>
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="text-slate-500 hover:text-white transition-colors p-1"
                aria-label="Sluiten"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Countdown timer component for special offers
export function CountdownTimer({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-2 text-white font-mono">
      <div className="bg-slate-800 px-3 py-2 rounded">
        <span className="text-2xl font-bold text-orange-400">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-xs text-slate-400 block">uur</span>
      </div>
      <span className="text-2xl text-orange-400">:</span>
      <div className="bg-slate-800 px-3 py-2 rounded">
        <span className="text-2xl font-bold text-orange-400">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-xs text-slate-400 block">min</span>
      </div>
      <span className="text-2xl text-orange-400">:</span>
      <div className="bg-slate-800 px-3 py-2 rounded">
        <span className="text-2xl font-bold text-orange-400">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-xs text-slate-400 block">sec</span>
      </div>
    </div>
  );
}
