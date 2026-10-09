import { NextRequest, NextResponse } from "next/server";
import { replyToReview } from "@/lib/google/reviews";
import { handleRouteError } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ locationId: string; reviewId: string }> };

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { locationId, reviewId } = await params;
    const body = await req.json();
    if (!body.comment || typeof body.comment !== "string") {
      return NextResponse.json(
        { error: "bad_request", message: "comment is required." },
        { status: 400 }
      );
    }

    const review = await replyToReview(`locations/${locationId}`, reviewId, body.comment);
    return NextResponse.json({ review });
  } catch (error) {
    return handleRouteError(error);
  }
}
