// Ensure window.fetch has a setter if running in an environment with getter-only fetch
if (typeof window !== 'undefined') {
  try {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (!desc || (!desc.set && desc.configurable)) {
      const orig = window.fetch ? window.fetch.bind(window) : null;
      let activeFetch = orig;
      Object.defineProperty(window, 'fetch', {
        get() {
          return activeFetch;
        },
        set(fn) {
          activeFetch = fn;
        },
        configurable: true,
        enumerable: true,
      });
    }
  } catch (_e) {
    // Ignore if restricted
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
