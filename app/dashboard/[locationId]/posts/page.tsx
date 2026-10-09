import PostsPanel from "@/components/PostsPanel";

export default async function PostsPage({
  params,
}: PageProps<"/dashboard/[locationId]/posts">) {
  const { locationId } = await params;
  return <PostsPanel locationId={locationId} />;
}
