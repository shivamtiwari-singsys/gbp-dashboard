import LocationInfoForm from "@/components/LocationInfoForm";

export default async function InfoPage({
  params,
}: PageProps<"/dashboard/[locationId]/info">) {
  const { locationId } = await params;
  return <LocationInfoForm locationId={locationId} />;
}
