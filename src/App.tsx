import { Assessment } from './components/Assessment';
import { SEOHead } from './components/SEOHead';
import PerformanceOptimizer, { ResourceHints } from './components/PerformanceOptimizer';
import { AnalyticsProvider } from './components/AnalyticsProvider';

function App() {
  return (
    <AnalyticsProvider>
      <SEOHead />
      <ResourceHints />
      <PerformanceOptimizer />
      <Assessment />
    </AnalyticsProvider>
  );
}

export default App;
