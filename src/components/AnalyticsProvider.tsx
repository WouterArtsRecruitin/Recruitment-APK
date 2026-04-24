import React, { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

/**
 * Analytics Provider Component
 * Wraps your app with Vercel Analytics and Speed Insights.
 * GA4 is gated behind Cookiebot STATISTICS consent.
 */

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

// Consent helper — reads Cookiebot statistics consent
const hasStatisticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).Cookiebot?.consent?.statistics);
};

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!gaId || gaId === 'G-XXXXXXXXXX') return;

    let loaded = false;

    const loadGA = () => {
      if (loaded) return;
      if (!hasStatisticsConsent()) return;
      loaded = true;

      const gaScript = document.createElement('script');
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      gaScript.async = true;
      document.head.appendChild(gaScript);

      gaScript.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer?.push(args);
        }
        // @ts-ignore
        window.gtag = gtag;
        // @ts-ignore
        gtag('js', new Date());
        // @ts-ignore
        gtag('config', gaId, {
          page_path: window.location.pathname,
          cookie_flags: 'SameSite=None;Secure',
        });
      };
    };

    // Try immediately (Cookiebot may already be ready + consent given)
    loadGA();

    // Listen for Cookiebot consent event
    const handler = () => loadGA();
    window.addEventListener('CookiebotOnConsentReady', handler);
    window.addEventListener('CookiebotOnAccept', handler);
    return () => {
      window.removeEventListener('CookiebotOnConsentReady', handler);
      window.removeEventListener('CookiebotOnAccept', handler);
    };
  }, []);

  return (
    <>
      {children}
      {/* Vercel Analytics - Only in production */}
      <Analytics />
      {/* Vercel Speed Insights - Only in production */}
      <SpeedInsights />
    </>
  );
}
