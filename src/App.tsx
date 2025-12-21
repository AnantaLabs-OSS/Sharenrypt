
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Home } from './pages/Home';
import { HowToUse } from './pages/HowToUse';
import { FAQ } from './pages/FAQ';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Robots } from './pages/Robots';
import { Sitemap } from './pages/Sitemap';
import { usePageTracking } from './hooks/usePageTracking';
import { WasmLoader } from './components/WasmLoader';

function App() {
  usePageTracking();

  return (
    <WasmLoader>
      <Routes>
        {/* SEO Routes - Render raw without Layout */}
        <Route path="/sitemap.xml" element={<Sitemap />} />
        <Route path="/robots.txt" element={<Robots />} />

        {/* App Routes - Render within Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<HowToUse />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Catch-all - Redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </WasmLoader>
  );
}

export default App;