"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@/lib/google/reviews";
import type { Question } from "@/lib/google/qna";

const STAR_COUNT: Record<Review["starRating"], number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

function idFromName(name: string): string {
  return name.split("/").pop()!;
}

export default function EngagementPanel({ locationId }: { locationId: string }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchAll(): Promise<{ reviews: Review[]; questions: Question[] } | null> {
    const [reviewsRes, qnaRes] = await Promise.all([
      fetch(`/api/locations/${locationId}/reviews`),
      fetch(`/api/locations/${locationId}/qna`),
    ]);
    if (reviewsRes.status === 401 || qnaRes.status === 401) {
      router.push("/");
      return null;
    }
    const reviewsData = await reviewsRes.json();
    const qnaData = await qnaRes.json();
    if (!reviewsRes.ok) throw new Error(reviewsData.message ?? "Failed to load reviews.");
    if (!qnaRes.ok) throw new Error(qnaData.message ?? "Failed to load questions.");
    return { reviews: reviewsData.reviews, questions: qnaData.questions };
  }

  async function loadAll() {
    const result = await fetchAll();
    if (result) {
      setReviews(result.reviews);
      setQuestions(result.questions);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetchAll()
      .then((result) => {
        if (cancelled || !result) return;
        setReviews(result.reviews);
        setQuestions(result.questions);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  async function submitReply(reviewId: string, comment: string) {
    const res = await fetch(`/api/locations/${locationId}/reviews/${reviewId}/reply`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed to reply.");
    await loadAll();
  }

  async function submitAnswer(questionId: string, text: string) {
    const res = await fetch(`/api/locations/${locationId}/qna/${questionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed to answer.");
    await loadAll();
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-700">Reviews</h2>
        {!reviews ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-zinc-500">No reviews yet.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <ReviewItem key={review.name} review={review} onReply={submitReply} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-700">Questions &amp; answers</h2>
        {!questions ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : questions.length === 0 ? (
          <p className="text-sm text-zinc-500">No questions yet.</p>
        ) : (
          <ul className="space-y-3">
            {questions.map((question) => (
              <QuestionItem key={question.name} question={question} onAnswer={submitAnswer} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ReviewItem({
  review,
  onReply,
}: {
  review: Review;
  onReply: (reviewId: string, comment: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onReply(idFromName(review.name), draft);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm">{review.reviewer.displayName}</p>
        <span className="text-amber-500 text-sm">
          {"★".repeat(STAR_COUNT[review.starRating])}
          {"☆".repeat(5 - STAR_COUNT[review.starRating])}
        </span>
      </div>
      {review.comment && <p className="mt-2 text-sm text-zinc-700">{review.comment}</p>}

      {review.reviewReply ? (
        <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm">
          <p className="text-xs font-medium text-zinc-500">Your reply</p>
          <p className="mt-1 text-zinc-700">{review.reviewReply.comment}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            className="input"
            placeholder="Write a reply…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            Reply
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </li>
  );
}

function QuestionItem({
  question,
  onAnswer,
}: {
  question: Question;
  onAnswer: (questionId: string, text: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAnswer(idFromName(question.name), draft);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-800">{question.text}</p>

      {question.topAnswers.length > 0 && (
        <ul className="mt-3 space-y-2">
          {question.topAnswers.map((answer) => (
            <li key={answer.name} className="rounded-lg bg-zinc-50 p-3 text-sm">
              <p className="text-xs font-medium text-zinc-500">{answer.author.displayName}</p>
              <p className="mt-1 text-zinc-700">{answer.text}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          className="input"
          placeholder="Write an answer…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          Answer
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </li>
  );
}
