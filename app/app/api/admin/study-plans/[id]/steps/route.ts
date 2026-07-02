import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

// POST /api/admin/study-plans/[id]/steps — add a step to a plan.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await request.json();

  if (body.type !== "CHALLENGE_SET" && body.type !== "MOCK_SCORE") {
    return NextResponse.json({ error: "type must be CHALLENGE_SET or MOCK_SCORE" }, { status: 400 });
  }
  if (!body.title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  // Default order = append to end.
  const order =
    body.order ??
    ((await prisma.studyPlanStep.aggregate({ where: { planId: id }, _max: { order: true } }))._max.order ?? 0) + 1;

  const step = await prisma.studyPlanStep.create({
    data: {
      planId: id,
      order,
      title: body.title,
      type: body.type,
      challengeSetId: body.type === "CHALLENGE_SET" ? (body.challengeSetId ?? null) : null,
      mockScoreThreshold: body.type === "MOCK_SCORE" ? (body.mockScoreThreshold ?? null) : null,
      dayOffset: body.dayOffset ?? 0,
    },
  });
  return NextResponse.json(step, { status: 201 });
}
