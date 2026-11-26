import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './ui/styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA：生产构建且非 Electron 时注册 Service Worker（离线可打开）
const isElectron = Boolean((window as unknown as { workstream?: unknown }).workstream);
if (import.meta.env.PROD && 'serviceWorker' in navigator && !isElectron) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* 离线能力不可用不影响主流程 */
    });
  });
}
