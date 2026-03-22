import { redirect } from "next/navigation";
export default function EducatorRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/app/faculty/${params.id}`);
}
