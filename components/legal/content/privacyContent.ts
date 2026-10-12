import { LegalSubSection } from "../LegalSection";

export interface LegalSectionData {
  number: string;
  title: string;
  intro?: string;
  paragraphs?: string[];
  list?: string[];
  subsections?: LegalSubSection[];
}

export const privacySections: LegalSectionData[] = [
  {
    number: "01",
    title: "Privacy Commitment",
    paragraphs: [
      "ConfirmRoute AI is built with privacy-by-design. We believe in providing powerful travel intelligence without compromising your personal information or collecting unnecessary data.",
    ],
  },
  {
    number: "02",
    title: "Data We Process",
    paragraphs: [
      "We process minimal operational data strictly necessary to fulfill your real-time train and journey requests:",
    ],
    list: [
      "Travel queries: Train numbers, station pairs, and journey dates submitted in chat.",
      "Technical telemetry: Anonymous session identifiers and IP addresses for burst rate limiting.",
      "Local preferences: PNR watch lists and saved searches stored locally in your browser storage.",
    ],
  },
  {
    number: "03",
    title: "Zero Prompt Storage",
    paragraphs: [
      "Your conversational prompts, personal questions, and travel plans are processed ephemerally. We do not sell, monetize, or license your chat history or search queries to advertising brokers.",
    ],
  },
  {
    number: "04",
    title: "Security & Encryption",
    paragraphs: [
      "All network communications with ConfirmRoute are encrypted in transit using industry-standard TLS 1.3 encryption. Backend microservice communications are secured via authenticated token gateways.",
    ],
  },
];
