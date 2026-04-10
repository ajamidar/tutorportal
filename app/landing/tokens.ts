/**
 * landing/tokens.ts
 * ──────────────────
 * All colour/style tokens for the landing page.
 * To change the colour scheme — edit DARK or LIGHT below.
 * To add a new token — add it to BOTH objects so switching themes stays consistent.
 */

export const DARK = {
  pageBg: 'linear-gradient(135deg, #0f0f1a 0%, #12122a 40%, #0d1a2e 100%)',
  blobA: '#6366f1', blobB: '#3b82f6', blobC: '#8b5cf6',
  navBg: '#0f0f1a', navBorder: 'rgba(255,255,255,0.08)',
  logoGrad: 'linear-gradient(135deg,#6366f1,#4f46e5)', brandText: '#ffffff',
  badgeBg: 'rgba(99,102,241,0.18)', badgeBorder: 'rgba(99,102,241,0.35)', badgeText: '#a5b4fc',
  h1Color: '#ffffff', h1Shadow: '0 0 80px rgba(99,102,241,0.3)', subText: '#94a3b8',
  ctaPrimary: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
  ctaPrimaryShadow: '0 4px 24px rgba(99,102,241,0.4)',
  ctaSecBg: 'rgba(255,255,255,0.08)', ctaSecBorder: 'rgba(255,255,255,0.18)', ctaSecText: '#ffffff',
  proofText: '#94a3b8',
  sectionLabel: '#818cf8', sectionH2: '#ffffff', sectionP: '#94a3b8',
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  cardHoverBg: 'rgba(255,255,255,0.1)', cardHoverBorder: 'rgba(99,102,241,0.4)',
  cardBaseShadow: 'none', cardHoverShadow: '0 20px 60px rgba(99,102,241,0.15)',
  cardTitle: '#ffffff', cardDesc: '#94a3b8',
  stepNum: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
  stepNumShadow: '0 4px 20px rgba(99,102,241,0.4)',
  stepTitle: '#ffffff', stepDesc: '#94a3b8', stepLine: 'rgba(99,102,241,0.25)',
  ctaBoxBg: 'linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(79,70,229,0.12) 100%)',
  ctaBoxBorder: 'rgba(99,102,241,0.3)', ctaBoxShadow: '0 0 80px rgba(99,102,241,0.12)',
  ctaH2: '#ffffff', ctaP: '#cbd5e1',
  footerBorder: 'rgba(255,255,255,0.08)', footerBrand: '#ffffff',
  footerCopy: '#475569', footerLink: '#475569',
  toggleBg: 'rgba(255,255,255,0.08)', toggleBorder: 'rgba(255,255,255,0.15)', toggleIcon: '#fbbf24',
  gradStart: '#818cf8', gradMid: '#6366f1', gradEnd: '#4f46e5', cursorColor: '#6366f1',
  painBg: 'rgba(0,0,0,0.2)', painCardBg: 'rgba(239,68,68,0.07)', painCardBorder: 'rgba(239,68,68,0.18)',
  painText: '#94a3b8', painHeadline: '#ffffff',
  statsBg: 'rgba(99,102,241,0.1)', statsBorder: 'rgba(99,102,241,0.2)', statsNum: '#ffffff', statsLabel: '#94a3b8',
  quoteBg: 'rgba(255,255,255,0.04)', quoteBorder: 'rgba(99,102,241,0.25)',
  quoteText: '#e2e8f0', quoteAuthor: '#818cf8', quoteRole: '#64748b',
  checkBg: 'rgba(99,102,241,0.12)', checkBorder: 'rgba(99,102,241,0.3)', checkIcon: '#818cf8', checkText: '#cbd5e1',
} as const;

export const LIGHT = {
  pageBg: 'linear-gradient(160deg, #f0f7ff 0%, #dbeafe 35%, #f0f9ff 100%)',
  blobA: '#bfdbfe', blobB: '#bae6fd', blobC: '#dbeafe',
  navBg: '#ffffff', navBorder: 'rgba(59,130,246,0.15)',
  logoGrad: 'linear-gradient(135deg,#3b82f6,#2563eb)', brandText: '#0f2d5c',
  badgeBg: 'rgba(59,130,246,0.1)', badgeBorder: 'rgba(59,130,246,0.28)', badgeText: '#1d4ed8',
  h1Color: '#0f172a', h1Shadow: 'none', subText: '#475569',
  ctaPrimary: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)',
  ctaPrimaryShadow: '0 4px 20px rgba(59,130,246,0.4)',
  ctaSecBg: 'rgba(59,130,246,0.07)', ctaSecBorder: 'rgba(59,130,246,0.25)', ctaSecText: '#1d4ed8',
  proofText: '#64748b',
  sectionLabel: '#2563eb', sectionH2: '#0f172a', sectionP: '#475569',
  cardBg: '#ffffff', cardBorder: 'rgba(59,130,246,0.12)',
  cardHoverBg: '#eff6ff', cardHoverBorder: 'rgba(59,130,246,0.4)',
  cardBaseShadow: '0 2px 12px rgba(59,130,246,0.07)', cardHoverShadow: '0 12px 40px rgba(59,130,246,0.14)',
  cardTitle: '#0f172a', cardDesc: '#475569',
  stepNum: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)',
  stepNumShadow: '0 4px 20px rgba(59,130,246,0.35)',
  stepTitle: '#0f172a', stepDesc: '#475569', stepLine: 'rgba(59,130,246,0.2)',
  ctaBoxBg: 'linear-gradient(135deg,rgba(59,130,246,0.09) 0%,rgba(37,99,235,0.05) 100%)',
  ctaBoxBorder: 'rgba(59,130,246,0.2)', ctaBoxShadow: '0 4px 40px rgba(59,130,246,0.1)',
  ctaH2: '#0f172a', ctaP: '#475569',
  footerBorder: 'rgba(59,130,246,0.12)', footerBrand: '#0f172a',
  footerCopy: '#94a3b8', footerLink: '#94a3b8',
  toggleBg: 'rgba(59,130,246,0.08)', toggleBorder: 'rgba(59,130,246,0.22)', toggleIcon: '#2563eb',
  gradStart: '#bfdbfe', gradMid: '#93c5fd', gradEnd: '#60a5fa', cursorColor: '#93c5fd',
  painBg: 'rgba(254,242,242,0.45)', painCardBg: '#fff7f5', painCardBorder: 'rgba(239,68,68,0.15)',
  painText: '#475569', painHeadline: '#0f172a',
  statsBg: 'rgba(59,130,246,0.07)', statsBorder: 'rgba(59,130,246,0.15)', statsNum: '#0f172a', statsLabel: '#475569',
  quoteBg: '#f8fafe', quoteBorder: 'rgba(59,130,246,0.15)',
  quoteText: '#1e293b', quoteAuthor: '#1d4ed8', quoteRole: '#64748b',
  checkBg: 'rgba(59,130,246,0.08)', checkBorder: 'rgba(59,130,246,0.2)', checkIcon: '#2563eb', checkText: '#374151',
} as const;

/** All token values are CSS strings */
export type Tokens = Record<string, string>;
