/**
 * Policy & Legal Document Modification Dates
 * Central registry for public policy and legal document effective dates.
 */

export const POLICY_DATES = {
  terms: "October 8, 2026",
  privacy: "October 4, 2026",
  about: "October 4, 2026",
  contact: "October 4, 2026",
  defaultEffectiveDate: "October 4, 2026",
} as const;

export type PolicyKey = keyof typeof POLICY_DATES;
