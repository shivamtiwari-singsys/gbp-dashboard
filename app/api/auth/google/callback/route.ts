import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google/oauth";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const expectedState = req.cookies.get("gbp_oauth_state")?.value;

  const redirectWithError = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/?error=${reason}`, req.url));
    res.cookies.delete("gbp_oauth_state");
    return res;
  };

  if (error) return redirectWithError(error);
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithError("invalid_state");
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const session = await getSession();
    session.tokens = tokens;
    await session.save();
  } catch (err) {
    console.error("OAuth callback failed:", err);
    return redirectWithError("token_exchange_failed");
  }

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.delete("gbp_oauth_state");
  return res;
}
