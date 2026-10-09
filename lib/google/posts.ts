import { googleApiJson } from "@/lib/google/client";
import { getStore, type MockPost } from "@/lib/google/mock-data";

// Google restricted the Local Posts endpoints (My Business API v4) to apps
// with approved "Standard" API access starting in 2024. Basic access
// (what you get by default) returns PERMISSION_DENIED here. Set
// GBP_MOCK_POSTS=false once your project has that approval.
const MOCK = process.env.GBP_MOCK_POSTS !== "false";

export type { MockPost as Post };

export async function listPosts(locationName: string): Promise<MockPost[]> {
  if (MOCK) return getStore(locationName).posts;

  const data = await googleApiJson<{ localPosts?: MockPost[] }>(
    `https://mybusiness.googleapis.com/v4/${locationName}/localPosts`
  );
  return data.localPosts ?? [];
}

export async function createPost(
  locationName: string,
  input: { summary: string; topicType: MockPost["topicType"] }
): Promise<MockPost> {
  if (MOCK) {
    const post: MockPost = {
      name: `${locationName}/localPosts/mock-${Date.now()}`,
      summary: input.summary,
      languageCode: "en",
      topicType: input.topicType,
      createTime: new Date().toISOString(),
      state: "LIVE",
    };
    getStore(locationName).posts.unshift(post);
    return post;
  }

  return googleApiJson<MockPost>(
    `https://mybusiness.googleapis.com/v4/${locationName}/localPosts`,
    {
      method: "POST",
      body: JSON.stringify({
        languageCode: "en",
        summary: input.summary,
        topicType: input.topicType,
      }),
    }
  );
}
