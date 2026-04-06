"use client";

import { getSchoolName } from "./mock-auth";

export type CommunityComment = {
  id: string;
  content: string;
  schoolId: string;
  schoolName: string;
  revealSchool: boolean;
  createdAt: string;
};

const STORAGE_KEY = "blossom-community-comments";

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

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getCommunityComments() {
  if (!canUseStorage()) {
    return DEFAULT_COMMENTS;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMMENTS));
    return DEFAULT_COMMENTS;
  }

  try {
    const comments = JSON.parse(saved) as CommunityComment[];
    return comments.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMMENTS));
    return DEFAULT_COMMENTS;
  }
}

export function createCommunityComment(input: {
  content: string;
  schoolId: string;
  revealSchool: boolean;
}) {
  const comments = getCommunityComments();
  const trimmedContent = input.content.trim();

  if (!trimmedContent) {
    return { ok: false as const, message: "댓글 내용을 입력해주세요." };
  }

  const nextComment: CommunityComment = {
    id: `comment-${Date.now()}`,
    content: trimmedContent,
    schoolId: input.schoolId,
    schoolName: getSchoolName(input.schoolId),
    revealSchool: input.revealSchool,
    createdAt: new Date().toISOString(),
  };

  const nextComments = [nextComment, ...comments].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextComments));
  }

  return { ok: true as const, comments: nextComments };
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
