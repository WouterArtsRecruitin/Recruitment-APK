import { useEffect } from 'react';

// ============================================================================
// MICROSOFT CLARITY INTEGRATION
// Free heatmaps, session recordings, and user behavior analytics
// Get your project ID at: https://clarity.microsoft.com
// ============================================================================

interface ClarityConfig {
  projectId: string;
  enabled?: boolean;
}

// Default project ID - replace with your actual Clarity project ID
const DEFAULT_PROJECT_ID = 'YOUR_CLARITY_PROJECT_ID';

declare global {
  interface Window {
    clarity?: (action: string, ...args: unknown[]) => void;
  }
}

export function useMicrosoftClarity(config?: Partial<ClarityConfig>) {
  const projectId = config?.projectId || DEFAULT_PROJECT_ID;
  const enabled = config?.enabled ?? true;

  useEffect(() => {
    // Don't initialize in development or if disabled
    if (!enabled || projectId === 'YOUR_CLARITY_PROJECT_ID') {
      if (projectId === 'YOUR_CLARITY_PROJECT_ID') {
        console.info('[Clarity] Skipped: No project ID configured. Get one at https://clarity.microsoft.com');
      }
      return;
    }

    // Don't double-initialize
    if (window.clarity) return;

    // Clarity initialization script
    (function(c: Window, l: Document, a: string, r: string, i: string) {
      (c as any)[a] = (c as any)[a] || function(...args: unknown[]) {
        ((c as any)[a].q = (c as any)[a].q || []).push(args);
      };
      const t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = 'https://www.clarity.ms/tag/' + i;
      const y = l.getElementsByTagName(r)[0];
      y.parentNode?.insertBefore(t, y);
    })(window, document, 'clarity', 'script', projectId);

  }, [projectId, enabled]);
}

// Component wrapper for use in App.tsx
export function MicrosoftClarity({ projectId }: { projectId?: string }) {
  useMicrosoftClarity({ projectId });
  return null;
}

// Utility functions for custom tracking

/**
 * Set a custom tag in Clarity for filtering sessions
 * @param key - Tag name
 * @param value - Tag value
 */
export function setClarityTag(key: string, value: string | number | boolean): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('set', key, String(value));
  }
}

/**
 * Identify a user in Clarity
 * @param userId - Unique user identifier
 * @param sessionId - Optional session ID
 * @param pageId - Optional page ID
 */
export function identifyClarityUser(
  userId: string,
  sessionId?: string,
  pageId?: string
): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('identify', userId, sessionId, pageId);
  }
}

/**
 * Track a custom event in Clarity
 * @param eventName - Name of the event
 */
export function trackClarityEvent(eventName: string): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName);
  }
}

/**
 * Upgrade the session priority for more detailed recording
 * Use this for important user actions like form submissions
 * @param reason - Reason for upgrading
 */
export function upgradeClaritySession(reason: string): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('upgrade', reason);
  }
}

// Pre-built tracking functions for recruitment funnel

export const clarityTrack = {
  /**
   * Track when user starts the assessment
   */
  assessmentStarted: () => {
    setClarityTag('funnel_stage', 'started');
    trackClarityEvent('assessment_started');
    upgradeClaritySession('assessment_started');
  },

  /**
   * Track when user completes the assessment
   */
  assessmentCompleted: () => {
    setClarityTag('funnel_stage', 'completed');
    trackClarityEvent('assessment_completed');
    upgradeClaritySession('assessment_completed');
  },

  /**
   * Track when user abandons the assessment
   */
  assessmentAbandoned: () => {
    setClarityTag('funnel_stage', 'abandoned');
    trackClarityEvent('assessment_abandoned');
  },

  /**
   * Track exit intent popup shown
   */
  exitIntentShown: () => {
    trackClarityEvent('exit_intent_shown');
  },

  /**
   * Track exit intent conversion
   */
  exitIntentConverted: () => {
    setClarityTag('exit_intent', 'converted');
    trackClarityEvent('exit_intent_converted');
    upgradeClaritySession('exit_intent_converted');
  },

  /**
   * Track WhatsApp button click
   */
  whatsappClicked: () => {
    trackClarityEvent('whatsapp_clicked');
    upgradeClaritySession('whatsapp_contact');
  },

  /**
   * Track lead score for segmentation
   */
  setLeadScore: (score: number) => {
    setClarityTag('lead_score', score);
    if (score >= 80) {
      setClarityTag('lead_quality', 'hot');
    } else if (score >= 60) {
      setClarityTag('lead_quality', 'warm');
    } else {
      setClarityTag('lead_quality', 'cold');
    }
  },

  /**
   * Track industry for segmentation
   */
  setIndustry: (industry: string) => {
    setClarityTag('industry', industry);
  },

  /**
   * Track company size for segmentation
   */
  setCompanySize: (size: string) => {
    setClarityTag('company_size', size);
  },
};
