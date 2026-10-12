/**
 * Safe browser history manipulation utilities that update the browser address bar
 * without triggering Next.js App Router full page unmounts or aborted stream fetches.
 *
 * Next.js app-router intercepts window.history.pushState/replaceState and invokes
 * applyUrlFromHistoryPushReplace unless `data?._N` or `data?.__NA` is present.
 */

export function safeReplaceState(url: string): void {
  if (typeof window === "undefined") return;
  try {
    const currentState = window.history.state || {};
    window.history.replaceState({ ...currentState, _N: true }, "", url);
  } catch {
    window.history.replaceState(null, "", url);
  }
}

export function safePushState(url: string): void {
  if (typeof window === "undefined") return;
  try {
    const currentState = window.history.state || {};
    window.history.pushState({ ...currentState, _N: true }, "", url);
  } catch {
    window.history.pushState(null, "", url);
  }
}
