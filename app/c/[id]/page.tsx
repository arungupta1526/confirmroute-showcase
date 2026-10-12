import { ChatWindow } from "@/components/ChatWindow";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ConfirmRoute AI — Railway Intelligence Chat",
  description:
    "Live Indian Railways AI chat assistant: waitlist confirmation probability, 2-leg connecting journeys, live running delays, and post-charting vacant berths.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="fixed inset-0 h-full h-[100dvh] w-full bg-slate-950 overflow-hidden overscroll-none">
      <ChatWindow initialSessionId={id} />
    </main>
  );
}
