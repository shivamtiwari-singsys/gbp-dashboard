import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/google/qna";
import { handleRouteError } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ locationId: string; questionId: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { locationId, questionId } = await params;
    const body = await req.json();
    if (!body.text || typeof body.text !== "string") {
      return NextResponse.json(
        { error: "bad_request", message: "text is required." },
        { status: 400 }
      );
    }

    const answer = await answerQuestion(`locations/${locationId}`, questionId, body.text);
    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
