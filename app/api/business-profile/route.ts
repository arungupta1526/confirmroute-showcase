import { NextResponse } from "next/server";
import { DEFAULT_BUSINESS_PROFILE } from "@/src/lib/settings/business-profile-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ profile: DEFAULT_BUSINESS_PROFILE });
}
