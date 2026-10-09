import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "You declined to grant access to your Google Business Profile.",
  invalid_state: "Your sign-in session expired or was invalid. Please try again.",
  token_exchange_failed: "Something went wrong talking to Google. Please try again.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session.tokens) redirect("/dashboard");

  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] ?? "Sign-in failed. Please try again." : null;

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-2xl font-semibold tracking-tight">GBP Manager</h1>
        <p className="mt-2 text-sm text-zinc-500">
          A dummy app for managing your Google Business Profile — info, posts,
          reviews and Q&amp;A.
        </p>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <a
          href="/api/auth/google/login"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Sign in with Google
        </a>

        <p className="mt-4 text-xs text-zinc-400">
          Requires a Google Cloud project with the Business Profile APIs
          enabled. See the README for setup steps.
        </p>
      </div>
    </main>
  );
}
