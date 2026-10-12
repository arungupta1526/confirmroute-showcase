import { MetadataRoute } from "next";

const DEFAULT_SITE_URL = "https://www.confirmroute.com";

export default function robots(): MetadataRoute.Robots {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/chat"],
        disallow: [
          "/c/",
          "/c",
          "/cr-control-center",
          "/cr-control-center/",
          "/admin",
          "/admin/",
          "/api/",
          "/invoices",
          "/invoices/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

