import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import DashboardTabs from "@/components/DashboardTabs";

export default async function LocationLayout({
  children,
  params,
}: LayoutProps<"/dashboard/[locationId]">) {
  const session = await getSession();
  if (!session.tokens) redirect("/");

  const { locationId } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-8">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← All locations
      </Link>
      <DashboardTabs locationId={locationId} />
      <div className="mt-6">{children}</div>
    </main>
  );
}
