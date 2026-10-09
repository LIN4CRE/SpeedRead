import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Register PWA Service Worker for offline resilience
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        // Log successful registration or updates
        if (reg.installing) {
          console.debug('[PWA] Service worker installing');
        } else if (reg.active) {
          console.debug('[PWA] Service worker active and caching assets');
        }
      })
      .catch((err) => {
        console.warn('[PWA] Service worker registration failed:', err);
      });
  });
}
