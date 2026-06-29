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
  const questions = await prisma.question.findMany({
    include: {
      exam: { select: { name: true } },
      challengeSet: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(questions);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const q = await prisma.question.create({
    data: {
      text: body.text,
      preamble: body.preamble || null,
      type: body.type,
      options: body.options,
      correctOptionId: body.correctOptionId,
      explanation: body.explanation,
      examId: body.examId,
      challengeSetId: body.challengeSetId || null,
    },
  });
  return NextResponse.json(q, { status: 201 });
}
