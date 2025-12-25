import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Assessment } from './components/Assessment';
import { SEOHead } from './components/SEOHead';
import PerformanceOptimizer, { ResourceHints } from './components/PerformanceOptimizer';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import { MetaPixel } from './components/MetaPixel';
import { MicrosoftClarity } from './components/MicrosoftClarity';
import { ABTestingProvider, ABTestDebugPanel } from './components/ABTesting';
import { MetaCampaignPage } from './pages/MetaCampaignPage';

function App() {
  return (
    <BrowserRouter>
      <ABTestingProvider>
        <AnalyticsProvider>
          <SEOHead />
          <ResourceHints />
          <PerformanceOptimizer />
          <MetaPixel />
          <MicrosoftClarity projectId={import.meta.env.VITE_CLARITY_PROJECT_ID} />

          <Routes>
            {/* Main Assessment Page */}
            <Route path="/" element={<Assessment />} />

            {/* Meta Campaign Landing Page */}
            <Route path="/meta" element={<MetaCampaignPage />} />
          </Routes>

          {/* Debug panel - only visible in development */}
          <ABTestDebugPanel />
        </AnalyticsProvider>
      </ABTestingProvider>
    </BrowserRouter>
  );
}

export default App;
