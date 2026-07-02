import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

// GET /api/admin/study-plans — list plans with exam + step count.
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const plans = await prisma.studyPlan.findMany({
    include: { exam: { select: { id: true, name: true } }, _count: { select: { steps: true, enrollments: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(plans);
}

// POST /api/admin/study-plans — create a plan.
export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  if (!body.examId || !body.title) {
    return NextResponse.json({ error: "examId and title are required" }, { status: 400 });
  }
  const plan = await prisma.studyPlan.create({
    data: {
      examId: body.examId,
      title: body.title,
      description: body.description ?? "",
    },
  });
  return NextResponse.json(plan, { status: 201 });
}
