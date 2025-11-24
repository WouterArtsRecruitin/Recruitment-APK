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
    // Initialize Google Analytics
    const gaScript = document.createElement('script');
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`;
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
      gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
        cookie_flags: 'SameSite=None;Secure',
      });
    };

    // Initialize Facebook Pixel (if configured)
    const fbPixelId = import.meta.env.VITE_FB_PIXEL_ID;
    if (fbPixelId) {
      !(function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod
            ? n.callMethod.apply(n, arguments)
            : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        'script',
        'https://connect.facebook.net/en_US/fbevents.js'
      );

      window.fbq?.('init', fbPixelId);
      window.fbq?.('track', 'PageView');
    }

    return () => {
      // Cleanup if needed
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
