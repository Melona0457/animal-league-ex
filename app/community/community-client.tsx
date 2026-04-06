"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  createCommunityComment,
  formatCommunityTime,
  getCommunityComments,
  type CommunityComment,
} from "../_lib/community-comments";
import { getCurrentAuthProfile } from "../_lib/mock-auth";

type CommunityClientProps = {
  schoolId: string;
  schoolName: string;
};

export function CommunityClient({
  schoolId,
  schoolName,
}: CommunityClientProps) {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("벚꽃러");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [revealSchool, setRevealSchool] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      void (async () => {
        const profile = await getCurrentAuthProfile();
        if (profile?.nickname) {
          setNickname(profile.nickname);
        }
        setComments(await getCommunityComments());
      })();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await createCommunityComment({
      content,
      nickname,
      schoolId,
      isAnonymous,
      revealSchool,
    });

    if (!result.ok) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    setComments(result.comments);
    setContent("");
    setIsAnonymous(true);
    setRevealSchool(false);
    setError("");
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-background px-4 py-5 text-stone-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-rose-500">
                COMMUNITY
              </p>
              <h1 className="mt-1 text-2xl font-bold">실시간 댓글 커뮤니티</h1>
              <p className="mt-2 text-sm text-stone-600">
                전원 익명으로 댓글을 남기고, 원하면 소속 대학만 함께 공개할 수 있어요.
              </p>
            </div>
            <Link
              href={`/main?schoolId=${schoolId}`}
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
            >
              메인으로
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">현재 접속 학교</p>
          <p className="mt-1 text-lg font-semibold">{schoolName}</p>
          <p className="mt-2 text-sm text-stone-500">
            내 학교 댓글은 리스트에서 살짝 강조색으로 보여요.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="community-content"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                한줄 댓글
              </label>
              <textarea
                id="community-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="시험기간 한마디, 응원, 도발 멘트를 남겨보세요."
                className="min-h-28 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                maxLength={120}
              />
              <p className="mt-2 text-right text-xs text-stone-400">
                {content.length}/120
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(event) => setIsAnonymous(event.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-rose-500 focus:ring-rose-200"
                />
                익명으로 작성
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={revealSchool}
                  onChange={(event) => setRevealSchool(event.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-rose-500 focus:ring-rose-200"
                />
                소속 대학 공개
              </label>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
              현재 표시 방식:{" "}
              <span className="font-semibold text-stone-800">
                {isAnonymous ? "익명" : nickname}
                {revealSchool ? ` · ${schoolName}` : ""}
              </span>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white"
            >
              {isSubmitting ? "등록 중..." : "익명 댓글 등록"}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <ul className="divide-y divide-stone-200">
            {comments.map((comment) => {
              const isMySchool = comment.schoolId === schoolId;

              return (
                <li
                  key={comment.id}
                  className={`p-4 ${
                    isMySchool ? "bg-rose-50/80" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">
                        {comment.isAnonymous ? "익명" : comment.nickname}
                        {comment.revealSchool ? ` · ${comment.schoolName}` : ""}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-stone-600">
                        {comment.content}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {isMySchool ? (
                        <span className="inline-block rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-600">
                          내 학교
                        </span>
                      ) : null}
                      <p className="mt-2 text-xs text-stone-400">
                        {formatCommunityTime(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
