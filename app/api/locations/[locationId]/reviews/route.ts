import { NextRequest, NextResponse } from "next/server";
import { listReviews } from "@/lib/google/reviews";
import { handleRouteError } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ locationId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { locationId } = await params;
    const reviews = await listReviews(`locations/${locationId}`);
    return NextResponse.json({ reviews });
  } catch (error) {
    return handleRouteError(error);
  }
}
