/**
 * landing/styles.ts
 * ──────────────────
 * All CSS for the landing page — keyframes, utility classes, component styles.
 * Injected as a single <style> tag by the page orchestrator.
 *
 * HOW TO MAKE CHANGES:
 *  • New animation   → add a @keyframes block and a class below
 *  • New component   → add a class block at the bottom
 *  • Scroll-reveal   → the [data-animate] system is here; data-delay controls stagger
 */

export const LANDING_CSS = `
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes blob {
    0%,100% { transform:translate(0,0) scale(1); }
    33%     { transform:translate(30px,-50px) scale(1.1); }
    66%     { transform:translate(-20px,20px) scale(0.95); }
  }
  @keyframes pulse-ring {
    0%   { transform:scale(1);   opacity:.6; }
    100% { transform:scale(1.5); opacity:0;  }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  /* Hero entrance animations */
  .fade-up-1 { animation: fadeUp .65s ease both; }
  .fade-up-2 { animation: fadeUp .65s  .1s ease both; }
  .fade-up-3 { animation: fadeUp .65s  .2s ease both; }
  .fade-up-4 { animation: fadeUp .65s  .3s ease both; }
  .fade-up-5 { animation: fadeUp .65s  .4s ease both; }

  /* Animated background blobs */
  .blob-anim { animation: blob 7s infinite ease-in-out; }
  .blob-d1   { animation-delay: 2.5s; }
  .blob-d2   { animation-delay: 5s; }

  /* Scroll-reveal — triggered by the IntersectionObserver in LandingPageClient */
  [data-animate] { opacity:0; transform:translateY(30px); transition:opacity .6s ease,transform .6s ease; }
  [data-animate].in-view { opacity:1; transform:none; }
  [data-animate][data-dir="left"]  { transform:translateX(-30px); }
  [data-animate][data-dir="right"] { transform:translateX(30px); }
  [data-animate][data-dir="left"].in-view,
  [data-animate][data-dir="right"].in-view { transform:none; }
  [data-delay="1"] { transition-delay: .08s; }
  [data-delay="2"] { transition-delay: .16s; }
  [data-delay="3"] { transition-delay: .24s; }
  [data-delay="4"] { transition-delay: .32s; }
  [data-delay="5"] { transition-delay: .40s; }
  [data-delay="6"] { transition-delay: .48s; }

  /* Feature cards — hover driven by CSS custom props set on the grid parent */
  .feature-card {
    background: var(--card-bg);
    border-color: var(--card-border);
    box-shadow: var(--card-base-shadow);
    transition: background .22s, border-color .22s, transform .22s, box-shadow .22s;
  }
  .feature-card:hover {
    background: var(--card-hover-bg);
    border-color: var(--card-hover-border);
    box-shadow: var(--card-hover-shadow);
    transform: translateY(-4px);
  }

  /* Pain cards */
  .pain-card { transition: transform .22s, box-shadow .22s; }
  .pain-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(239,68,68,0.12); }

  /* Infinite review marquee */
  .marquee-track { display:flex; width:max-content; animation:marquee 40s linear infinite; }
  .marquee-track:hover { animation-play-state:paused; }
  .review-card { transition: transform .2s, box-shadow .2s; }
  .review-card:hover { transform: translateY(-3px); }

  /* Interactive elements */
  .toggle-btn { transition: background .2s, border-color .2s, color .2s, transform .15s; }
  .toggle-btn:hover { transform: scale(1.08); }
  .cta-link { transition: opacity .15s, transform .15s; }
  .cta-link:hover { opacity:.9; transform:translateY(-1px); }
  .page-transition { transition: background .35s ease; }

  /* Gradient text for typewriter word — colours set via CSS vars on the page wrapper */
  .grad-text {
    background: linear-gradient(135deg, var(--grad-start) 0%, var(--grad-mid) 55%, var(--grad-end) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
    display: inline;
  }
  .typed-cursor {
    display: inline-block; width: 3px; margin-left: 2px; border-radius: 2px;
    background: var(--cursor-color); vertical-align: baseline; height:.85em; position:relative; top:.05em;
  }
`;
