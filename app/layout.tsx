import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getBrandName } from "@/src/config/brand.config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.confirmroute.com";

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${getBrandName({ withSymbol: false, withAi: true })} — Live Indian Railways Search, Seat Availability & MCP`,
    template: `%s | ${getBrandName({ withSymbol: false, withAi: true })}`,
  },
  description:
    "Increase your chance of getting confirmed train tickets with 2-leg connecting routes, waitlist confirmation predictions, live train delays, and vacant chart berths with ConfirmRoute AI.",
  keywords: [
    "Indian Railways",
    "IRCTC",
    "ConfirmRoute",
    "Confirm Train Ticket",
    "Where is My Train",
    "PNR Status",
    "Live Train Running Status",
    "Seat Availability",
    "Connecting Trains",
    "Model Context Protocol",
  ],
  authors: [{ name: "ConfirmRoute AI Team", url: siteUrl }],
  creator: "ConfirmRoute AI",
  publisher: "ConfirmRoute AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ConfirmRoute AI",
    url: siteUrl,
    description:
      "Search Indian Railways trains, live seat availability, 2-leg break journey routes, and real-time running status using AI and Model Context Protocol.",
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };

  const safeJsonLd = JSON.stringify(jsonLd)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd }}
        />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
