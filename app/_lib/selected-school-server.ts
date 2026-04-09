import { cookies } from "next/headers";
import { SCHOOL_CATALOG } from "./school-catalog";
import { SELECTED_SCHOOL_COOKIE_KEY } from "./selected-school-constants";

function isKnownSchoolId(schoolId: string | null | undefined): schoolId is string {
  if (!schoolId) {
    return false;
  }

  return SCHOOL_CATALOG.some((school) => school.id === schoolId);
}

export async function resolveSchoolIdFromRequest(
  schoolIdFromQuery?: string | null,
) {
  if (isKnownSchoolId(schoolIdFromQuery)) {
    return schoolIdFromQuery;
  }

  const cookieStore = await cookies();
  const schoolIdFromCookie = cookieStore.get(SELECTED_SCHOOL_COOKIE_KEY)?.value;

  if (isKnownSchoolId(schoolIdFromCookie)) {
    return schoolIdFromCookie;
  }

  return null;
}

