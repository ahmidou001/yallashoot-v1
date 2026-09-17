# Implementation Plan: Option 1 (Click to Play with Sound) & SEO-Safe Layout Banners

## Overview
Implement Option 1 for live match streaming:
- Show a Click-to-Play poster overlay when a match is live.
- User clicks -> triggers `triggerSmartlink()` and starts the stream with AUDIO unmuted!
- Completely remove `SocialBar` from `layout.tsx`.
- Add `LayoutAdBanner.tsx` with zero CLS in `layout.tsx` so all pages have clean, uniform banners.
- Add contextual responsive banners in `/live`, `/standings/[leagueId]`, and `/team/[id]`.

## Architecture Decisions
1. **Click to Play with Sound**:
   - Live stream starts with an activation state `isActivatedLive = false`.
   - Renders a Click-to-Play poster with team logos, match status badge ("مباشر الآن"), and glowing Play button: "▶ تشغيل البث المباشر (مع الصوت)".
   - On user click:
     - Calls `triggerSmartlink()`.
     - Sets `isActivatedLive = true` and passes `autoPlayUnmuted = true` to `VideoPlayer`.
     - `VideoPlayer` starts playback with `isMuted = false` and `volume = 1` since it was directly initiated by a user gesture.
2. **Remove SocialBar**:
   - Remove the third-party script from `src/app/layout.tsx`.
3. **Zero-CLS Layout Banner**:
   - `LayoutAdBanner.tsx` encapsulates the Adsterra 728x90 (desktop) and 320x50 (mobile) with reserved dimension skeleton wrappers.
   - Places it in `src/app/layout.tsx` directly below `<Header />`.
4. **Contextual Banners**:
   - In `/live`, `/standings/[leagueId]`, and `/team/[id]`.

## Task List
- [ ] Task 1: Remove `SocialBar` script from `yallashoot.com/src/app/layout.tsx`
- [ ] Task 2: Implement Click-to-Play with Sound in `StreamSection.tsx` & `VideoPlayer.tsx`
- [ ] Task 3: Create `LayoutAdBanner.tsx` with Zero-CLS reservation
- [ ] Task 4: Integrate `LayoutAdBanner` into `src/app/layout.tsx`
- [ ] Task 5: Add responsive banners to `/live`, `/standings/[leagueId]`, and `/team/[id]`
- [ ] Task 6: Run build verification (`npm run build`)
