import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

// ============================================================================
// WHATSAPP FLOATING BUTTON
// Provides direct contact option for visitors
// Expected conversion lift: +3-5%
// ============================================================================

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  position?: 'left' | 'right';
}

export function WhatsAppButton({
  phoneNumber = '31313410507', // +31 313 410 507 without + and spaces
  message = 'Hallo! Ik heb een vraag over de Recruitment APK.',
  position = 'right',
}: WhatsAppButtonProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Show tooltip after 10 seconds if user hasn't interacted
  React.useEffect(() => {
    if (hasInteracted) return;

    const timer = setTimeout(() => {
      setIsTooltipVisible(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setIsTooltipVisible(false), 5000);
    }, 10000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const handleClick = () => {
    setHasInteracted(true);
    setIsTooltipVisible(false);

    // Track click event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: 'floating_button',
      });
    }

    // Open WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const positionClasses = position === 'right' ? 'right-6' : 'left-6';
  const tooltipPosition = position === 'right' ? 'right-full mr-4' : 'left-full ml-4';

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: 'spring', damping: 15 }}
      className={`fixed bottom-6 ${positionClasses} z-50`}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {isTooltipVisible && (
          <motion.div
            initial={{ opacity: 0, x: position === 'right' ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: position === 'right' ? 10 : -10 }}
            className={`absolute ${tooltipPosition} bottom-0 whitespace-nowrap`}
          >
            <div className="relative bg-white rounded-lg shadow-xl px-4 py-3 text-slate-800 text-sm font-medium">
              <button
                onClick={() => {
                  setIsTooltipVisible(false);
                  setHasInteracted(true);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-300 transition-colors"
                aria-label="Sluiten"
              >
                <X className="w-3 h-3" />
              </button>
              <p>Vragen? Chat met ons!</p>
              {/* Arrow */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 ${
                  position === 'right' ? '-right-2' : '-left-2'
                } w-0 h-0 border-t-8 border-b-8 border-transparent ${
                  position === 'right'
                    ? 'border-l-8 border-l-white'
                    : 'border-r-8 border-r-white'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => !hasInteracted && setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 bg-[#25D366] hover:bg-[#20BA5C] rounded-full shadow-lg flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2"
        aria-label="Chat via WhatsApp"
      >
        {/* Pulse animation */}
        <motion.span
          className="absolute inset-0 rounded-full bg-[#25D366]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />

        {/* Icon */}
        <MessageCircle className="w-7 h-7 relative z-10" />
      </motion.button>

      {/* Online indicator */}
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-950"
        aria-label="Online"
      />
    </motion.div>
  );
}
