import { useEffect } from 'react';

// ============================================================================
// GOOGLE ADS REMARKETING PIXEL
// Track conversions and build remarketing audiences
// Get your Conversion ID at: https://ads.google.com
// ============================================================================

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

interface GoogleAdsConfig {
  conversionId: string; // Format: AW-XXXXXXXXX
  conversionLabel?: string; // For specific conversion tracking
  enabled?: boolean;
}

// Default config - replace with your actual Google Ads Conversion ID
const DEFAULT_CONVERSION_ID = 'AW-XXXXXXXXX';

/**
 * Initialize Google Ads remarketing pixel
 */
export function useGoogleAdsRemarketing(config?: Partial<GoogleAdsConfig>) {
  const conversionId = config?.conversionId || import.meta.env.VITE_GOOGLE_ADS_ID || DEFAULT_CONVERSION_ID;
  const enabled = config?.enabled ?? conversionId !== DEFAULT_CONVERSION_ID;

  useEffect(() => {
    if (!enabled || conversionId === 'AW-XXXXXXXXX') {
      if (conversionId === 'AW-XXXXXXXXX') {
        console.info('[Google Ads] Skipped: No conversion ID configured');
      }
      return;
    }

    // Check if gtag is already loaded (by GA4)
    if (!window.gtag) {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer!.push(args);
      };
      window.gtag('js', new Date());
    }

    // Configure Google Ads
    window.gtag('config', conversionId, {
      'allow_enhanced_conversions': true,
    });

    // Send remarketing event
    window.gtag('event', 'page_view', {
      'send_to': conversionId,
    });

  }, [conversionId, enabled]);
}

/**
 * Component wrapper for Google Ads remarketing
 */
export function GoogleAdsRemarketing({ conversionId }: { conversionId?: string }) {
  useGoogleAdsRemarketing({ conversionId });
  return null;
}

// ============================================================================
// CONVERSION TRACKING FUNCTIONS
// ============================================================================

/**
 * Track a conversion event in Google Ads
 * @param conversionLabel - The specific conversion label (e.g., 'AbC123')
 * @param value - Optional conversion value in EUR
 * @param transactionId - Optional unique transaction ID
 */
export function trackGoogleAdsConversion(
  conversionLabel: string,
  value?: number,
  transactionId?: string
): void {
  const conversionId = import.meta.env.VITE_GOOGLE_ADS_ID || DEFAULT_CONVERSION_ID;

  if (typeof window !== 'undefined' && window.gtag && conversionId !== 'AW-XXXXXXXXX') {
    window.gtag('event', 'conversion', {
      'send_to': `${conversionId}/${conversionLabel}`,
      'value': value,
      'currency': 'EUR',
      'transaction_id': transactionId,
    });
  }
}

/**
 * Track form submission conversion
 */
export function trackFormSubmission(value?: number): void {
  const label = import.meta.env.VITE_GOOGLE_ADS_FORM_LABEL || '';
  if (label) {
    trackGoogleAdsConversion(label, value);
  }
}

/**
 * Track assessment start (micro-conversion)
 */
export function trackAssessmentStartConversion(): void {
  const label = import.meta.env.VITE_GOOGLE_ADS_START_LABEL || '';
  if (label) {
    trackGoogleAdsConversion(label);
  }
}

/**
 * Track assessment completion (main conversion)
 */
export function trackAssessmentCompleteConversion(value?: number): void {
  const label = import.meta.env.VITE_GOOGLE_ADS_COMPLETE_LABEL || '';
  if (label) {
    trackGoogleAdsConversion(label, value);
  }
}

/**
 * Track lead magnet download
 */
export function trackLeadMagnetDownload(magnetName: string): void {
  const conversionId = import.meta.env.VITE_GOOGLE_ADS_ID || DEFAULT_CONVERSION_ID;

  if (typeof window !== 'undefined' && window.gtag && conversionId !== 'AW-XXXXXXXXX') {
    window.gtag('event', 'generate_lead', {
      'send_to': conversionId,
      'event_category': 'lead_magnet',
      'event_label': magnetName,
    });
  }
}

// ============================================================================
// REMARKETING AUDIENCE FUNCTIONS
// ============================================================================

/**
 * Add user to specific remarketing audience
 */
export function addToRemarketingAudience(audienceName: string, data?: Record<string, unknown>): void {
  const conversionId = import.meta.env.VITE_GOOGLE_ADS_ID || DEFAULT_CONVERSION_ID;

  if (typeof window !== 'undefined' && window.gtag && conversionId !== 'AW-XXXXXXXXX') {
    window.gtag('event', audienceName, {
      'send_to': conversionId,
      ...data,
    });
  }
}

// Pre-built remarketing events
export const remarketing = {
  /**
   * User viewed assessment page
   */
  viewedAssessment: () => {
    addToRemarketingAudience('view_assessment_page');
  },

  /**
   * User started but didn't complete assessment
   */
  abandonedAssessment: () => {
    addToRemarketingAudience('abandoned_assessment');
  },

  /**
   * User completed assessment
   */
  completedAssessment: (score?: number) => {
    addToRemarketingAudience('completed_assessment', { score });
  },

  /**
   * User downloaded lead magnet
   */
  downloadedLeadMagnet: (magnetName: string) => {
    addToRemarketingAudience('downloaded_lead_magnet', { magnet_name: magnetName });
  },

  /**
   * User clicked WhatsApp
   */
  clickedWhatsApp: () => {
    addToRemarketingAudience('clicked_whatsapp');
  },

  /**
   * High-intent visitor (spent >60 seconds on page)
   */
  highIntent: () => {
    addToRemarketingAudience('high_intent_visitor');
  },

  /**
   * User from specific industry
   */
  setIndustry: (industry: string) => {
    addToRemarketingAudience('industry_segment', { industry });
  },
};

// ============================================================================
// ENHANCED CONVERSIONS (for better attribution)
// ============================================================================

/**
 * Set user data for enhanced conversions
 * Call this when user provides contact info
 */
export function setEnhancedConversionData(userData: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_data', {
      'email': userData.email,
      'phone_number': userData.phone,
      'address': {
        'first_name': userData.firstName,
        'last_name': userData.lastName,
      },
    });
  }
}
