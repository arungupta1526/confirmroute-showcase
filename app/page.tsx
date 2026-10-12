import { ChatWindow } from "@/components/ChatWindow";
import { LandingPage } from "@/components/landing/LandingPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ConfirmRoute AI — Indian Railways Live Intelligence & Seat Prediction",
  description:
    "Increase your chance of getting confirmed train tickets with 2-leg connecting routes, waitlist confirmation predictions, live train delays, and vacant chart berths with ConfirmRoute AI.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ConfirmRoute AI — Indian Railways Live Intelligence & Seat Prediction",
    description:
      "Increase your chance of getting confirmed train tickets with 2-leg connecting routes, waitlist confirmation predictions, live train delays, and vacant chart berths with ConfirmRoute AI.",
    url: "/",
  },
};

export default function Home() {
  const siteMode = process.env.NEXT_PUBLIC_SITE_MODE || "landing";

  if (siteMode === "app") {
    return (
      <main className="fixed inset-0 h-full h-[100dvh] w-full bg-slate-950 overflow-hidden overscroll-none">
        <ChatWindow />
      </main>
    );
  }

  return <LandingPage />;
}
