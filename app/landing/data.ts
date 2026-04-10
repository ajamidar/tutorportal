/**
 * landing/data.ts
 * ────────────────
 * All static content for the landing page sections.
 *
 * HOW TO MAKE CHANGES:
 *  • Add a review       → push a new object to REVIEWS
 *  • Add a feature      → push a new object to FEATURES
 *  • Add a pain point   → push a new object to PAIN_POINTS
 *  • Change stats       → edit STATS
 *  • Change CTA perks   → edit CTA_PERKS
 *  • Change typed word  → edit TYPED_WORD
 *
 * Icons are stored as LucideIcon component references (not pre-rendered JSX)
 * so each section component controls sizing/className.
 */

import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays, BookOpen, CreditCard, GraduationCap,
  Users, BarChart3, CheckCircle2,
  MessageSquare, FileText, AlertCircle, HelpCircle,
} from 'lucide-react';

// ─── Hero ─────────────────────────────────────────────────────────────────────

export const TYPED_WORD   = 'simplified.';
export const CURRENT_YEAR = new Date().getFullYear();

export interface ProofItem { Icon: LucideIcon; iconClass: string; label: string; }
export const PROOF: ProofItem[] = [
  { Icon: Users,        iconClass: 'text-indigo-400',  label: 'Tutor & student accounts' },
  { Icon: CheckCircle2, iconClass: 'text-emerald-400', label: 'No setup fees' },
  { Icon: CheckCircle2, iconClass: 'text-emerald-400', label: 'Stripe payments built in' },
];

// ─── Pain section ─────────────────────────────────────────────────────────────

export interface PainItem { Icon: LucideIcon; color: string; title: string; desc: string; }
export const PAIN_POINTS: PainItem[] = [
  { Icon: MessageSquare, color: '#ef4444', title: 'Scheduling by DM',      desc: 'Confirming one session takes 10 back-and-forth messages across WhatsApp, texts, and emails.' },
  { Icon: FileText,      color: '#f97316', title: 'Spreadsheet chaos',     desc: 'Grades, subjects, and exam boards scattered across sheets that are always out of date.' },
  { Icon: AlertCircle,   color: '#f59e0b', title: 'Chasing payments',      desc: 'Following up on bank transfers is awkward, time-consuming — and some never arrive.' },
  { Icon: HelpCircle,    color: '#ec4899', title: 'Students in the dark',  desc: "Students have no idea what homework is due, when sessions are, or how they're progressing." },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface StatItem { value: string; label: string; }
export const STATS: StatItem[] = [
  { value: '2+',  label: 'hours saved on admin each week' },
  { value: '20+', label: 'students managed per tutor' },
  { value: '£0',  label: 'in uncollected payments' },
  { value: '1',   label: 'platform replaces 5 tools' },
];

// ─── Features ─────────────────────────────────────────────────────────────────

export interface FeatureItem { Icon: LucideIcon; color: string; solves: string; title: string; desc: string; }
export const FEATURES: FeatureItem[] = [
  { Icon: CalendarDays,  color: '#6366f1', solves: 'Scheduling chaos',      title: 'Session Scheduling',     desc: 'Visual calendar with one-off and recurring sessions. No more back-and-forth — students always know when their next lesson is.' },
  { Icon: BarChart3,     color: '#10b981', solves: 'Manual grade tracking',  title: 'Student Progress',        desc: 'Track working grades, target grades, and exam boards per subject. Students see their progress journey in real time.' },
  { Icon: BookOpen,      color: '#f59e0b', solves: 'Homework confusion',     title: 'Assignments & Resources', desc: 'Set homework, attach files or links, let students mark tasks submitted. Everything organised in one place.' },
  { Icon: CreditCard,    color: '#ec4899', solves: 'Chasing payments',       title: 'Stripe Invoicing',        desc: 'Issue payment links in seconds. Track paid and unpaid invoices automatically — no more awkward payment follow-ups.' },
  { Icon: Users,         color: '#3b82f6', solves: 'Scattered student info', title: 'Student Roster',          desc: 'Add students by email with subjects, levels, and exam boards. A structured roster that stays in sync.' },
  { Icon: GraduationCap, color: '#8b5cf6', solves: 'Student confusion',      title: 'Dual Portals',            desc: 'Tutors get a full management dashboard. Students get a clean client view — same platform, two tailored experiences.' },
];

// ─── How it works ─────────────────────────────────────────────────────────────

export interface StepItem { step: string; title: string; desc: string; }
export const STEPS: StepItem[] = [
  { step: '01', title: 'Create your tutor account', desc: "Sign up in under a minute. Connect your Stripe account for payments and you're ready to go." },
  { step: '02', title: 'Add your students',          desc: "Enter each student's email, subjects, level, and exam board. They receive their login automatically." },
  { step: '03', title: 'Book & manage sessions',     desc: 'Schedule recurring or one-off lessons. Students see everything — sessions, homework, grades — in their portal.' },
];

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface ReviewItem { name: string; role: string; stars: number; text: string; }
export const REVIEWS: ReviewItem[] = [
  { name: 'Jamie R.',   role: 'GCSE Maths & Science, London',            stars: 5, text: "Before TutorFlow I was sending 15 WhatsApp messages just to confirm one session. Now everything is just there — sessions, homework, grades." },
  { name: 'Priya S.',  role: 'A-Level Biology, Manchester',              stars: 5, text: "The Stripe integration alone saved me hours of awkward payment chasing. My students pay the moment I send the link." },
  { name: 'Tom W.',    role: 'Primary & KS3 English, Bristol',           stars: 5, text: "My students love their portal. They check homework and upcoming sessions without me having to remind them every time." },
  { name: 'Aisha K.',  role: 'GCSE French & Spanish, Leeds',             stars: 5, text: "I manage 18 students across 3 schools. TutorFlow keeps it all in one place — I genuinely don't know how I coped before." },
  { name: 'Daniel M.', role: 'A-Level Maths & Further Maths, Edinburgh', stars: 5, text: "Parents love seeing a proper grade breakdown rather than just a WhatsApp update. It's built real trust with my clients." },
  { name: 'Sophie L.', role: 'GCSE Chemistry, Birmingham',               stars: 5, text: "Setup took less than 10 minutes. I added all my students, scheduled 4 weeks of sessions, and sent payment links the same evening." },
  { name: 'Marcus T.', role: 'KS2 & KS3 Maths, Oxford',                 stars: 5, text: "My tutoring feels genuinely professional now. Students and parents can see everything they need — it's built real trust." },
];

// ─── Bottom CTA ───────────────────────────────────────────────────────────────

export const CTA_PERKS: string[] = [
  'Unlimited session scheduling',
  'Student progress tracking',
  'Stripe payment links',
  'Client portal for every student',
  'No credit card required to start',
];
