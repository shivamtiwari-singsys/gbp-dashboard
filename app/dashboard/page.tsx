import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LocationList from "@/components/LocationList";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.tokens) redirect("/");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Your locations</h1>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Sign out
          </button>
        </form>
      </header>
      <LocationList />
    </main>
  );
}
