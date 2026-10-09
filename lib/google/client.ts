import { getSession } from "@/lib/session";
import { refreshAccessToken } from "@/lib/google/oauth";

export class AuthRequiredError extends Error {
  constructor() {
    super("Not authenticated with Google. Please sign in.");
    this.name = "AuthRequiredError";
  }
}

export class GoogleApiError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string, url: string) {
    super(`Google API error ${status} for ${url}: ${body}`);
    this.name = "GoogleApiError";
    this.status = status;
    this.body = body;
  }
}

const EXPIRY_BUFFER_MS = 60_000;

/** Returns a valid access token, transparently refreshing it (and persisting
 * the refreshed token back into the session cookie) when it's near expiry. */
export async function getValidAccessToken(): Promise<string> {
  const session = await getSession();
  const tokens = session.tokens;
  if (!tokens) throw new AuthRequiredError();

  if (Date.now() < tokens.expiresAt - EXPIRY_BUFFER_MS) {
    return tokens.accessToken;
  }

  if (!tokens.refreshToken) throw new AuthRequiredError();

  const refreshed = await refreshAccessToken(tokens.refreshToken);
  session.tokens = {
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
    expiresAt: refreshed.expiresAt,
  };
  await session.save();
  return refreshed.accessToken;
}

export async function googleApiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const accessToken = await getValidAccessToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new GoogleApiError(res.status, await res.text(), url);
  }
  return res;
}

export async function googleApiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await googleApiFetch(url, init);
  // Google APIs sometimes return 200 with an empty body (e.g. some PATCHes).
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}
