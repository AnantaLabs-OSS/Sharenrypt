import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import Peer from 'peerjs';

// Expose PeerJS for Wasm
(window as any).Peer = Peer;

import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { ThemeProvider } from './context/ThemeContext';
import { LicenseProvider } from './context/LicenseContext';

import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider defaultTheme="dark" storageKey="sharencrypt-theme">
            <LicenseProvider>
              <App />
            </LicenseProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
);
