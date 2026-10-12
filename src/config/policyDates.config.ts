/**
 * Policy & Legal Document Modification Dates
 * 
 * Central registry for all public policy and legal document effective dates.
 * Update these dates whenever substantive changes are made to policy terms,
 * refund rules, legal entity details, or business model specifications.
 */

export const POLICY_DATES = {
  terms: "October 8, 2026",
  privacy: "October 4, 2026",
  refund: "October 4, 2026",
  shipping: "October 4, 2026",
  developerTerms: "October 4, 2026",
  acceptableUse: "October 4, 2026",
  cookiePolicy: "October 4, 2026",
  accountDeletion: "October 4, 2026",
  about: "October 4, 2026",
  contact: "October 4, 2026",
  businessModel: "October 4, 2026",
  copyright: "October 8, 2026",
  defaultEffectiveDate: "October 4, 2026",
} as const;

export type PolicyKey = keyof typeof POLICY_DATES;
