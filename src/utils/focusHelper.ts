/**
 * Focus and Mobile Device Helpers for Chat Input.
 *
 * Prevents virtual keyboard (IME) from popping up automatically on mobile/touch screens
 * after messages finish streaming or on initial load, while preserving seamless autofocus
 * on desktop/laptop keyboards.
 */

/**
 * Detects whether the current device is a mobile or touch-primary device with a virtual keyboard.
 * On mobile devices, programmatically calling element.focus() forces the virtual keyboard to pop up,
 * disrupting reading and shifting the viewport height.
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  const isSmallScreen = window.innerWidth < 768;

  return (hasTouch || isCoarsePointer) && isSmallScreen;
}

/**
 * Safely focuses an HTML input/textarea element.
 * If the user is on a mobile device, programmatic focus is suppressed unless force=true (e.g. from an explicit user tap).
 */
export function safeFocusChatInput(
  element: HTMLElement | null | undefined,
  force = false
): void {
  if (!element) return;
  if (!force && isMobileDevice()) {
    // Suppress automatic focus on mobile devices to prevent unwanted virtual keyboard dial
    return;
  }
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}
