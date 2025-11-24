/**
 * Analytics & Tracking Utilities
 * Supports: Google Analytics 4, Facebook Pixel, Vercel Analytics
 */

// ============================================================================
// TYPES
// ============================================================================

interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

interface FBEvent {
  eventName: string;
  parameters?: Record<string, any>;
}

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    fbq?: (
      command: 'track' | 'trackCustom' | 'init',
      eventName: string,
      parameters?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const ANALYTICS_CONFIG = {
  ga: {
    measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
    enabled: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  },
  fb: {
    pixelId: import.meta.env.VITE_FB_PIXEL_ID || '',
    enabled: import.meta.env.VITE_ENABLE_FB_PIXEL !== 'false',
  },
  vercel: {
    enabled: true, // Always enabled in Vercel
  },
  debug: import.meta.env.DEV,
} as const;

// ============================================================================
// GOOGLE ANALYTICS 4
// ============================================================================

/**
 * Track a page view in Google Analytics
 */
export const trackPageView = (url: string) => {
  if (!ANALYTICS_CONFIG.ga.enabled) return;

  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', ANALYTICS_CONFIG.ga.measurementId, {
      page_path: url,
    });

    if (ANALYTICS_CONFIG.debug) {
      console.log('[GA4] Page view:', url);
    }
  }
};

/**
 * Track a custom event in Google Analytics
 */
export const trackEvent = ({ action, category, label, value }: GAEvent) => {
  if (!ANALYTICS_CONFIG.ga.enabled) return;

  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });

    if (ANALYTICS_CONFIG.debug) {
      console.log('[GA4] Event:', { action, category, label, value });
    }
  }
};

// ============================================================================
// FACEBOOK PIXEL
// ============================================================================

/**
 * Track a Facebook Pixel event
 */
export const trackFBEvent = ({ eventName, parameters }: FBEvent) => {
  if (!ANALYTICS_CONFIG.fb.enabled || !ANALYTICS_CONFIG.fb.pixelId) return;

  if (typeof window.fbq !== 'undefined') {
    window.fbq('track', eventName, parameters);

    if (ANALYTICS_CONFIG.debug) {
      console.log('[FB Pixel] Event:', eventName, parameters);
    }
  }
};

/**
 * Track a custom Facebook Pixel event
 */
export const trackFBCustomEvent = ({ eventName, parameters }: FBEvent) => {
  if (!ANALYTICS_CONFIG.fb.enabled || !ANALYTICS_CONFIG.fb.pixelId) return;

  if (typeof window.fbq !== 'undefined') {
    window.fbq('trackCustom', eventName, parameters);

    if (ANALYTICS_CONFIG.debug) {
      console.log('[FB Pixel] Custom event:', eventName, parameters);
    }
  }
};

// ============================================================================
// PREDEFINED EVENTS - RECRUITMENT APK
// ============================================================================

/**
 * Track when user starts the assessment
 */
export const trackAssessmentStarted = () => {
  trackEvent({
    action: 'assessment_started',
    category: 'engagement',
    label: 'recruitment_apk',
    value: 1,
  });

  trackFBEvent({
    eventName: 'InitiateCheckout', // FB standard event
    parameters: {
      content_name: 'Recruitment APK Assessment',
      content_category: 'assessment',
    },
  });

  trackFBCustomEvent({
    eventName: 'AssessmentStarted',
    parameters: {
      source: 'recruitment_apk',
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track when user completes the assessment
 */
export const trackAssessmentCompleted = (duration?: number) => {
  trackEvent({
    action: 'assessment_completed',
    category: 'conversion',
    label: 'recruitment_apk',
    value: duration,
  });

  trackFBEvent({
    eventName: 'CompleteRegistration', // FB standard event
    parameters: {
      content_name: 'Recruitment APK Assessment',
      status: 'completed',
    },
  });

  trackFBCustomEvent({
    eventName: 'AssessmentCompleted',
    parameters: {
      source: 'recruitment_apk',
      duration_seconds: duration,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track when user clicks CTA button
 */
export const trackCTAClick = (buttonText: string) => {
  trackEvent({
    action: 'cta_click',
    category: 'engagement',
    label: buttonText,
  });

  trackFBCustomEvent({
    eventName: 'CTAClicked',
    parameters: {
      button_text: buttonText,
      page: 'landing',
    },
  });
};

/**
 * Track when user closes/abandons assessment
 */
export const trackAssessmentAbandoned = () => {
  trackEvent({
    action: 'assessment_abandoned',
    category: 'engagement',
    label: 'recruitment_apk',
  });

  trackFBCustomEvent({
    eventName: 'AssessmentAbandoned',
    parameters: {
      source: 'recruitment_apk',
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track Typeform specific events
 */
export const trackTypeformEvent = (
  eventType: 'loaded' | 'submitted' | 'screen_changed',
  data?: any
) => {
  trackEvent({
    action: `typeform_${eventType}`,
    category: 'typeform',
    label: 'recruitment_apk',
  });

  if (ANALYTICS_CONFIG.debug) {
    console.log('[Typeform Event]', eventType, data);
  }
};

/**
 * Track social proof engagement
 */
export const trackSocialProofView = (message: string) => {
  trackEvent({
    action: 'social_proof_view',
    category: 'engagement',
    label: message,
  });
};

/**
 * Track contact link clicks
 */
export const trackContactClick = (type: 'email' | 'phone' | 'website') => {
  trackEvent({
    action: 'contact_click',
    category: 'engagement',
    label: type,
  });

  trackFBEvent({
    eventName: 'Contact',
    parameters: {
      contact_type: type,
    },
  });
};

/**
 * Track errors
 */
export const trackError = (error: string, fatal: boolean = false) => {
  trackEvent({
    action: 'error',
    category: 'technical',
    label: error,
    value: fatal ? 1 : 0,
  });

  if (ANALYTICS_CONFIG.debug) {
    console.error('[Analytics Error]', error, { fatal });
  }
};

// ============================================================================
// VERCEL ANALYTICS
// ============================================================================

/**
 * Track Web Vitals for Vercel Analytics
 * This is automatically handled by @vercel/analytics
 */
export const trackWebVitals = (metric: any) => {
  if (ANALYTICS_CONFIG.debug) {
    console.log('[Web Vitals]', metric);
  }

  // Send to GA4 as well
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all analytics on page load
 */
export const initializeAnalytics = () => {
  if (ANALYTICS_CONFIG.debug) {
    console.log('[Analytics] Initializing...', {
      ga: ANALYTICS_CONFIG.ga.enabled,
      fb: ANALYTICS_CONFIG.fb.enabled && !!ANALYTICS_CONFIG.fb.pixelId,
      vercel: ANALYTICS_CONFIG.vercel.enabled,
    });
  }

  // Track initial page view
  if (typeof window !== 'undefined') {
    trackPageView(window.location.pathname);
  }
};
