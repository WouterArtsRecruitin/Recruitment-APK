import { useEffect } from 'react';

// LinkedIn Campaign Manager Account ID
const LINKEDIN_PARTNER_ID = '508490978';

// Consent helper — reads Cookiebot marketing consent
const hasMarketingConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).Cookiebot?.consent?.marketing);
};

export function LinkedInInsightTag() {
  useEffect(() => {
    let loaded = false;

    const loadInsight = () => {
      if (loaded) return;
      if (!hasMarketingConsent()) return;

      const w = window as any;
      if (w._linkedin_data_partner_ids) return; // Already loaded
      loaded = true;

      w._linkedin_data_partner_ids = w._linkedin_data_partner_ids || [];
      w._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);

      // Load LinkedIn script
      (function (l: any) {
        if (!l) {
          w.lintrk = function (a: any, b: any) {
            w.lintrk.q.push([a, b]);
          };
          w.lintrk.q = [];
        }
        const s = document.getElementsByTagName('script')[0];
        const b = document.createElement('script');
        b.type = 'text/javascript';
        b.async = true;
        b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
        s.parentNode!.insertBefore(b, s);
      })(w.lintrk);
    };

    // Try immediately (Cookiebot may already be ready)
    loadInsight();

    // Listen for Cookiebot consent event
    const handler = () => loadInsight();
    window.addEventListener('CookiebotOnConsentReady', handler);
    window.addEventListener('CookiebotOnAccept', handler);
    return () => {
      window.removeEventListener('CookiebotOnConsentReady', handler);
      window.removeEventListener('CookiebotOnAccept', handler);
    };
  }, []);

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        alt=""
        src={`https://px.ads.linkedin.com/collect/?pid=${LINKEDIN_PARTNER_ID}&fmt=gif`}
      />
    </noscript>
  );
}

// Track LinkedIn conversion event (bijv. bij form submit) — gated on marketing consent
export function trackLinkedInConversion(conversionId?: string) {
  const w = window as any;
  if (!hasMarketingConsent()) {
    console.debug('[LinkedInInsightTag] conversion skipped — no marketing consent');
    return;
  }
  if (typeof w.lintrk !== 'function') return;
  if (conversionId) {
    w.lintrk('track', { conversion_id: conversionId });
  }
}
