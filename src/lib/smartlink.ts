/**
 * Adsterra Smartlink Manager with Frequency Capping & 30s Interaction Watcher
 * Designed to maximize CPM while strictly protecting user experience and SEO.
 */

export const SMARTLINK_URL =
  "https://www.profitableratecpmnetwork.com/mxx1c3hxf3?key=fe0231fcd6853fb60907928ad31283aa";

// 2 minutes cooldown between ad triggers
export const SMARTLINK_COOLDOWN_MS = 2 * 60 * 1000; // 120,000 ms

const STORAGE_KEY = "yalla_smartlink_last_ts";

/**
 * Check if the 2-minute cooldown period has passed.
 */
export function canTriggerSmartlink(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = sessionStorage.getItem(STORAGE_KEY);
    if (!last) return true;
    const elapsed = Date.now() - parseInt(last, 10);
    return elapsed >= SMARTLINK_COOLDOWN_MS;
  } catch {
    return true;
  }
}

/**
 * Attempt to trigger the smartlink in a new tab.
 * Respects the 2-minute cooldown unless force is true.
 * @returns boolean indicating if the smartlink was opened
 */
export function triggerSmartlink(force = false): boolean {
  if (typeof window === "undefined") return false;

  if (!force && !canTriggerSmartlink()) {
    return false;
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, Date.now().toString());
    const win = window.open(SMARTLINK_URL, "_blank", "noopener,noreferrer");
    if (win) {
      // Focus back on current window so match stays front & center
      try {
        window.focus();
      } catch {
        // ignore
      }
      return true;
    }
  } catch (err) {
    console.error("[Smartlink] Failed to open:", err);
  }

  return false;
}
