/**
 * Email Anti-Abuse & Normalization Utilities
 */

const COMMON_DISPOSABLE = new Set([
  "mailinator.com",
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "throwawaymail.com",
]);

export function extractEmailDomain(email: string): string {
  if (!email || typeof email !== "string") return "";
  const parts = email.trim().toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== "string" || email.length > 254) return false;
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(email.trim());
}

export function getCanonicalEmail(email: string): string {
  if (!email || typeof email !== "string") return "";
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return trimmed;

  let local = trimmed.slice(0, atIndex);
  let domain = trimmed.slice(atIndex + 1);

  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.split("+")[0];
    local = local.replace(/\./g, "");
    domain = "gmail.com";
  } else {
    local = local.split("+")[0];
  }

  return `${local}@${domain}`;
}

export function isDisposableEmail(emailOrDomain: string): boolean {
  if (!emailOrDomain) return false;
  const domain = emailOrDomain.includes("@")
    ? extractEmailDomain(emailOrDomain)
    : emailOrDomain.trim().toLowerCase();

  return COMMON_DISPOSABLE.has(domain);
}

export interface EmailIntegrityResult {
  allowed: boolean;
  canonicalEmail: string;
  domain: string;
  reason?: string;
}

export function validateEmailIntegrity(rawEmail: string): EmailIntegrityResult {
  if (!isValidEmailFormat(rawEmail)) {
    return {
      allowed: false,
      canonicalEmail: rawEmail || "",
      domain: "",
      reason: "Please enter a valid email address.",
    };
  }

  const domain = extractEmailDomain(rawEmail);
  const canonicalEmail = getCanonicalEmail(rawEmail);

  if (isDisposableEmail(domain)) {
    return {
      allowed: false,
      canonicalEmail,
      domain,
      reason: "Temporary or disposable email addresses are not permitted.",
    };
  }

  return {
    allowed: true,
    canonicalEmail,
    domain,
  };
}
