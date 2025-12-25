import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// ============================================================================
// A/B TESTING FRAMEWORK
// Lightweight client-side A/B testing with analytics integration
// No external dependencies required - works with GA4 & Clarity
// ============================================================================

// Types
interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights?: number[]; // Optional weights for traffic distribution
  isActive: boolean;
}

interface ExperimentAssignment {
  experimentId: string;
  variant: string;
  assignedAt: number;
}

interface ABTestingContextType {
  getVariant: (experimentId: string) => string | null;
  trackConversion: (experimentId: string, conversionType?: string) => void;
  isLoading: boolean;
  experiments: Record<string, ExperimentAssignment>;
}

// Default experiments configuration
const DEFAULT_EXPERIMENTS: Experiment[] = [
  {
    id: 'cta_text',
    name: 'CTA Button Text',
    variants: ['control', 'variant_a', 'variant_b'],
    weights: [34, 33, 33],
    isActive: true,
  },
  {
    id: 'hero_headline',
    name: 'Hero Headline',
    variants: ['control', 'variant_a'],
    weights: [50, 50],
    isActive: true,
  },
  {
    id: 'social_proof_position',
    name: 'Social Proof Position',
    variants: ['above_cta', 'below_cta'],
    weights: [50, 50],
    isActive: true,
  },
  {
    id: 'urgency_banner',
    name: 'Urgency Banner',
    variants: ['show', 'hide'],
    weights: [50, 50],
    isActive: true,
  },
  {
    id: 'testimonials_style',
    name: 'Testimonials Style',
    variants: ['carousel', 'grid', 'single'],
    weights: [34, 33, 33],
    isActive: false, // Disabled by default
  },
];

// Storage key
const STORAGE_KEY = 'ab_experiments';

// Context
const ABTestingContext = createContext<ABTestingContextType | null>(null);

// Helper: Generate consistent hash for user
function generateUserId(): string {
  let userId = localStorage.getItem('ab_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('ab_user_id', userId);
  }
  return userId;
}

// Helper: Simple hash function for deterministic assignment
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Helper: Assign variant based on weights
function assignVariant(experiment: Experiment, userId: string): string {
  const hash = hashString(userId + experiment.id);
  const weights = experiment.weights || experiment.variants.map(() => 100 / experiment.variants.length);

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const normalizedHash = (hash % 100) + 1;

  let cumulativeWeight = 0;
  for (let i = 0; i < experiment.variants.length; i++) {
    cumulativeWeight += (weights[i] / totalWeight) * 100;
    if (normalizedHash <= cumulativeWeight) {
      return experiment.variants[i];
    }
  }

  return experiment.variants[0];
}

// Helper: Track to GA4
function trackToGA4(experimentId: string, variant: string, eventName: string, data?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      experiment_id: experimentId,
      variant: variant,
      ...data,
    });
  }
}

// Helper: Track to Clarity
function trackToClarity(experimentId: string, variant: string) {
  if (typeof window !== 'undefined' && (window as any).clarity) {
    (window as any).clarity('set', `exp_${experimentId}`, variant);
  }
}

// Provider Component
interface ABTestingProviderProps {
  children: ReactNode;
  experiments?: Experiment[];
}

export function ABTestingProvider({
  children,
  experiments = DEFAULT_EXPERIMENTS
}: ABTestingProviderProps) {
  const [assignments, setAssignments] = useState<Record<string, ExperimentAssignment>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize experiments on mount
  useEffect(() => {
    const userId = generateUserId();

    // Load existing assignments from storage
    let storedAssignments: Record<string, ExperimentAssignment> = {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        storedAssignments = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading AB test assignments:', e);
    }

    // Assign variants for active experiments
    const newAssignments: Record<string, ExperimentAssignment> = {};

    experiments.forEach((experiment) => {
      if (!experiment.isActive) return;

      // Check if already assigned
      if (storedAssignments[experiment.id]) {
        newAssignments[experiment.id] = storedAssignments[experiment.id];
      } else {
        // Assign new variant
        const variant = assignVariant(experiment, userId);
        newAssignments[experiment.id] = {
          experimentId: experiment.id,
          variant,
          assignedAt: Date.now(),
        };

        // Track assignment
        trackToGA4(experiment.id, variant, 'experiment_impression');
        trackToClarity(experiment.id, variant);
      }
    });

    // Save to storage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssignments));
    } catch (e) {
      console.error('Error saving AB test assignments:', e);
    }

    setAssignments(newAssignments);
    setIsLoading(false);
  }, [experiments]);

  // Get variant for an experiment
  const getVariant = useCallback((experimentId: string): string | null => {
    return assignments[experimentId]?.variant || null;
  }, [assignments]);

  // Track conversion
  const trackConversion = useCallback((experimentId: string, conversionType = 'conversion') => {
    const assignment = assignments[experimentId];
    if (assignment) {
      trackToGA4(experimentId, assignment.variant, 'experiment_conversion', {
        conversion_type: conversionType,
      });
    }
  }, [assignments]);

  return (
    <ABTestingContext.Provider value={{ getVariant, trackConversion, isLoading, experiments: assignments }}>
      {children}
    </ABTestingContext.Provider>
  );
}

// Hook to use A/B testing
export function useABTest(experimentId: string): {
  variant: string | null;
  isLoading: boolean;
  trackConversion: (conversionType?: string) => void;
} {
  const context = useContext(ABTestingContext);

  if (!context) {
    // Return fallback if not wrapped in provider
    return {
      variant: 'control',
      isLoading: false,
      trackConversion: () => {},
    };
  }

  return {
    variant: context.getVariant(experimentId),
    isLoading: context.isLoading,
    trackConversion: (conversionType?: string) => context.trackConversion(experimentId, conversionType),
  };
}

// Hook to get all experiment data
export function useABTestingContext() {
  const context = useContext(ABTestingContext);
  if (!context) {
    throw new Error('useABTestingContext must be used within ABTestingProvider');
  }
  return context;
}

// ============================================================================
// A/B TEST VARIANT COMPONENTS
// Pre-built components for common test scenarios
// ============================================================================

// CTA Text Variants
interface CTAVariantProps {
  onSelect?: (variant: string) => void;
}

export function useCTAVariant(): { text: string; variant: string } {
  const { variant } = useABTest('cta_text');

  const variants: Record<string, string> = {
    control: 'Start de Audit',
    variant_a: 'Ontdek Jouw Score',
    variant_b: 'Krijg Direct Inzicht',
  };

  return {
    text: variants[variant || 'control'],
    variant: variant || 'control',
  };
}

// Hero Headline Variants
export function useHeroHeadlineVariant(): { headline: string; subheadline: string; variant: string } {
  const { variant } = useABTest('hero_headline');

  const variants: Record<string, { headline: string; subheadline: string }> = {
    control: {
      headline: 'Recruitment APK',
      subheadline: 'Ontdek binnen 5 minuten waar jouw wervingsproces hapert',
    },
    variant_a: {
      headline: 'Gratis Recruitment Scan',
      subheadline: 'Ontdek in 5 minuten hoe jij scoort t.o.v. de markt',
    },
  };

  const selected = variants[variant || 'control'];
  return {
    ...selected,
    variant: variant || 'control',
  };
}

// Urgency Banner Variant
export function useUrgencyBannerVariant(): { show: boolean; variant: string } {
  const { variant } = useABTest('urgency_banner');

  return {
    show: variant !== 'hide',
    variant: variant || 'show',
  };
}

// ============================================================================
// DEBUG COMPONENT
// Shows current experiment assignments (only in development)
// ============================================================================

export function ABTestDebugPanel() {
  const context = useContext(ABTestingContext);
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!context) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 text-white px-3 py-2 rounded-lg text-xs font-mono shadow-lg hover:bg-purple-700"
      >
        🧪 A/B Tests
      </button>

      {isOpen && (
        <div className="absolute bottom-12 left-0 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-4 min-w-[300px]">
          <h3 className="text-white font-bold mb-3">Active Experiments</h3>

          {Object.entries(context.experiments).map(([id, assignment]) => (
            <div key={id} className="mb-2 p-2 bg-slate-800 rounded text-xs">
              <div className="text-slate-400">{id}</div>
              <div className="text-green-400 font-mono">{assignment.variant}</div>
            </div>
          ))}

          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem('ab_user_id');
              window.location.reload();
            }}
            className="mt-3 text-red-400 text-xs hover:text-red-300"
          >
            Reset All Experiments
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXPERIMENT CONFIGURATION
// Export default experiments for customization
// ============================================================================

export { DEFAULT_EXPERIMENTS };
export type { Experiment, ExperimentAssignment };
