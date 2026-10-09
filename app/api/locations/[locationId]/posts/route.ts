import { NextRequest, NextResponse } from "next/server";
import { listPosts, createPost } from "@/lib/google/posts";
import { handleRouteError } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ locationId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { locationId } = await params;
    const posts = await listPosts(`locations/${locationId}`);
    return NextResponse.json({ posts });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { locationId } = await params;
    const body = await req.json();
    if (!body.summary || typeof body.summary !== "string") {
      return NextResponse.json(
        { error: "bad_request", message: "summary is required." },
        { status: 400 }
      );
    }
    const topicType = body.topicType === "EVENT" || body.topicType === "OFFER"
      ? body.topicType
      : "STANDARD";

    const post = await createPost(`locations/${locationId}`, { summary: body.summary, topicType });
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
