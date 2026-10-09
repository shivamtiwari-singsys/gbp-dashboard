import { googleApiJson } from "@/lib/google/client";
import { getStore, type MockQuestion, type MockAnswer } from "@/lib/google/mock-data";

// The Q&A API has historically had looser access requirements than Posts
// and Reviews, but we default it to mocked too since access tiers change
// over time. Set GBP_MOCK_QNA=false once you've confirmed your project can
// call mybusinessqanda.googleapis.com.
const MOCK = process.env.GBP_MOCK_QNA !== "false";

export type { MockQuestion as Question, MockAnswer as Answer };

export async function listQuestions(locationName: string): Promise<MockQuestion[]> {
  if (MOCK) return getStore(locationName).questions;

  const data = await googleApiJson<{ questions?: MockQuestion[] }>(
    `https://mybusinessqanda.googleapis.com/v1/${locationName}/questions`
  );
  return data.questions ?? [];
}

export async function answerQuestion(
  locationName: string,
  questionId: string,
  text: string
): Promise<MockAnswer> {
  if (MOCK) {
    const store = getStore(locationName);
    const question = store.questions.find((q) => q.name.endsWith(`/questions/${questionId}`));
    if (!question) throw new Error(`Question ${questionId} not found`);
    const answer: MockAnswer = {
      name: `${question.name}/answers/mock-${Date.now()}`,
      text,
      createTime: new Date().toISOString(),
      author: { displayName: "Business owner" },
    };
    question.topAnswers.unshift(answer);
    return answer;
  }

  return googleApiJson<MockAnswer>(
    `https://mybusinessqanda.googleapis.com/v1/${locationName}/questions/${questionId}/answers:createAnswer`,
    { method: "POST", body: JSON.stringify({ answer: { text } }) }
  );
}
