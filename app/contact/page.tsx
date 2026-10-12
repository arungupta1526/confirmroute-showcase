import React from "react";
import { Mail, Clock, ShieldAlert, Sparkles, Terminal, ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata = {
  title: "Contact & Support | ConfirmRoute AI",
  description:
    "Get in touch with the ConfirmRoute team for questions, technical feedback, and hackathon project inquiries.",
};

interface ContactChannel {
  icon: React.ReactNode;
  title: string;
  email: string;
  description: string;
  sla: string;
}

const contactChannels: ContactChannel[] = [
  {
    icon: <Sparkles className="w-5 h-5 text-orange-400" />,
    title: "Traveler & General Support",
    email: "support@confirmroute.in",
    description: "Assistance with train searches, seat predictions, station queries, and AI chat features.",
    sla: "Response within 24-48 hours",
  },
  {
    icon: <Terminal className="w-5 h-5 text-sky-400" />,
    title: "Architecture & DevOps Engineering",
    email: "dev@confirmroute.in",
    description: "Inquiries regarding the AWS Elastic Beanstalk microservices architecture and API proxy integration.",
    sla: "Developer priority queue",
  },
];

export default function ContactPage() {
  return (
    <LegalPageShell
      policyKey="contact"
      title="Contact & Support"
      subtitle="Have questions about ConfirmRoute AI, our microservices architecture, or hackathon showcase? We'd love to hear from you."
      badge={
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
          <Mail className="w-3.5 h-3.5" />
          <span>Support & Community</span>
        </div>
      }
    >
      {/* Help Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-500/15 via-slate-900 to-indigo-500/10 border border-orange-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
            <Mail className="w-4 h-4 text-orange-400" />
            <span>Community & Help Desk</span>
          </div>
          <p className="text-sm font-semibold text-white">
            Need help or have suggestions for our train intelligence assistant?
          </p>
          <p className="text-xs text-slate-300">
            Reach our support desk directly via email or test our interactive AI chat.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="mailto:support@confirmroute.in"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Email: support@confirmroute.in</span>
          </a>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Launch Chat</span>
          </Link>
        </div>
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactChannels.map((channel, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60">
                {channel.icon}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{channel.title}</h2>
                <span className="text-[11px] text-slate-400 font-mono">{channel.sla}</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{channel.description}</p>
            <div className="pt-2 border-t border-slate-800/80">
              <a
                href={`mailto:${channel.email}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{channel.email}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Operating Hours & Project Context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Clock className="w-4 h-4 text-orange-400" />
            <span>Support Availability</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Monday &ndash; Saturday, 09:00 AM &ndash; 09:00 PM IST
          </p>
          <p className="text-[11px] text-slate-400">
            Automated monitoring runs 24/7 across our cloud infrastructure on AWS Elastic Beanstalk.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Hackathon Showcase Edition</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Built for #DevOpsEvolvesIndia Hackathon (TrainWithShubham).
          </p>
          <p className="text-[11px] text-slate-400">
            Showcase frontend running containerized on AWS Elastic Beanstalk with microservice gateway routing.
          </p>
        </div>
      </div>

      {/* Notice on Ticketing */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-slate-200">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Note Regarding Ticket Bookings & Cancellations</span>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          ConfirmRoute is strictly an independent software intelligence and decision support platform. We do not sell, issue, or cancel railway tickets. For official booking transactions, ticket refunds, or Tatkal booking windows, please visit the authorized IRCTC ticketing portal directly.
        </p>
      </div>
    </LegalPageShell>
  );
}
