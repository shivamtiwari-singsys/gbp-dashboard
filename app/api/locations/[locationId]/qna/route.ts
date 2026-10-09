import { NextRequest, NextResponse } from "next/server";
import { listQuestions } from "@/lib/google/qna";
import { handleRouteError } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ locationId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { locationId } = await params;
    const questions = await listQuestions(`locations/${locationId}`);
    return NextResponse.json({ questions });
  } catch (error) {
    return handleRouteError(error);
  }
}
