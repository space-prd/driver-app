import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function showFatalError(err: unknown) {
  const root = document.getElementById('root');
  if (!root) return;
  const message = err instanceof Error ? err.message : String(err);
  root.innerHTML = `
    <div style="
      max-width: 480px;
      margin: 0 auto;
      padding: 48px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Sukhumvit Set', sans-serif;
      color: #1d1d1f;
    ">
      <div style="
        background: #fff;
        border: 1px solid rgba(255,59,48,0.25);
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.06);
      ">
        <div style="font-size:13px;font-weight:600;color:#ff3b30;margin-bottom:8px;">
          เริ่มแอพไม่สำเร็จ
        </div>
        <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;letter-spacing:-0.02em;">
          ตั้งค่ายังไม่ครบ
        </h1>
        <pre style="
          margin:0;
          white-space:pre-wrap;
          font-size:13px;
          color:#6e6e73;
          font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
        ">${escapeHtml(message)}</pre>
      </div>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Dynamic imports so a throw at module-load time (e.g. missing Supabase env)
// reaches our catch instead of leaving a blank white page.
(async () => {
  try {
    const [{ BrowserRouter, Routes, Route, Navigate }, { default: TripPage }, { default: HomePage }] =
      await Promise.all([
        import('react-router-dom'),
        import('./pages/TripPage'),
        import('./pages/HomePage'),
      ]);

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:plate" element={<TripPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </React.StrictMode>,
    );
  } catch (err) {
    showFatalError(err);
  }
})();

window.addEventListener('error', (e) => {
  if (e.error) showFatalError(e.error);
});
