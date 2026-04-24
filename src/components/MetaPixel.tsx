import { useEffect } from 'react';

// Meta Pixel ID - Replace with your actual Pixel ID from Facebook Business Manager
export const FB_PIXEL_ID = "238226887541404";

// Consent helper — reads Cookiebot marketing consent
const hasMarketingConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).Cookiebot?.consent?.marketing);
};

// Track page views (gated on marketing consent)
export const pageview = () => {
  if (typeof window === 'undefined') return;
  if (!hasMarketingConsent()) {
    console.debug('[MetaPixel] pageview skipped — no marketing consent');
    return;
  }
  if ((window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

// Track custom events (gated on marketing consent)
export const event = (name: string, options = {}) => {
  if (typeof window === 'undefined') return;
  if (!hasMarketingConsent()) {
    console.debug(`[MetaPixel] event '${name}' skipped — no marketing consent`);
    return;
  }
  if ((window as any).fbq) {
    (window as any).fbq('track', name, options);
  }
};

// Alias for external callers expecting a `track(name, params)` signature
export const track = event;

export function MetaPixel() {
  useEffect(() => {
    let loaded = false;

    const loadPixel = () => {
      if (loaded) return;
      if (!hasMarketingConsent()) return;
      loaded = true;

      // Meta Pixel Base Code
      // @ts-ignore
      !function(f,b,e,v,n,t,s)
      // @ts-ignore
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      // @ts-ignore
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      // @ts-ignore
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      // @ts-ignore
      n.queue=[];t=b.createElement(e);t.async=!0;
      // @ts-ignore
      t.src=v;s=b.getElementsByTagName(e)[0];
      // @ts-ignore
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');

      // Initialize Meta Pixel
      // @ts-ignore
      if (window.fbq) {
        // @ts-ignore
        window.fbq('init', FB_PIXEL_ID);
        // @ts-ignore
        window.fbq('track', 'PageView');
      }
    };

    // Try immediately (Cookiebot may already be ready + consent given)
    loadPixel();

    // Listen for Cookiebot consent event
    const handler = () => loadPixel();
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
        src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
