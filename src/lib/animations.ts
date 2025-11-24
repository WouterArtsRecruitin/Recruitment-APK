/**
 * Advanced Animation Configurations
 * Reusable Framer Motion variants and utilities
 */

import type { Variants, Transition } from 'framer-motion';

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

export const easings = {
  // Standard easings
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0.0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],

  // Snappy easings (voor UI interactions)
  snappy: [0.6, 0.01, 0.05, 0.95],
  smooth: [0.43, 0.13, 0.23, 0.96],

  // Bouncy easings (voor playful elements)
  bounce: [0.68, -0.55, 0.265, 1.55],
  softBounce: [0.34, 1.56, 0.64, 1],

  // Anticipation (voor belangrijke actions)
  anticipate: [0.22, 1, 0.36, 1],
} as const;

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

export const transitions = {
  // Fast interactions (buttons, hovers)
  fast: {
    duration: 0.2,
    ease: easings.snappy,
  } as Transition,

  // Medium (cards, modals)
  medium: {
    duration: 0.4,
    ease: easings.smooth,
  } as Transition,

  // Slow (page transitions)
  slow: {
    duration: 0.6,
    ease: easings.easeInOut,
  } as Transition,

  // Spring (bouncy elements)
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
  } as Transition,

  // Gentle spring
  gentleSpring: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
  } as Transition,

  // Snappy spring (buttons)
  snappySpring: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as Transition,
} as const;

// ============================================================================
// FADE VARIANTS
// ============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.medium,
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.medium,
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.medium,
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.medium,
  },
};

// ============================================================================
// SCALE VARIANTS
// ============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.gentleSpring,
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...transitions.spring,
      delay: 0.1,
    },
  },
};

// ============================================================================
// STAGGER VARIANTS (voor lists)
// ============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.medium,
  },
};

export const staggerItemFast: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.fast,
  },
};

// ============================================================================
// SLIDE VARIANTS (voor modals, drawers)
// ============================================================================

export const slideInFromBottom: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.medium,
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: transitions.fast,
  },
};

export const slideInFromRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.medium,
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: transitions.fast,
  },
};

export const slideInFromLeft: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.medium,
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: transitions.fast,
  },
};

// ============================================================================
// ROTATE & FLIP VARIANTS
// ============================================================================

export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -180, scale: 0.5 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: easings.smooth,
    },
  },
};

export const flipIn: Variants = {
  hidden: { opacity: 0, rotateX: -90 },
  visible: {
    opacity: 1,
    rotateX: 0,
    transition: {
      duration: 0.5,
      ease: easings.anticipate,
    },
  },
};

// ============================================================================
// HOVER INTERACTIONS
// ============================================================================

export const hoverScale = {
  scale: 1.05,
  transition: transitions.fast,
};

export const hoverScaleSmall = {
  scale: 1.02,
  transition: transitions.fast,
};

export const hoverLift = {
  y: -4,
  transition: transitions.fast,
};

export const hoverGlow = {
  boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)',
  transition: transitions.fast,
};

// ============================================================================
// TAP INTERACTIONS
// ============================================================================

export const tapScale = {
  scale: 0.95,
};

export const tapScaleSmall = {
  scale: 0.98,
};

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

export const pulse: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spin: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const shimmer: Variants = {
  shimmer: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================================================
// TEXT ANIMATIONS
// ============================================================================

export const textReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: easings.easeOut,
    },
  }),
};

export const letterReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.4,
      ease: easings.anticipate,
    },
  }),
};

// ============================================================================
// SCROLL-TRIGGERED VARIANTS
// ============================================================================

export const scrollFadeIn: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easings.easeOut,
    },
  },
};

export const scrollSlideIn: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: easings.smooth,
    },
  },
};

// ============================================================================
// BACKGROUND ANIMATIONS
// ============================================================================

export const gradientShift: Variants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================================================
// COMPLEX SEQUENCES
// ============================================================================

export const heroSequence: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

export const heroTitle: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: easings.anticipate,
    },
  },
};

export const heroSubtitle: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easings.smooth,
    },
  },
};

export const heroCTA: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: easings.bounce,
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a stagger delay for array items
 */
export const staggerDelay = (index: number, baseDelay = 0.1) => ({
  delay: index * baseDelay,
});

/**
 * Create a random delay for scattered items
 */
export const randomDelay = (min = 0, max = 0.5) => ({
  delay: Math.random() * (max - min) + min,
});

/**
 * Viewport detection for scroll animations
 */
export const viewportConfig = {
  once: true,
  amount: 0.3,
  margin: '0px 0px -100px 0px',
};

export const viewportConfigPartial = {
  once: true,
  amount: 0.1,
  margin: '0px 0px -50px 0px',
};
