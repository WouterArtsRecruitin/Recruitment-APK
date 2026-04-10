import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Assessment } from './components/Assessment';
import { SEOHead } from './components/SEOHead';
import PerformanceOptimizer, { ResourceHints } from './components/PerformanceOptimizer';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import { MetaPixel } from './components/MetaPixel';
import { MicrosoftClarity } from './components/MicrosoftClarity';
import { GoogleAdsRemarketing } from './components/GoogleAdsRemarketing';
import { MetaCampaignPage } from './pages/MetaCampaignPage';
import { ThankYou } from './components/ThankYou';
import { Rapport } from './components/Rapport';

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
          <Route path="/bedankt" element={<ThankYou />} />
          <Route path="/rapport" element={<Rapport />} />
        </Routes>
      </AnalyticsProvider>
    </BrowserRouter>
  );
}

export default App;
