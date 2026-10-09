// In-memory mock data for Posts, Reviews and Q&A — these three additionally
// require Google's separate "Standard" API access tier on top of Basic
// Access (see accounts.ts / locations.ts for the Basic Access mocks). This
// lets the UI and API routes be exercised end-to-end without that
// approval. State resets whenever the dev server restarts — that's fine
// for a dummy project; swap in a real database if you need it to persist.

export interface MockPost {
  name: string;
  summary: string;
  languageCode: string;
  topicType: "STANDARD" | "EVENT" | "OFFER";
  createTime: string;
  state: "LIVE" | "REJECTED" | "PENDING";
}

export interface MockReview {
  name: string;
  reviewer: { displayName: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  reviewReply?: { comment: string; updateTime: string };
}

export interface MockAnswer {
  name: string;
  text: string;
  createTime: string;
  author: { displayName: string };
}

export interface MockQuestion {
  name: string;
  text: string;
  createTime: string;
  topAnswers: MockAnswer[];
}

interface LocationMockState {
  posts: MockPost[];
  reviews: MockReview[];
  questions: MockQuestion[];
}

const store = new Map<string, LocationMockState>();

function seed(locationName: string): LocationMockState {
  const now = Date.now();
  const iso = (daysAgo: number) => new Date(now - daysAgo * 86_400_000).toISOString();

  return {
    posts: [
      {
        name: `${locationName}/localPosts/seed-1`,
        summary: "We're open this weekend with extended hours — stop by!",
        languageCode: "en",
        topicType: "STANDARD",
        createTime: iso(2),
        state: "LIVE",
      },
    ],
    reviews: [
      {
        name: `${locationName}/reviews/seed-1`,
        reviewer: { displayName: "Priya S." },
        starRating: "FIVE",
        comment: "Great service, will come back again!",
        createTime: iso(5),
      },
      {
        name: `${locationName}/reviews/seed-2`,
        reviewer: { displayName: "Amit K." },
        starRating: "THREE",
        comment: "Decent experience, parking was a bit tough to find.",
        createTime: iso(10),
      },
    ],
    questions: [
      {
        name: `${locationName}/questions/seed-1`,
        text: "Do you accept walk-ins or is it appointment only?",
        createTime: iso(7),
        topAnswers: [],
      },
    ],
  };
}

export function getStore(locationName: string): LocationMockState {
  let state = store.get(locationName);
  if (!state) {
    state = seed(locationName);
    store.set(locationName, state);
  }
  return state;
}
