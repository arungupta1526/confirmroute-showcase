import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Public Health Check Endpoint for AWS Elastic Beanstalk
 * Targeted by ALB Target Group on /api/health
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "confirmroute-showcase",
      platform: "AWS Elastic Beanstalk",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    },
    { status: 200 }
  );
}
