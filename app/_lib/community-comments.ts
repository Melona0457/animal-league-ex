"use client";

import { getSchoolName } from "./mock-auth";
import { supabase } from "./supabase";

export type CommunityComment = {
  id: string;
  content: string;
  nickname: string;
  schoolId: string;
  schoolName: string;
  isAnonymous: boolean;
  revealSchool: boolean;
  createdAt: string;
};

const DEFAULT_COMMENTS: CommunityComment[] = [
  {
    id: "comment-1",
    content: "오늘도 벚꽃 붙이고 갑니다.",
    nickname: "벚꽃수호대",
    schoolId: "school-044",
    schoolName: getSchoolName("school-044"),
    isAnonymous: true,
    revealSchool: true,
    createdAt: "2026-04-06T11:20:00+09:00",
  },
  {
    id: "comment-2",
    content: "시험은 망해도 랭킹은 못 참지.",
    nickname: "봄학기올인",
    schoolId: "school-006",
    schoolName: getSchoolName("school-006"),
    isAnonymous: false,
    revealSchool: true,
    createdAt: "2026-04-06T11:28:00+09:00",
  },
  {
    id: "comment-3",
    content: "벚꽃만 만개하면 공부도 잘될 것 같은 기분.",
    nickname: "도서관산책러",
    schoolId: "school-033",
    schoolName: getSchoolName("school-033"),
    isAnonymous: true,
    revealSchool: false,
    createdAt: "2026-04-06T11:34:00+09:00",
  },
];

type CommentRow = {
  id: string;
  content: string;
  nickname: string | null;
  school_id: string;
  school_name: string;
  is_anonymous: boolean | null;
  reveal_school: boolean;
  created_at: string;
};

function mapRows(rows: CommentRow[]) {
  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    nickname: row.nickname ?? "벚꽃러",
    schoolId: row.school_id,
    schoolName: row.school_name,
    isAnonymous: row.is_anonymous ?? true,
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
  nickname: string;
  schoolId: string;
  isAnonymous: boolean;
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
    nickname: input.nickname.trim() || "벚꽃러",
    school_id: input.schoolId,
    school_name: schoolName,
    is_anonymous: input.isAnonymous,
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
