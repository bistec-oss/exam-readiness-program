import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const challenges = await prisma.challengeSet.findMany({
    include: { exam: { select: { name: true } }, _count: { select: { questions: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(challenges);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const cs = await prisma.challengeSet.create({
    data: {
      title: body.title,
      topic: body.topic,
      xpReward: body.xpReward,
      examId: body.examId,
    },
  });
  return NextResponse.json(cs, { status: 201 });
}
