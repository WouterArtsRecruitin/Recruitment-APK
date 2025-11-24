import { useEffect } from 'react';
import { initializeAnalytics, trackPageView } from '../lib/analytics';

/**
 * React hook for analytics initialization
 * Use this in your root App component
 */
export function useAnalytics() {
  useEffect(() => {
    initializeAnalytics();
  }, []);
}

/**
 * React hook for tracking page views on route changes
 * Use with React Router or similar
 */
export function usePageTracking(pathname: string) {
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
}
