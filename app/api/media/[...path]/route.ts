import { NextRequest, NextResponse } from "next/server";
import { RAILWAY_GATEWAY_URL } from "@/src/config/urls.config";

export const dynamic = "force-dynamic";

/**
 * Media Proxy Route
 * Forwards train and station photograph queries from the public showcase to
 * the private ConfirmRoute core media service or CDN.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const subpath = Array.isArray(resolvedParams?.path)
      ? resolvedParams.path.join("/")
      : "";

    if (!subpath) {
      return new NextResponse("Invalid media path", { status: 400 });
    }

    const backendUrl = (
      process.env.RAILWAY_GATEWAY_URL ||
      process.env.BACKEND_API_URL ||
      RAILWAY_GATEWAY_URL ||
      ""
    )
      .trim()
      .replace(/\/+$/, "");

    if (!backendUrl) {
      return new NextResponse("Gateway backend not configured", { status: 503 });
    }

    const targetUrl = `${backendUrl}/api/media/${subpath}${req.nextUrl.search}`;

    const res = await fetch(targetUrl, {
      headers: {
        Accept: "image/webp,image/avif,image/*,*/*;q=0.8",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return new NextResponse("Media not found", { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/webp";
    const body = await res.arrayBuffer();

    return new NextResponse(Buffer.from(body), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
        "X-Showcase-Media-Proxy": "HIT",
      },
    });
  } catch (err) {
    console.error("[MediaProxy] Error fetching media:", err);
    return new NextResponse("Internal Server Error loading media", { status: 500 });
  }
}
