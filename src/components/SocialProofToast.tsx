import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Building2, TrendingUp } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SocialProofMessage {
  id: string;
  icon: React.ReactNode;
  text: string;
  subtext?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SOCIAL_PROOF_MESSAGES: SocialProofMessage[] = [
  {
    id: '1',
    icon: <Users className="w-5 h-5 text-orange-400" />,
    text: 'Jan de V. heeft zojuist de audit gestart',
    subtext: '2 minuten geleden'
  },
  {
    id: '2',
    icon: <Building2 className="w-5 h-5 text-orange-400" />,
    text: 'TechBouw BV heeft hun rapport ontvangen',
    subtext: '15 minuten geleden'
  },
  {
    id: '3',
    icon: <TrendingUp className="w-5 h-5 text-orange-400" />,
    text: '2.500+ bedrijven gingen je voor',
    subtext: 'Laatste 30 dagen'
  },
  {
    id: '4',
    icon: <Users className="w-5 h-5 text-orange-400" />,
    text: 'Sarah M. heeft de audit voltooid',
    subtext: '8 minuten geleden'
  },
  {
    id: '5',
    icon: <Building2 className="w-5 h-5 text-orange-400" />,
    text: 'Installatiegroep Noord beoordeelt hun proces',
    subtext: '12 minuten geleden'
  }
];

const TOAST_DISPLAY_DURATION = 4000; // 4 seconds
const TOAST_INTERVAL = 8000; // 8 seconds between toasts

// ============================================================================
// COMPONENT
// ============================================================================

export function SocialProofToast() {
  const [currentMessage, setCurrentMessage] = useState<SocialProofMessage | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Initial delay before first toast
    const initialDelay = setTimeout(() => {
      setCurrentMessage(SOCIAL_PROOF_MESSAGES[0]);
    }, 3000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (currentMessage === null) return;

    // Hide current toast after display duration
    const hideTimer = setTimeout(() => {
      setCurrentMessage(null);
    }, TOAST_DISPLAY_DURATION);

    // Show next toast after interval
    const showTimer = setTimeout(() => {
      const nextIndex = (messageIndex + 1) % SOCIAL_PROOF_MESSAGES.length;
      setMessageIndex(nextIndex);
      setCurrentMessage(SOCIAL_PROOF_MESSAGES[nextIndex]);
    }, TOAST_INTERVAL);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
    };
  }, [currentMessage, messageIndex]);

  return (
    <div
      className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        {currentMessage && (
          <motion.div
            key={currentMessage.id}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20
            }}
            className="flex items-start gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-lg px-4 py-3 shadow-2xl max-w-sm pointer-events-auto"
          >
            {/* Icon */}
            <div
              className="flex-shrink-0 mt-0.5"
              aria-hidden="true"
            >
              {currentMessage.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white leading-snug">
                {currentMessage.text}
              </p>
              {currentMessage.subtext && (
                <p className="text-xs text-slate-400 mt-1">
                  {currentMessage.subtext}
                </p>
              )}
            </div>

            {/* Subtle glow effect */}
            <div
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500/10 to-transparent opacity-50 -z-10"
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
