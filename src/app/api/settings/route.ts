import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "권한이 없습니다." }, { status: 401 });
    }

    const { duration, method } = await req.json();

    if (!duration || !method) {
      return NextResponse.json({ message: "설정 값이 누락되었습니다." }, { status: 400 });
    }

    // Update user settings, and always record right now as the new plan start time.
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        duration,
        method,
        planStartDate: new Date()
      }
    });

    // 설정을 새로 저장했으므로, 이전 읽기 완료 기록들을 모두 삭제하여 진행률 초기화
    await prisma.readingLog.deleteMany({
      where: { userId: updatedUser.id }
    });

    return NextResponse.json({ message: "설정이 저장되었습니다." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
