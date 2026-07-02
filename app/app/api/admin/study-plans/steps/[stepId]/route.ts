import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

// PATCH /api/admin/study-plans/steps/[stepId] — edit or reorder a step.
export async function PATCH(request: Request, { params }: { params: Promise<{ stepId: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { stepId } = await params;
  const body = await request.json();

  const step = await prisma.studyPlanStep.update({
    where: { id: stepId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.challengeSetId !== undefined && { challengeSetId: body.challengeSetId }),
      ...(body.mockScoreThreshold !== undefined && { mockScoreThreshold: body.mockScoreThreshold }),
      ...(body.dayOffset !== undefined && { dayOffset: body.dayOffset }),
    },
  });
  return NextResponse.json(step);
}

// DELETE /api/admin/study-plans/steps/[stepId] — remove a step.
export async function DELETE(_req: Request, { params }: { params: Promise<{ stepId: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { stepId } = await params;
  await prisma.studyPlanStep.delete({ where: { id: stepId } });
  return NextResponse.json({ ok: true });
}
