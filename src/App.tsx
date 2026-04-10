import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Assessment } from './components/Assessment';
import { SEOHead } from './components/SEOHead';
import PerformanceOptimizer, { ResourceHints } from './components/PerformanceOptimizer';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import { MetaPixel } from './components/MetaPixel';
import { MicrosoftClarity } from './components/MicrosoftClarity';
import { GoogleAdsRemarketing } from './components/GoogleAdsRemarketing';
import { MetaCampaignPage } from './pages/MetaCampaignPage';

function App() {
  return (
    <BrowserRouter>
      <AnalyticsProvider>
        <SEOHead />
        <ResourceHints />
        <PerformanceOptimizer />
        <MetaPixel />
        <MicrosoftClarity projectId={import.meta.env.VITE_CLARITY_PROJECT_ID} />
        <GoogleAdsRemarketing conversionId={import.meta.env.VITE_GOOGLE_ADS_ID} />

        <Routes>
          <Route path="/" element={<Assessment />} />
          <Route path="/meta" element={<MetaCampaignPage />} />
        </Routes>
      </AnalyticsProvider>
    </BrowserRouter>
  );
}

export default App;
