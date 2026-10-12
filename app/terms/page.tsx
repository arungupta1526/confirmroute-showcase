import React from "react";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LegalSection } from "@/components/legal/LegalSection";
import { termsSections } from "@/components/legal/content/termsContent";

export const metadata = {
  title: "Terms of Service | ConfirmRoute AI",
  description:
    "Comprehensive Terms of Service, user eligibility, consumer subscription rules, developer API access terms, and railway operational disclaimers for ConfirmRoute AI.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      policyKey="terms"
      title="Terms of Service"
      subtitle="Please read these Terms carefully before using ConfirmRoute AI traveler services, subscriptions, or developer MCP tools."
    >
      <div className="space-y-6">
        {termsSections.map((section) => (
          <LegalSection
            key={section.number}
            number={section.number}
            title={section.title}
            intro={section.intro}
            paragraphs={section.paragraphs}
            list={section.list}
            subsections={section.subsections}
          />
        ))}
      </div>
    </LegalPageShell>
  );
}
