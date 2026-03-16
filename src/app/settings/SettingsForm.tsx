"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// VAPID 키 변환 유틸리티
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function SettingsForm({ initialDuration, initialMethod, initialPushTime }: { initialDuration: string, initialMethod: string, initialPushTime: string }) {
  const router = useRouter();
  const [duration, setDuration] = useState(initialDuration);
  const [method, setMethod] = useState(initialMethod);
  const [pushTime, setPushTime] = useState(initialPushTime);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [pushTimeMsg, setPushTimeMsg] = useState("");
  
  // 알림 상태
  const [pushStatus, setPushStatus] = useState<"unsupported" | "granted" | "denied" | "prompt">("prompt");
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushStatus("unsupported");
      return;
    }
    // 현재 권한 상태 확인
    setPushStatus(Notification.permission as any);

    // 서비스 워커 등록
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  }, []);

  const handleSubscribe = async () => {
    if (pushStatus === "unsupported") return;
    setIsSubscribing(true);
    setMsg("");
    
    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission as any);

      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey,
        });

        // 서버로 구독 정보 전송
        const res = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription }),
        });

        if (!res.ok) throw new Error("알림 구독에 실패했습니다.");
        setMsg("알림 수신이 설정되었습니다!");
      } else {
        setMsg("알림 권한이 거부되었습니다.");
      }
    } catch (err: any) {
      setMsg("구독 중 오류: " + err.message);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration, method })
      });
      if (!res.ok) throw new Error("저장에 실패했습니다.");
      setMsg("설정이 저장되었습니다. (지금부터 일차가 다시 계산됩니다.)");
      router.refresh(); // Tells Next.js to re-fetch the server component state
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-4">성경 읽기 설정</h2>
      {msg && <p className="text-indigo-400 text-sm mb-4 bg-indigo-400/10 p-2 rounded">{msg}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">목표 기간</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { id: 'ONE_YEAR', label: '1년' },
              { id: 'NINE_MONTHS', label: '9개월' },
              { id: 'SIX_MONTHS', label: '6개월' },
              { id: 'THREE_MONTHS', label: '3개월' }
            ].map((option) => (
              <label key={option.id} className={`cursor-pointer border rounded-lg py-3 px-4 text-center transition-all ${duration === option.id ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-800'}`}>
                <input type="radio" name="duration" value={option.id} checked={duration === option.id} onChange={(e) => setDuration(e.target.value)} className="hidden" />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">읽기 방식</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { id: 'OT_FIRST', label: '구약부터 순서대로' },
              { id: 'NT_FIRST', label: '신약부터 순서대로' },
              { id: 'ALT', label: '구약/신약 병행' }
            ].map((option) => (
              <label key={option.id} className={`cursor-pointer border rounded-lg py-3 px-4 text-center transition-all ${method === option.id ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-800'}`}>
                <input type="radio" name="method" value={option.id} checked={method === option.id} onChange={(e) => setMethod(e.target.value)} className="hidden" />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors mt-4 disabled:opacity-50 shadow-lg shadow-indigo-500/20">
            {loading ? "저장 중..." : "설정 저장"}
          </button>
        </div>
      </form>

      {/* 푸시 알림 설정 구역 */}
      <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col gap-3">
        <label className="text-sm font-medium text-zinc-300">매일 알림 받기</label>
        {pushStatus === "unsupported" ? (
          <p className="text-sm text-zinc-500 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">현재 사용 중인 브라우저에서는 알림을 지원하지 않습니다.</p>
        ) : pushStatus === "denied" ? (
          <p className="text-sm text-red-400 bg-red-900/10 p-3 rounded-lg border border-red-900/30">알림 권한이 차단되었습니다. 브라우저 설정에서 권한을 허용해주세요.</p>
        ) : pushStatus === "granted" ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-emerald-400 bg-emerald-900/10 p-3 rounded-lg border border-emerald-900/30">
              ✓ 알림이 설정되었습니다. 매일 읽을 분량을 안내해 드립니다.
            </p>
            
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-medium text-zinc-300">알림 받을 시간</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="time" 
                  value={pushTime} 
                  onChange={(e) => setPushTime(e.target.value)}
                  className="flex-1 bg-zinc-800/50 border border-zinc-700 text-white rounded-lg px-4 py-3 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button 
                  type="button"
                  onClick={async () => {
                    setPushTimeMsg("저장 중...");
                    const res = await fetch("/api/push/settings", { 
                      method: "POST", 
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ pushTime }) 
                    });
                    if (res.ok) setPushTimeMsg("✓ 시간이 저장되었습니다.");
                    else setPushTimeMsg("오류가 발생했습니다.");
                    router.refresh();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-3 rounded-lg transition-colors whitespace-nowrap"
                >
                  시간 저장
                </button>
              </div>
              {pushTimeMsg && <p className="text-xs text-indigo-400 mt-1">{pushTimeMsg}</p>}
            </div>

            <button 
              type="button" 
              onClick={async () => {
                const res = await fetch("/api/push/test", { method: "POST" });
                if (res.ok) alert("테스트 알림이 전송되었습니다!");
                else alert("알림 전송 오류가 발생했습니다.");
              }}
              className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium py-3 rounded-lg transition-colors text-sm"
            >
              🔔 테스트 알림 보내기
            </button>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={handleSubscribe} 
            disabled={isSubscribing}
            className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubscribing ? "설정 중..." : "🔔 알림 권한 허용하기"}
          </button>
        )}
      </div>
    </section>
  );
}
