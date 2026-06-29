import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exams = await prisma.exam.findMany({
    include: { _count: { select: { challengeSets: true, questions: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(exams);
}
