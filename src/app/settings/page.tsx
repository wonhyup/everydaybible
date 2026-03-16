import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SettingsForm from "./SettingsForm";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string }
  });

  return (
    <div className="min-h-screen p-8 bg-zinc-950 font-sans text-zinc-100">
      <main className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="w-full flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-white">설정</h1>
          <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            대시보드로 돌아가기
          </Link>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 w-full shadow-2xl space-y-8">
          
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">계정 정보</h2>
            <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 p-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-zinc-400">이메일</span>
                <span className="font-medium text-zinc-200">{user?.email}</span>
              </div>
            </div>
          </section>

          {/* Moved form to a client component */}
          <SettingsForm 
            initialDuration={user?.duration || "ONE_YEAR"} 
            initialMethod={user?.method || "OT_FIRST"} 
            initialPushTime={user?.pushTime || "08:00"}
          />


        </div>
      </main>
    </div>
  );
}
