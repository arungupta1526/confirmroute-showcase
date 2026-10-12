export type ClientAuthEventType =
  | "login_success"
  | "login_failed"
  | "register_success"
  | "register_failed"
  | "logout";

export interface ClientAuthEventPayload {
  event: ClientAuthEventType;
  email?: string;
  userId?: string;
  reason?: string;
  provider?: string;
  displayName?: string;
}

export function dispatchAuthLog(_payload: ClientAuthEventPayload): void {
  // Safe client-side no-op in showcase mode
}
