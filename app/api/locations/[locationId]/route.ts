import { NextRequest, NextResponse } from "next/server";
import { getLocation, updateLocation, type Location } from "@/lib/google/locations";
import { handleRouteError } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ locationId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { locationId } = await params;
    const location = await getLocation(`locations/${locationId}`);
    return NextResponse.json({ location });
  } catch (error) {
    return handleRouteError(error);
  }
}

// Only these top-level fields are editable from the Info form; the request
// body is expected to only include the ones the user actually changed.
const EDITABLE_FIELDS = [
  "title",
  "phoneNumbers",
  "websiteUri",
  "profile",
  "storefrontAddress",
  "regularHours",
] as const;

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { locationId } = await params;
    const body = (await req.json()) as Partial<Location>;

    const updateMask = Object.keys(body).filter((key) =>
      (EDITABLE_FIELDS as readonly string[]).includes(key)
    );
    if (updateMask.length === 0) {
      return NextResponse.json(
        { error: "bad_request", message: "No editable fields provided." },
        { status: 400 }
      );
    }

    const location = await updateLocation(`locations/${locationId}`, body, updateMask);
    return NextResponse.json({ location });
  } catch (error) {
    return handleRouteError(error);
  }
}
