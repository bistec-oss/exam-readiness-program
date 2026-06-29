import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const challenges = await prisma.challengeSet.findMany({
    where: { examId: id },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(challenges);
}
