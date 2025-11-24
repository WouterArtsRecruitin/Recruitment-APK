import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Assessment } from './components/Assessment';
import { SEOHead } from './components/SEOHead';
import PerformanceOptimizer, { ResourceHints } from './components/PerformanceOptimizer';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import { MetaPixel } from './components/MetaPixel';
import { MetaCampaignPage } from './pages/MetaCampaignPage';

function App() {
  return (
    <BrowserRouter>
      <AnalyticsProvider>
        <SEOHead />
        <ResourceHints />
        <PerformanceOptimizer />
        <MetaPixel />

        <Routes>
          {/* Main Assessment Page */}
          <Route path="/" element={<Assessment />} />

          {/* Meta Campaign Landing Page */}
          <Route path="/meta" element={<MetaCampaignPage />} />
        </Routes>
      </AnalyticsProvider>
    </BrowserRouter>
  );
}

export default App;
