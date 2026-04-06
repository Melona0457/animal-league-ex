import { getSchoolById } from "../_lib/mock-data";
import { CommunityClient } from "./community-client";

type CommunityPageProps = {
  searchParams: Promise<{
    schoolId?: string;
  }>;
};

export default async function CommunityPage({
  searchParams,
}: CommunityPageProps) {
  const params = await searchParams;
  const school =
    getSchoolById(params.schoolId ?? "school-044") ?? getSchoolById("school-044");

  if (!school) {
    return null;
  }

  return <CommunityClient schoolId={school.id} schoolName={school.name} />;
}
