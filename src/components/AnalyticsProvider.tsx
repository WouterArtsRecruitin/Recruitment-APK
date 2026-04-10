import React, { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

/**
 * Analytics Provider Component
 * Wraps your app with Vercel Analytics and Speed Insights
 */

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!gaId || gaId === 'G-XXXXXXXXXX') return;

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
