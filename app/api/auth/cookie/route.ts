import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, clear } = await req.json();
    const res = NextResponse.json({ ok: true });

    if (clear || !accessToken) {
      res.cookies.delete("confirmroute_auth_token");
    } else {
      res.cookies.set("confirmroute_auth_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 604800,
      });
    }

    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
