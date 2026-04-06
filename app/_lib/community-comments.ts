"use client";

import { getSchoolName } from "./mock-auth";
import { supabase } from "./supabase";

export type CommunityComment = {
  id: string;
  content: string;
  schoolId: string;
  schoolName: string;
  revealSchool: boolean;
  createdAt: string;
};

const DEFAULT_COMMENTS: CommunityComment[] = [
  {
    id: "comment-1",
    content: "오늘도 벚꽃 붙이고 갑니다.",
    schoolId: "school-044",
    schoolName: getSchoolName("school-044"),
    revealSchool: true,
    createdAt: "2026-04-06T11:20:00+09:00",
  },
  {
    id: "comment-2",
    content: "시험은 망해도 랭킹은 못 참지.",
    schoolId: "school-006",
    schoolName: getSchoolName("school-006"),
    revealSchool: true,
    createdAt: "2026-04-06T11:28:00+09:00",
  },
  {
    id: "comment-3",
    content: "벚꽃만 만개하면 공부도 잘될 것 같은 기분.",
    schoolId: "school-033",
    schoolName: getSchoolName("school-033"),
    revealSchool: false,
    createdAt: "2026-04-06T11:34:00+09:00",
  },
];

type CommentRow = {
  id: string;
  content: string;
  school_id: string;
  school_name: string;
  reveal_school: boolean;
  created_at: string;
};

function mapRows(rows: CommentRow[]) {
  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    schoolId: row.school_id,
    schoolName: row.school_name,
    revealSchool: row.reveal_school,
    createdAt: row.created_at,
  }));
}

export async function getCommunityComments() {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return DEFAULT_COMMENTS;
  }

  return mapRows(data as CommentRow[]);
}

export async function createCommunityComment(input: {
  content: string;
  schoolId: string;
  revealSchool: boolean;
}) {
  const trimmedContent = input.content.trim();

  if (!trimmedContent) {
    return { ok: false as const, message: "댓글 내용을 입력해주세요." };
  }

  const schoolName = getSchoolName(input.schoolId);

  const { error } = await supabase.from("comments").insert({
    id: `comment-${Date.now()}`,
    content: trimmedContent,
    school_id: input.schoolId,
    school_name: schoolName,
    reveal_school: input.revealSchool,
  });

  if (error) {
    return {
      ok: false as const,
      message: "댓글을 저장하지 못했어요. 잠시 후 다시 시도해주세요.",
    };
  }

  const comments = await getCommunityComments();

  return { ok: true as const, comments };
}

export function formatCommunityTime(createdAt: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(createdAt));
}
