import { NextResponse } from "next/server";
import { AuthRequiredError, GoogleApiError } from "@/lib/google/client";

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof AuthRequiredError) {
    return NextResponse.json(
      { error: "auth_required", message: error.message },
      { status: 401 }
    );
  }
  if (error instanceof GoogleApiError) {
    const status = error.status >= 400 && error.status < 600 ? error.status : 502;
    return NextResponse.json(
      { error: "google_api_error", message: error.message, details: error.body },
      { status }
    );
  }
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: "internal_error", message }, { status: 500 });
}
