import { LegalSubSection } from "../LegalSection";

export interface LegalSectionData {
  number: string;
  title: string;
  intro?: string;
  paragraphs?: string[];
  list?: string[];
  subsections?: LegalSubSection[];
}

export const termsSections: LegalSectionData[] = [
  {
    number: "01",
    title: "Acceptance of Terms",
    paragraphs: [
      "By accessing or using ConfirmRoute AI, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue use of the platform.",
      "These terms apply to all visitors, users, and evaluators accessing our web application, AI chat assistant, and interactive railway widgets.",
    ],
  },
  {
    number: "02",
    title: "Use of Platform & AI Assistant",
    paragraphs: [
      "ConfirmRoute AI provides decision support, route discovery, and train telemetry assistance. The service is provided on an 'as-is' and 'as-available' basis for informational purposes.",
    ],
    list: [
      "Automated train schedule and route inquiries.",
      "Live running status tracking and delay estimations.",
      "Waitlist confirmation probabilities and 2-leg break-journey suggestions.",
      "Post-charting vacant berth visualization.",
    ],
  },
  {
    number: "03",
    title: "Non-Affiliation & Ticketing Disclaimers",
    paragraphs: [
      "ConfirmRoute is an independent software application. We are NOT affiliated with, authorized by, or officially connected with Indian Railways, IRCTC, or CRIS.",
      "ConfirmRoute does not sell, book, issue, or cancel railway tickets. All ticketing transactions must be conducted through authorized Indian Railways channels.",
    ],
  },
  {
    number: "04",
    title: "Limitation of Liability",
    paragraphs: [
      "Railway schedules, platforms, delays, and berth allocations are subject to real-time operational changes by railway authorities. While we strive for accuracy, ConfirmRoute is not liable for travel delays, missed connections, or booking decisions made based on AI suggestions.",
    ],
  },
];
