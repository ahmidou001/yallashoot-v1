# Implementation Plan: Mock Player Monetization, Telegram Integration & Media Generator Update

## Overview
Implement three interconnected features:
1. **Mock Player Click-to-Play Activation**: When visiting an upcoming match page, show an enticing player poster with a glowing Play button instead of showing the static countdown directly. On click, trigger `triggerSmartlink()` (monetization) and show a brief realistic server connection animation before revealing the countdown and telegram call to action.
2. **Floating Telegram Channel Button**: Add a dedicated, sleek floating Telegram button (`https://t.me/yalla_shooot`) alongside the PWA install button on the website, plus Telegram callout inside the countdown screen.
3. **Media Generator Domain Update**: Update `dashboard-yallatir` Media Generator (MatchPoster, SummaryPoster, SchedulePoster, PosterControls, MediaGeneratorTabs) so watermarks and default URLs point to `yallahsoot.com`.

## Architecture Decisions
- **StreamSection State Machine**: Add an `isActivatedBeforeKickoff` state. If false, render the Mock Player Poster. When clicked, call `triggerSmartlink()`, show a 1.2s connecting spinner, then set `isActivatedBeforeKickoff = true` to reveal `<StreamCountdown />`.
- **PWA / Floating Widget Alignment**: Expand the fixed floating container in `PwaInstallPrompt.tsx` into a responsive action cluster containing both the PWA install badge and the Telegram channel badge (`https://t.me/yalla_shooot`).
- **Media Generator Watermark Consistency**: Replace all hardcoded occurrences of `yellashoots.com` with `yallahsoot.com` in `dashboard-yallatir`.

## Task List

### Phase 1: Mock Player & First-Click Monetization (`yallashoot.com`)
- [ ] **Task 1: Add Mock Player Overlay to `StreamSection.tsx`**:
  - Render player poster with team logos, match title, and pulsing Play button when match hasn't started yet (`showCountdown === true`).
  - Clicking Play calls `triggerSmartlink()`, shows 1.2s connection animation, and unlocks `<StreamCountdown>`.
- [ ] **Task 2: Add Telegram CTA to `StreamCountdown.tsx`**:
  - Add prominent Telegram join button linking to `https://t.me/yalla_shooot` with custom styling.

### Phase 2: Floating Telegram Button (`yallashoot.com`)
- [ ] **Task 3: Floating Telegram Button in `PwaInstallPrompt.tsx`**:
  - Add Telegram button next to the PWA install floating button on the bottom left.
  - Links to `https://t.me/yalla_shooot` in `_blank`.

### Phase 3: Media Generator Domain Migration (`dashboard-yallatir`)
- [ ] **Task 4: Update Media Generator Posters & Controls**:
  - Update `MatchPoster.tsx`, `SummaryPoster.tsx`, `SchedulePoster.tsx`, `PosterControls.tsx`, and `MediaGeneratorTabs.tsx` from `yellashoots.com` to `yallahsoot.com`.

### Phase 4: Verification
- [ ] **Task 5: Build Verification**:
  - Verify `yallashoot.com` builds without TypeScript or bundling errors.
