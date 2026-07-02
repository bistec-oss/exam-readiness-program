import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

// POST /api/study-plans/[id]/enroll — idempotent enroll for the current user.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const plan = await prisma.studyPlan.findUnique({ where: { id }, select: { id: true } });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.studyPlanEnrollment.findUnique({
    where: { userId_planId: { userId: session.userId, planId: id } },
  });
  if (existing) return NextResponse.json({ enrollmentId: existing.id }, { status: 200 });

  const enrollment = await prisma.studyPlanEnrollment.create({
    data: { userId: session.userId, planId: id },
  });
  return NextResponse.json({ enrollmentId: enrollment.id }, { status: 201 });
}
