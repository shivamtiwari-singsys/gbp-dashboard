"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/google/posts";

const TOPIC_TYPES = ["STANDARD", "EVENT", "OFFER"] as const;

export default function PostsPanel({ locationId }: { locationId: string }) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [topicType, setTopicType] = useState<(typeof TOPIC_TYPES)[number]>("STANDARD");
  const [posting, setPosting] = useState(false);

  async function fetchPosts(): Promise<Post[]> {
    const res = await fetch(`/api/locations/${locationId}/posts`);
    if (res.status === 401) {
      router.push("/");
      return [];
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed to load posts.");
    return data.posts;
  }

  async function load() {
    setPosts(await fetchPosts());
  }

  useEffect(() => {
    let cancelled = false;
    fetchPosts()
      .then((result) => {
        if (!cancelled) setPosts(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/locations/${locationId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, topicType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to create post.");
      setSummary("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5"
      >
        <h2 className="text-sm font-medium text-zinc-700">New post</h2>
        <textarea
          className="input"
          rows={3}
          placeholder="What's new at your business?"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <select
            className="input w-40"
            value={topicType}
            onChange={(e) => setTopicType(e.target.value as (typeof TOPIC_TYPES)[number])}
          >
            {TOPIC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={posting}
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {posting ? "Posting…" : "Publish post"}
          </button>
        </div>
      </form>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {!posts ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-zinc-500">No posts yet.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.name} className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{post.topicType}</span>
                <span>{new Date(post.createTime).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-800">{post.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
