import { SchoolDetailClient } from "./school-detail-client";
import { resolveSchoolIdFromRequest } from "../../_lib/selected-school-server";
import { redirect } from "next/navigation";

type SchoolDetailPageProps = {
  params: Promise<{
    schoolId: string;
  }>;
  searchParams: Promise<{
    fromSchoolId?: string;
    shaken?: string;
  }>;
};

export default async function SchoolDetailPage({
  params,
  searchParams,
}: SchoolDetailPageProps) {
  const routeParams = await params;
  const query = await searchParams;
  const fromSchoolId = await resolveSchoolIdFromRequest(query.fromSchoolId);

  if (!fromSchoolId) {
    redirect("/select-school");
  }

  return (
    <SchoolDetailClient
      schoolId={routeParams.schoolId}
      fromSchoolId={fromSchoolId}
      shakenCount={Number(query.shaken ?? "0")}
    />
  );
}
