import EngagementPanel from "@/components/EngagementPanel";

export default async function EngagementPage({
  params,
}: PageProps<"/dashboard/[locationId]/engagement">) {
  const { locationId } = await params;
  return <EngagementPanel locationId={locationId} />;
}
