import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export interface SessionData {
  tokens?: {
    accessToken: string;
    refreshToken?: string;
    /** epoch ms when accessToken expires */
    expiresAt: number;
  };
}

const password = process.env.SESSION_SECRET;
if (!password || password.length < 32) {
  throw new Error(
    "SESSION_SECRET env var must be set to a random string of at least 32 characters. See .env.local.example."
  );
}

export const sessionOptions: SessionOptions = {
  password,
  cookieName: "gbp_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
