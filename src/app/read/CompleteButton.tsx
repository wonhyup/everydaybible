"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  dayNumbers: number[]; // 완료할 일자 목록
}

export default function CompleteButton({ dayNumbers }: Props) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    if (completed) return;
    setLoading(true);

    try {
      // 여러 날을 한꺼번에 완료 처리
      const promises = dayNumbers.map(dayNumber =>
        fetch("/api/reading-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dayNumber }),
        })
      );

      await Promise.all(promises);
      setCompleted(true);
      setTimeout(() => router.push("/"), 1500);
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-emerald-900/95 backdrop-blur-md border-t border-emerald-700/50 p-4 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-3">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-emerald-100 font-semibold text-lg">
            {dayNumbers.length > 1 ? `${dayNumbers.length}일치 읽기를 완료했습니다! 🎉` : "오늘의 읽기를 완료했습니다! 🎉"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 p-4 z-20">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleComplete}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all text-lg shadow-lg shadow-indigo-500/20"
        >
          {loading ? "저장 중..." : dayNumbers.length > 1 ? `✓ ${dayNumbers.length}일치 읽기 완료` : "✓ 읽기 완료"}
        </button>
      </div>
    </div>
  );
}
