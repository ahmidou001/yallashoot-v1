# Implementation Plan: Match Page & UI Refinements

## Overview
Decomposition of the 6 requested tasks for match dates, commentator fallbacks, 3D lineup pitch matching Image 2, preventing tab scroll-jumps, header alignment with Image 4, and tab ordering.

## Task List

### Phase 1: Core Logic & Dates
- [ ] Task 1: Fix `getDateLabel` in `src/app/page.tsx` so matches today display "اليوم" instead of "غداً".
- [ ] Task 2: Implement commentator fallback selector in `src/components/MatchDetailsClient.tsx` with deterministic list.

### Phase 2: Navigation & Lineup 3D
- [ ] Task 3: Overhaul `src/components/PitchLineups.tsx` to match Image 2 with 3D perspective pitch, team toggles, formation capsule, circular avatars with top-right number badges, coach card, and substitutes.
- [ ] Task 4: Fix scroll-to-top jumping on tab change in `src/components/MatchDetailsClient.tsx` using `{ scroll: false }` and local tab state.
- [ ] Task 5: Reorder tabs in `src/components/MatchDetailsClient.tsx` to match exact sequence: (التفاصيل، أحداث المباراة، ملخص المباراة، الإحصائيات، التشكيلة، المواجهات المباشرة، الترتيب).

### Phase 3: Verification
- [ ] Task 6: Run Next.js production build (`npm run build`) to ensure 0 TypeScript or lint issues.
