/**
 * Client-Side Persistent Device Identifier
 */

const DEVICE_STORAGE_KEY = "confirmroute_device_id";
const COOKIE_NAME = "confirmroute_device_id";
const ANON_STORAGE_KEY = "confirmroute_anon_session_id";
const ANON_COOKIE_NAME = "confirmroute_anon_session_id";

function getClientHardwareFingerprint(): string {
  if (typeof window === "undefined") return "";
  try {
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const nav = window.navigator;
    const str = `${screenInfo}_${nav.language}_${nav.hardwareConcurrency || 4}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  } catch {
    return "";
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}


function getSecureRandomToken(): string {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === "function") {
      const arr = new Uint32Array(2);
      crypto.getRandomValues(arr);
      return `${arr[0].toString(36)}${arr[1].toString(36)}`;
    }
  }
  return `${Date.now()}`;
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const maxAge = 365 * 24 * 60 * 60; // 1 year
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

export function getOrCreateAnonymousSessionId(): string {
  if (typeof window === "undefined") return "";

  try {
    let anonId = localStorage.getItem(ANON_STORAGE_KEY);
    if (!anonId) {
      anonId = getCookie(ANON_COOKIE_NAME);
      if (anonId) {
        try {
          localStorage.setItem(ANON_STORAGE_KEY, anonId);
        } catch {}
      }
    }

    if (!anonId) {
      anonId = `anon_${getSecureRandomToken()}`;
      try {
        localStorage.setItem(ANON_STORAGE_KEY, anonId);
      } catch {}
    }

    setCookie(ANON_COOKIE_NAME, anonId);
    return anonId;
  } catch {
    return "";
  }
}

export function getClientDeviceId(): string {
  if (typeof window === "undefined") return "";

  try {
    const fp = getClientHardwareFingerprint();

    if (fp) {
      const fpDeviceId = `dev_${fp}`;
      try {
        localStorage.setItem(DEVICE_STORAGE_KEY, fpDeviceId);
        setCookie(COOKIE_NAME, fpDeviceId);
      } catch {}
      return fpDeviceId;
    }

    let did = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!did) {
      did = getCookie(COOKIE_NAME);
      if (did) {
        localStorage.setItem(DEVICE_STORAGE_KEY, did);
      }
    }

    if (!did) {
      did = `dev_${getSecureRandomToken()}`;
      localStorage.setItem(DEVICE_STORAGE_KEY, did);
    }

    setCookie(COOKIE_NAME, did);
    return did;
  } catch {
    return "";
  }
}
