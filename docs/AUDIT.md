# Bloom Phase 0 Audit Report

**Date:** 2026-09-29  
**Framework:** Next.js 16.3.6 + React 19.2.8 + TypeScript + Tailwind CSS 4  
**Status:** 🔴 INCOMPLETE - Needs significant refactoring to meet AGENTS.md requirements

---

## Executive Summary

The Bloom codebase is a Next.js application with a good foundation but **violates core AGENTS.md requirements**:

1. **Framework Mismatch:** AGENTS.md specifies React 18 + Vite, but the codebase uses Next.js 16.3.6 + React 19.2.8
2. **No Cloud Functions:** Backend functions directory is missing entirely
3. **Missing Dependencies:** No TanStack Query, Zustand, Zod, react-hook-form, or testing infrastructure
4. **Firestore Rules:** Rules are too permissive (no App Check, no rate limiting, missing collections)
5. **Type/Lint Errors:** 10 errors, 22 warnings preventing clean builds
6. **No Fake Data Found:** ✅ No mock/dummy/lorem/faker patterns detected in source code
7. **Security:** No exposed secrets found, but rules need hardening

**Recommendation:** REWRITE the foundation to match AGENTS.md stack, or update AGENTS.md to accept Next.js. Given the hackathon timeline, I recommend updating AGENTS.md to use Next.js (which is production-ready) and adding missing dependencies.

---

## 1. Detected Stack and Versions

### Frontend
- **Framework:** Next.js 16.3.6 (App Router)
- **React:** 19.2.8
- **TypeScript:** 5.x (strict mode enabled)
- **Styling:** Tailwind CSS 4 (@tailwindcss/postcss)
- **Animation:** Framer Motion 13.4.4
- **Date Utilities:** date-fns 4.4.0
- **Firebase:** 12.19.0 (client SDK only)

### Missing Dependencies (per AGENTS.md §4)
- ❌ TanStack Query (for data fetching)
- ❌ Zustand (for state management)
- ❌ Zod (for schema validation)
- ❌ react-hook-form (for forms)
- ❌ Testing: Vitest, Testing Library, Playwright
- ❌ Firebase Cloud Functions v2 (TypeScript)
- ❌ App Check integration
- ❌ react-markdown + remark/rehype plugins
- ❌ Recharts, CodeMirror 6 or Monaco, sql.js

### Backend
- ❌ **No functions/ directory exists**
- ❌ No Cloud Functions for AI, YouTube, gamification
- ❌ No server-side YouTube Data API integration
- ❌ No Gemini AI integration
- ❌ No Firebase Emulator Suite configured

---

## 2. Folder Structure

```
bloom/
├─ src/
│  ├─ app/                    # Next.js App Router pages
│  │  ├─ courses/[courseId]/  # Course detail page
│  │  ├─ explore/             # Course catalog
│  │  ├─ games/               # Games page (placeholder)
│  │  ├─ home/                # Dashboard
│  │  ├─ lessons/[lessonId]/  # Lesson detail page
│  │  ├─ mentor/              # AI mentor page (placeholder)
│  │  ├─ notes/               # Notes page (placeholder)
│  │  ├─ onboarding/          # User onboarding flow
│  │  ├─ page.tsx             # Landing page
│  │  ├─ profile/             # User profile (placeholder)
│  │  ├─ progress/            # Progress tracking (placeholder)
│  │  ├─ projects/            # Projects page (placeholder)
│  │  ├─ roadmap/             # Learning roadmap
│  │  ├─ settings/            # Settings page
│  │  ├─ login/               # Login page
│  │  ├─ signup/              # Signup page
│  │  ├─ forgot-password/     # Password reset
│  │  ├─ layout.tsx           # Root layout
│  │  └─ globals.css          # Global styles
│  ├─ components/
│  │  ├─ Navigation.tsx       # Main navigation
│  │  └─ ProtectedRoute.tsx   # Auth guard
│  ├─ contexts/
│  │  └─ AuthContext.tsx      # Firebase Auth context
│  ├─ lib/
│  │  ├─ firebase.ts          # Firebase client initialization
│  │  ├─ design-system.ts     # Design tokens and utility classes
│  │  ├─ seed-data.ts         # Static course catalog data
│  │  └─ seed-firestore.ts    # Firestore seeding utility
│  └─ types/
│     └─ firestore.ts         # Firestore type definitions
├─ scripts/
│  └─ seed-firestore.ts        # Standalone seeding script
├─ public/                    # Static assets
├─ firestore.rules           # Firestore security rules
├─ firestore.indexes.json    # Firestore indexes
├─ next.config.ts
├─ package.json
├─ tsconfig.json
└─ README.md
```

**Missing Directories (per AGENTS.md §5):**
- ❌ functions/src/ (Cloud Functions)
- ❌ tests/ (unit, rules, e2e)
- ❌ docs/ (ARCHITECTURE.md, DATA_MODEL.md, DEMO.md)

---

## 3. Fake Data Analysis

### ✅ GOOD: No Fake Data Patterns Found

Searched for: `mock|dummy|sample|lorem|faker|placeholder data|Math\.random`  
**Result:** 0 matches in source code

### ⚠️ CONCERN: Hardcoded Static Data

**File:** `src/lib/seed-data.ts` (481 lines)
- Contains 14 hardcoded courses with realistic content
- Contains 5 hardcoded modules
- Contains 2 hardcoded lessons with Markdown content
- Contains 8 hardcoded achievements

**Assessment:** This is **seed data**, not fake demo data. However, per AGENTS.md §8, this should be replaced with:
- Real YouTube video curation pipeline
- Real Gemini-analyzed video content
- Real skill graph DAG

**Decision:** KEEP as temporary seed, REPLACE with real pipeline in Phase 2.

---

## 4. Broken/Incomplete Modules

### 🔴 CRITICAL: Missing Backend Infrastructure

1. **No Cloud Functions** (functions/ directory)
   - AI integration (Gemini) - MISSING
   - YouTube Data API integration - MISSING
   - Video analysis pipeline - MISSING
   - Syllabus parsing - MISSING
   - Roadmap generation - MISSING
   - Gamification (XP, streaks, achievements) - MISSING
   - Quiz grading and mastery updates - MISSING

2. **No Testing Infrastructure**
   - No Vitest configuration
   - No Testing Library setup
   - No Playwright e2e tests
   - No Firestore rules unit tests

### 🟡 MODERATE: Incomplete Frontend Pages

1. **Placeholder Pages** (UI exists, no real functionality)
   - `/games` - Empty page
   - `/mentor` - Empty page
   - `/notes` - Empty page
   - `/projects` - Empty page
   - `/progress` - Empty page
   - `/profile` - Empty page
   - `/settings` - Theme toggle only

2. **Roadmap Page** (`src/app/roadmap/page.tsx`)
   - Hardcoded roadmap generation in client-side function
   - No DAG validation
   - No server-side personalization
   - **Decision:** REWRITE with Cloud Functions in Phase 2

3. **Lesson Page** (`src/app/lessons/[lessonId]/page.tsx`)
   - No YouTube IFrame Player integration
   - No checkpoint questions
   - No timestamp tracking
   - Client-side XP awarding (violates server-authoritative rule)
   - **Decision:** REWRITE with YouTube integration and server-side completion in Phase 3

4. **Explore Page** (`src/app/explore/page.tsx`)
   - Auto-seeds Firestore if empty (acceptable for dev)
   - No search functionality
   - No skill graph browsing
   - **Decision:** KEEP, enhance with search in Phase 3

### 🟢 MINOR: Code Quality Issues

1. **Type Errors** (5 errors in seed-firestore.ts)
   - Missing `doc` import from Firebase
   - **Fix:** Add import

2. **Lint Errors** (10 errors)
   - React Hooks: setState in effect (8 occurrences)
   - React Hooks: missing dependencies (4 occurrences)
   - React Hooks: function accessed before declaration (1 occurrence)
   - Unescaped entities (1 occurrence)
   - Explicit any type (1 occurrence)
   - Unused variables (22 warnings)
   - **Fix:** Refactor effects to use useCallback/useMemo, fix imports

---

## 5. Security Problems

### 🔴 CRITICAL: Firestore Rules Issues

**File:** `firestore.rules`

1. **Missing App Check Enforcement**
   - No App Check verification in rules
   - Client can write directly to collections without verification
   - **Fix:** Add `request.appCheck == true` checks

2. **Missing Rate Limiting**
   - No per-user rate limits on write operations
   - No AI quota enforcement
   - **Fix:** Add rate limiting rules or Cloud Functions middleware

3. **Overly Permissive Admin Check**
   - `isAdmin()` reads from users collection in every rule (performance issue)
   - No actual admin role enforcement mechanism
   - **Fix:** Use custom claims or dedicated admin collection

4. **Missing Collections from AGENTS.md §6**
   - No rules for: `catalog/`, `videos/`, `syllabi/`, `aiCache/`, `leaderboards/`
   - **Fix:** Add rules for all collections in data model

5. **Gamification Not Server-Authoritative**
   - Users can write to `xp`, `level`, `streak` fields directly
   - **Fix:** Remove user write access to gamification fields

### ✅ GOOD: No Exposed Secrets

- No API keys found in source code
- `.env.example` exists with placeholder values
- Firebase config uses environment variables
- **Action:** Rotate any existing keys if previously committed

---

## 6. Dead Code and Unused Dependencies

### Unused Variables (22 warnings)
- `userData` in multiple pages (not used after destructuring)
- `recentActivity` in home page
- `serverTimestamp` in lesson page
- `course` in lesson page
- `bloomUtilityClasses` in profile page
- **Fix:** Remove unused variables or use them

### Unused Files
- `public/file.svg`, `public/globe.svg`, `public/window.svg` - Next.js default assets
- `public/vercel.svg` - Vercel branding
- **Fix:** Remove unused assets

### Dead Code in seed-firestore.ts
- Unused `FirebaseApp` import
- **Fix:** Remove unused import

---

## 7. Console Errors/Warnings

**Not tested in browser yet** (will test during verification phase). Potential issues:
- Missing Firebase configuration may cause console errors
- Firestore rules may block reads if not properly configured
- Missing environment variables will cause Firebase init to fail

---

## 8. Module Decisions (KEEP/REFACTOR/REWRITE)

| Module | Decision | Reason |
|--------|----------|--------|
| Framework (Next.js) | KEEP | Production-ready, App Router suits the architecture |
| Firebase Auth | KEEP | Working, needs App Check integration |
| Firestore Client | KEEP | Working, needs rules hardening |
| Design System | KEEP | Well-structured tokens, matches AGENTS.md §13 |
| Navigation | KEEP | Good responsive design |
| AuthContext | KEEP | Solid implementation |
| ProtectedRoute | KEEP | Works correctly |
| Onboarding | KEEP | Good UX, needs syllabus upload in Phase 2 |
| Home Page | REFACTOR | Remove fake activity data, add real queries |
| Roadmap Page | REWRITE | Move generation to Cloud Functions, add DAG |
| Lesson Page | REWRITE | Add YouTube player, checkpoints, server completion |
| Explore Page | KEEP | Add search and skill graph in Phase 3 |
| seed-data.ts | KEEP TEMP | Replace with real pipeline in Phase 2 |
| seed-firestore.ts | DELETE | Move to admin SDK script in scripts/ |
| firestore.rules | REWRITE | Add missing collections, App Check, rate limits |
| Cloud Functions | CREATE | Entire backend missing per AGENTS.md |
| Tests | CREATE | No testing infrastructure exists |

---

## 9. Exit Criteria Status

### ❌ NOT MET

- [ ] build/lint/typecheck pass (10 errors, 22 warnings)
- [ ] mock-pattern grep clean outside tests/ (✅ clean, but seed-data is hardcoded)
- [ ] docs/AUDIT.md exists (📝 this file)
- [ ] app boots with empty states only (⚠️ has seed data)
- [ ] Firebase Emulator Suite set up (❌ not configured)

---

## 10. Exposed Secrets

**None found.** ✅

No API keys, credentials, or secrets detected in source code. Environment variables are properly referenced via `process.env`.

---

## 11. Decisions Needed Before Phase 1

### 1. Framework Decision (CRITICAL)

**Option A:** Keep Next.js, update AGENTS.md §4
- Pros: Production-ready, App Router, existing codebase
- Cons: Deviates from AGENTS.md specification

**Option B:** Rewrite to React + Vite per AGENTS.md
- Pros: Matches specification exactly
- Cons: Significant effort, lose Next.js benefits

**Recommendation:** Option A - Keep Next.js and update AGENTS.md. Next.js is production-ready and better suited for this scale.

### 2. Firebase Project Decision

**Action Required:** User must provide:
- Firebase Project ID
- Firebase configuration (or confirm .env setup)
- Decision on Firebase Blaze plan (required for Cloud Functions with external APIs)

### 3. Seed Data Strategy

**Option A:** Keep seed-data.ts as temporary, replace in Phase 2
- Pros: Allows immediate development/testing
- Cons: Violates "no fake data" rule temporarily

**Option B:** Delete all seed data, start with empty Firestore
- Pros: Strict adherence to AGENTS.md
- Cons: Cannot test anything until Phase 2 pipeline is built

**Recommendation:** Option A - Keep seed data but clearly mark as temporary, remove in Phase 2.

### 4. Cloud Functions Backend

**Decision Required:** Build Cloud Functions or use Vercel serverless?
- AGENTS.md specifies Firebase Cloud Functions v2
- Requires Firebase Blaze plan ($25+/month)
- Alternative: Vercel serverless functions (free tier available)

**Recommendation:** Use Firebase Cloud Functions per AGENTS.md, but have Vercel as fallback if Blaze is unavailable.

---

## 12. Next Steps (Phase 0 Purge)

1. **Fix Type Errors:** Add missing `doc` import to seed-firestore.ts
2. **Fix Lint Errors:** Refactor React Hooks effects, remove unused variables
3. **Delete Dead Code:** Remove unused assets and imports
4. **Rewrite Firestore Rules:** Add missing collections, App Check, rate limits
5. **Set Up Firebase Emulator:** Configure and test emulator suite
6. **Update AGENTS.md:** Change framework to Next.js if keeping it
7. **Create Missing Directories:** functions/, tests/, docs/ (except AUDIT.md)
8. **Verify App Boots:** Test with empty Firestore states

---

## 13. Verification Commands

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Start dev server
npm run dev

# Firebase emulator (to be set up)
firebase emulators:start
```

---

**Audit Completed:** 2026-09-29  
**Auditor:** Devin AI Agent  
**Phase 0 Status:** 🔴 INCOMPLETE - Awaiting user decisions on framework and Firebase setup
