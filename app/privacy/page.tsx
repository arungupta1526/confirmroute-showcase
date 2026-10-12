import React from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LegalSection } from "@/components/legal/LegalSection";
import { privacySections } from "@/components/legal/content/privacyContent";

export const metadata = {
  title: "Privacy Policy | ConfirmRoute AI",
  description:
    "Learn how ConfirmRoute protects personal data, enforces zero prompt leakage into billing ledgers, and securely handles traveler inquiries and MCP API keys.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      policyKey="privacy"
      title="Privacy Policy"
      subtitle="Our commitment to safeguarding traveler data, maintaining zero prompt leakage, and adhering to the Digital Personal Data Protection (DPDP) Act."
    >
      {/* Security Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Prompt Leakage Standard</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your conversational inquiries, personal travel prompts, and PNR inputs are never written to permanent billing ledgers or sold to third-party data brokers.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
            <Lock className="w-4 h-4" />
            <span>Cryptographically Hashed Credentials</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            MCP personal API keys are cryptographically hashed using SHA-256 before storage. Raw keys are never retained on our servers.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {privacySections.map((section) => (
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
