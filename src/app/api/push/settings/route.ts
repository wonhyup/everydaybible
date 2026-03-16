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

    const { pushTime } = await req.json();

    if (!pushTime) {
      return NextResponse.json({ message: "시간 설정값이 누락되었습니다." }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { pushTime }
    });

    return NextResponse.json({ message: "알림 시간이 저장되었습니다." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
