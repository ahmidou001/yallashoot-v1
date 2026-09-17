# Implementation Plan: Native In-Feed Ad Cards & Layout Ad Balancing

## Overview
Based on user analysis and screenshots:
1. Remove redundant top banner on `/` (keeping the approved one below leagues).
2. Create Native In-Feed Match Ad Card inside the matches grid on `/live`.
3. Remove duplicate top banner on `/highlights` and insert a Native Highlight Ad Card inside the highlights grid.
4. Remove duplicate top banner on `/news` and insert a Native Article Ad Card inside the articles grid.
5. In `/team/[id]`, move the ad down into the empty space below "آخر النتائج" in the left sidebar.

## Architecture Decisions
- Remove `<LayoutAdBanner />` from `src/app/layout.tsx` to stop duplicate banners on `/`, `/highlights`, `/news`, and `/team`.
- Keep top `<ResponsiveAdBanner />` in `/live` as requested with the green checkmark.
- Create reusable `src/components/ads/NativeFeedAdCard.tsx` or inject native ad cards with exact styling of parent grid items.
- In `src/components/TeamDetailsClient.tsx`, insert a 300x250 ad widget inside the sidebar (`lg:col-span-1 space-y-6`) right under `resultsList`.

## Task List
- [ ] Task 1: Remove `<LayoutAdBanner />` from `src/app/layout.tsx`
- [ ] Task 2: Update `/live` page with top banner and Native Match Ad Card in the grid
- [ ] Task 3: Update `/highlights` (`HighlightsClient.tsx`) with Native Highlight Ad Card in the grid
- [ ] Task 4: Update `/news` (`news/page.tsx`) with Native Article Ad Card in the grid
- [ ] Task 5: Move ad in `/team/[id]` (`TeamDetailsClient.tsx`) into the empty space below "آخر النتائج"
- [ ] Task 6: Verify build (`npm run build`)
