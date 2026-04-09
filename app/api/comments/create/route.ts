import { NextResponse } from "next/server";
import { SCHOOL_CATALOG } from "../../../_lib/school-catalog";
import { getServerSupabaseClient } from "../../../_lib/supabase-server";

function getSchoolNameFromCatalog(schoolId: string) {
  return SCHOOL_CATALOG.find((school) => school.id === schoolId)?.name ?? schoolId;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      content?: string;
      nickname?: string;
      schoolId?: string;
      isAnonymous?: boolean;
      revealSchool?: boolean;
    };

    const content = body.content?.trim() ?? "";
    const schoolId = body.schoolId?.trim();

    if (!content) {
      return NextResponse.json(
        { ok: false, message: "댓글 내용을 입력해주세요." },
        { status: 400 },
      );
    }

    if (!schoolId) {
      return NextResponse.json(
        { ok: false, message: "학교 정보가 없어요. 학교를 다시 선택해주세요." },
        { status: 400 },
      );
    }

    const nickname = body.nickname?.trim() || "벚꽃러";
    const schoolName = getSchoolNameFromCatalog(schoolId);
    const isAnonymous = Boolean(body.isAnonymous);
    const revealSchool = Boolean(body.revealSchool);

    const supabase = getServerSupabaseClient();
    const { error } = await supabase.from("comments").insert({
      id: crypto.randomUUID(),
      content,
      nickname,
      school_id: schoolId,
      school_name: schoolName,
      is_anonymous: isAnonymous,
      reveal_school: revealSchool,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, message: "댓글을 저장하지 못했어요. 잠시 후 다시 시도해주세요." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "댓글을 저장하지 못했어요. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
