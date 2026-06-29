import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const exams = await prisma.exam.findMany({
    include: { _count: { select: { challengeSets: true, questions: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(exams);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const exam = await prisma.exam.create({
    data: {
      name: body.name,
      description: body.description,
      passingScore: body.passingScore,
      durationMinutes: body.durationMinutes,
    },
  });
  return NextResponse.json(exam, { status: 201 });
}
