import { redirect } from "next/navigation";

export default async function LocationIndexPage({
  params,
}: PageProps<"/dashboard/[locationId]">) {
  const { locationId } = await params;
  redirect(`/dashboard/${locationId}/info`);
}
