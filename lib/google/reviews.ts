import { googleApiJson } from "@/lib/google/client";
import { getStore, type MockReview } from "@/lib/google/mock-data";

// Reviews (My Business API v4) are also restricted to approved "Standard"
// API access. Set GBP_MOCK_REVIEWS=false once your project has it.
const MOCK = process.env.GBP_MOCK_REVIEWS !== "false";

export type { MockReview as Review };

export async function listReviews(locationName: string): Promise<MockReview[]> {
  if (MOCK) return getStore(locationName).reviews;

  const data = await googleApiJson<{ reviews?: MockReview[] }>(
    `https://mybusiness.googleapis.com/v4/${locationName}/reviews`
  );
  return data.reviews ?? [];
}

export async function replyToReview(
  locationName: string,
  reviewId: string,
  comment: string
): Promise<MockReview> {
  if (MOCK) {
    const store = getStore(locationName);
    const review = store.reviews.find((r) => r.name.endsWith(`/reviews/${reviewId}`));
    if (!review) throw new Error(`Review ${reviewId} not found`);
    review.reviewReply = { comment, updateTime: new Date().toISOString() };
    return review;
  }

  return googleApiJson<MockReview>(
    `https://mybusiness.googleapis.com/v4/${locationName}/reviews/${reviewId}/reply`,
    { method: "PUT", body: JSON.stringify({ comment }) }
  );
}
