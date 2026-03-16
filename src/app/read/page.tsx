import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getAccumulatedReading, getAccumulatedChapters, getTodayReading, getTodayChapters } from "@/lib/biblePlan";
import CompleteButton from "./CompleteButton";

export default async function ReadPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user?.planStartDate) {
    redirect("/settings");
  }

  const startedAt = new Date(user.planStartDate);
  const today = new Date();
  const startMidnight = new Date(startedAt.getFullYear(), startedAt.getMonth(), startedAt.getDate());
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffTime = Math.abs(todayMidnight.getTime() - startMidnight.getTime());
  const daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // 완료한 day 번호 목록 가져오기
  const completedLogs = await prisma.readingLog.findMany({
    where: { userId: user.id },
    select: { dayNumber: true }
  });
  const completedDayNumbers = completedLogs.map(l => l.dayNumber);

  // 밀린 일수
  const unreadDays: number[] = [];
  for (let d = 1; d <= daysDiff; d++) {
    if (!completedDayNumbers.includes(d)) unreadDays.push(d);
  }

  const allCompleted = unreadDays.length === 0;

  // 모두 완료일 때: 오늘 분량만 다시 보여주기 / 미완료일 때: 누적 분량
  let readingTitle: string;
  let chapters;

  if (allCompleted) {
    readingTitle = getTodayReading(daysDiff, user.duration, user.method);
    chapters = getTodayChapters(daysDiff, user.duration, user.method);
  } else {
    readingTitle = getAccumulatedReading(daysDiff, completedDayNumbers, user.duration, user.method);
    chapters = getAccumulatedChapters(daysDiff, completedDayNumbers, user.duration, user.method);
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      {/* 상단 네비게이션 */}
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
            ← 대시보드
          </Link>
          <span className="text-sm text-indigo-400 font-semibold">{daysDiff}일째</span>
        </div>
      </div>

      {/* 분량 헤더 */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white">
            {allCompleted ? "오늘의 분량 (다시 읽기)" : "읽어야 할 분량"}
          </h1>
          {!allCompleted && unreadDays.length > 1 && (
            <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/30">
              {unreadDays.length}일치 누적
            </span>
          )}
        </div>
        <p className="text-indigo-400 font-medium">{readingTitle}</p>
      </div>

      {/* 본문 영역 */}
      <div className={`max-w-3xl mx-auto px-6 ${allCompleted ? "pb-12" : "pb-28"}`}>
        {chapters.map((ch, chIdx) => (
          <div key={chIdx} className="mb-12">
            {/* 장 제목 */}
            <div className="sticky top-[65px] z-[5] bg-zinc-950/95 backdrop-blur-sm py-3 border-b border-zinc-800 mb-6">
              <h2 className="text-lg font-bold text-white">
                <span className="text-indigo-400">{ch.bookName}</span> {ch.chapter}장
              </h2>
            </div>

            {/* 절 목록 */}
            <div className="space-y-3">
              {ch.verses.map((verse, vIdx) => {
                const verseNum = verse.reference.split(":")[1];
                return (
                  <p key={vIdx} className="text-zinc-300 leading-relaxed text-[15px]">
                    <span className="text-indigo-500/70 text-xs font-mono mr-2 select-none">{verseNum}</span>
                    {verse.text}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 고정 완료 버튼 (미완료 분량이 있을 때만) */}
      {!allCompleted && (
        <CompleteButton dayNumbers={unreadDays} />
      )}
    </div>
  );
}
