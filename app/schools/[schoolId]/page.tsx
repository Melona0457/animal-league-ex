import { SchoolDetailClient } from "./school-detail-client";

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

  return (
    <SchoolDetailClient
      schoolId={routeParams.schoolId}
      fromSchoolId={query.fromSchoolId ?? "school-044"}
      shakenCount={Number(query.shaken ?? "0")}
    />
  );
}
