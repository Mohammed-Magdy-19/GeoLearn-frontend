import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.tsx'
import { reportWebVitals } from './lib/webVitals'

// ── Web Vitals Performance Monitoring ──
reportWebVitals((metric) => {
  if (import.meta.env.DEV) {
    console.log(`[WebVitals] ${metric.name}:`, metric.value, `(${metric.rating})`);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
