import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getAccumulatedReading, DURATION_DAYS } from "@/lib/biblePlan";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  let daysDiff = 0;
  let formattedDate = "";
  let readingTitle = "분량 없음";
  let todayCompleted = false;
  let completedDays = 0;
  let totalDays = 365;
  let progressPercent = 0;
  let unreadCount = 0;

  if (user?.planStartDate) {
    const startedAt = new Date(user.planStartDate);
    const today = new Date();

    const startMidnight = new Date(startedAt.getFullYear(), startedAt.getMonth(), startedAt.getDate());
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffTime = Math.abs(todayMidnight.getTime() - startMidnight.getTime());
    daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    formattedDate = startedAt.toLocaleDateString("ko-KR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    totalDays = DURATION_DAYS[user.duration] || 365;

    // 완료한 일수 + 완료한 day 번호 목록
    const completedLogs = await prisma.readingLog.findMany({
      where: { userId: user.id },
      select: { dayNumber: true }
    });
    completedDays = completedLogs.length;
    const completedDayNumbers = completedLogs.map(l => l.dayNumber);

    // 오늘 완료 여부
    todayCompleted = completedDayNumbers.includes(daysDiff);

    // 밀린 일수 (오늘 포함, 안 읽은 날)
    unreadCount = 0;
    for (let d = 1; d <= daysDiff; d++) {
      if (!completedDayNumbers.includes(d)) unreadCount++;
    }

    // 누적 분량 제목 (밀린 날 + 오늘)
    readingTitle = getAccumulatedReading(daysDiff, completedDayNumbers, user.duration, user.method);

    progressPercent = Math.round((completedDays / totalDays) * 100);
  }

  return (
    <div className="min-h-screen p-8 bg-zinc-950 font-sans">
      <main className="max-w-4xl mx-auto flex flex-col gap-8 items-center sm:items-start">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">대시보드</h1>
          <div className="flex gap-4">
            <Link href="/settings" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">설정</Link>
            <Link href="/api/auth/signout" className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">로그아웃</Link>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full shadow-2xl">
          <p className="text-zinc-300">환영합니다, <span className="text-indigo-400 font-semibold">{session.user?.name}</span>님!</p>

          {user?.planStartDate ? (
            <>
              <div className="mt-4 bg-indigo-900/40 border border-indigo-500/30 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-indigo-100 font-medium">현재 성경 읽기 <span className="font-bold text-white text-lg">{daysDiff}일째</span></p>
                  {todayCompleted && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">
                      ✓ 오늘 완료
                    </span>
                  )}
                </div>
                <p className="text-xs text-indigo-300/70">시작 일시: {formattedDate}</p>
              </div>

              {/* 진행률 바 */}
              <div className="mt-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">전체 진행률</span>
                  <span className="text-sm font-semibold text-white">{completedDays} / {totalDays}일 ({progressPercent}%)</span>
                </div>
                <div className="w-full bg-zinc-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-500"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* 오늘의 읽기 분량 */}
              {unreadCount === 0 ? (
                <>
                  <div className="mt-6 p-6 bg-emerald-900/20 rounded-xl border border-emerald-700/30">
                    <h2 className="text-xl font-medium text-white mb-2">읽어야 할 분량</h2>
                    <p className="text-emerald-400 font-medium text-lg">분량 없음 — 오늘까지 모두 읽으셨습니다! 🎉</p>
                  </div>
                  <Link href="/read" className="block mt-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-all group cursor-pointer text-center">
                    <p className="text-indigo-400 text-sm font-medium group-hover:text-indigo-300 transition-colors">
                      본문 다시 읽기 →
                    </p>
                  </Link>
                </>
              ) : (
                <Link href="/read" className="block mt-6 p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-all group cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-medium text-white">읽어야 할 분량</h2>
                    {unreadCount > 1 && (
                      <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/30">
                        {unreadCount}일치 누적
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 font-medium text-lg">{readingTitle}</p>
                  <p className="mt-3 text-indigo-400 text-sm font-medium group-hover:text-indigo-300 transition-colors">
                    본문 읽기 →
                  </p>
                </Link>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-500 mt-4 bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl">
              아직 읽기 설정이 저장되지 않았습니다. 우측 상단의 <Link href="/settings" className="text-indigo-400 hover:underline">설정</Link>에서 일정을 시작해 보세요!
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
