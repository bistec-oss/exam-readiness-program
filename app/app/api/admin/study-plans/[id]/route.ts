import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

// GET /api/admin/study-plans/[id] — plan with ordered steps.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const plan = await prisma.studyPlan.findUnique({
    where: { id },
    include: { steps: { orderBy: { order: "asc" } }, exam: { select: { id: true, name: true } } },
  });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(plan);
}

// PATCH /api/admin/study-plans/[id] — update title/description/exam.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await request.json();
  const plan = await prisma.studyPlan.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.examId !== undefined && { examId: body.examId }),
    },
  });
  return NextResponse.json(plan);
}

// DELETE /api/admin/study-plans/[id] — cascade deletes steps + enrollments.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.studyPlan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
