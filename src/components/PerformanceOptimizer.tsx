import { useEffect } from 'react';
import { trackWebVitals } from '../lib/analytics';

/**
 * Performance Optimizer Component
 * Handles Core Web Vitals tracking and optimization
 */

// ============================================================================
// WEB VITALS TRACKING
// ============================================================================

export function PerformanceOptimizer() {
  useEffect(() => {
    // Track Web Vitals when they're available
    if ('web-vital' in window || typeof window !== 'undefined') {
      // Dynamic import to reduce initial bundle
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
        onCLS(trackWebVitals);
        onFID(trackWebVitals);
        onFCP(trackWebVitals);
        onLCP(trackWebVitals);
        onTTFB(trackWebVitals);
        onINP(trackWebVitals);
      });
    }
  }, []);

  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload Typeform embed script
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = '//embed.typeform.com/next/embed.js';
      document.head.appendChild(link);
    };

    // Run after initial render
    if (document.readyState === 'complete') {
      preloadCriticalResources();
    } else {
      window.addEventListener('load', preloadCriticalResources);
      return () => window.removeEventListener('load', preloadCriticalResources);
    }
  }, []);

  return null; // This component doesn't render anything
}

// ============================================================================
// LAZY IMAGE COMPONENT (voor performance)
// ============================================================================

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export function LazyImage({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e2e8f0" width="400" height="300"/%3E%3C/svg%3E',
  ...props
}: LazyImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      {...props}
      // Fallback placeholder while loading
      onError={(e) => {
        e.currentTarget.src = placeholder;
      }}
    />
  );
}

// ============================================================================
// CRITICAL CSS INLINER (voor above-the-fold content)
// ============================================================================

export function CriticalCSS() {
  return (
    <style>{`
      /* Critical CSS - Above the fold only */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #0f172a;
        color: #ffffff;
        min-height: 100vh;
      }

      /* Loading state */
      #root:empty::before {
        content: "";
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 50px;
        height: 50px;
        border: 3px solid rgba(249, 115, 22, 0.2);
        border-top-color: #f97316;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }

      /* Prevent layout shift */
      .hero-container {
        min-height: 100vh;
        contain: layout style paint;
      }
    `}</style>
  );
}

// ============================================================================
// RESOURCE HINTS COMPONENT
// ============================================================================

export function ResourceHints() {
  return (
    <>
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//embed.typeform.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//connect.facebook.net" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />

      {/* Preconnect for critical third-parties */}
      <link rel="preconnect" href="https://embed.typeform.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Prefetch for likely next navigation */}
      <link rel="prefetch" href="/thank-you.html" />
      <link rel="prefetch" href="//embed.typeform.com/next/embed.js" />
    </>
  );
}

// ============================================================================
// PERFORMANCE MONITORING HOOK
// ============================================================================

export function usePerformanceMonitor() {
  useEffect(() => {
    // Monitor long tasks (> 50ms)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Log long tasks for debugging
            if (entry.duration > 50) {
              console.warn('[Performance] Long task detected:', {
                duration: entry.duration,
                name: entry.name,
                startTime: entry.startTime,
              });

              // Track in analytics
              if (entry.duration > 100) {
                // Only track very long tasks
                trackWebVitals({
                  name: 'long-task',
                  value: entry.duration,
                  id: `long-task-${Date.now()}`,
                });
              }
            }
          }
        });

        observer.observe({ entryTypes: ['longtask', 'measure'] });

        return () => observer.disconnect();
      } catch (e) {
        // Silently fail if not supported
        console.debug('PerformanceObserver not fully supported');
      }
    }
  }, []);
}

// ============================================================================
// IMAGE OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(baseUrl: string, sizes: number[]): string {
  return sizes.map((size) => `${baseUrl}?w=${size} ${size}w`).join(', ');
}

/**
 * Calculate optimal image sizes based on viewport
 */
export function getOptimalImageSize(): string {
  if (typeof window === 'undefined') return '100vw';

  const width = window.innerWidth;

  if (width < 640) return '100vw'; // Mobile
  if (width < 1024) return '50vw'; // Tablet
  return '33vw'; // Desktop
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export { PerformanceOptimizer as default };
