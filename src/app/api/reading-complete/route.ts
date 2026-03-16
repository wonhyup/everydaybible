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

    const { dayNumber } = await req.json();

    if (!dayNumber || dayNumber < 1) {
      return NextResponse.json({ message: "올바르지 않은 일자입니다." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // upsert: 이미 완료했으면 업데이트, 아니면 새로 생성
    await prisma.readingLog.upsert({
      where: {
        userId_dayNumber: {
          userId: user.id,
          dayNumber: dayNumber,
        }
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        dayNumber: dayNumber,
      }
    });

    return NextResponse.json({ message: "읽기 완료!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
