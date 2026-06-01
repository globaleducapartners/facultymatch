import { redirect } from "next/navigation";
export default async function EducatorRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/app/faculty/${id}`);
}
