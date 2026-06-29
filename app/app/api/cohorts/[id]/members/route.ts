import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: cohortId } = await params;
  const body = await request.json();
  const email = (body.email as string)?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort) return NextResponse.json({ error: "Cohort not found" }, { status: 404 });

  const member = await prisma.cohortMember.upsert({
    where: { cohortId_userId: { cohortId, userId: user.id } },
    update: {},
    create: { cohortId, userId: user.id },
  });

  return NextResponse.json(member, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: cohortId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  await prisma.cohortMember.delete({
    where: { cohortId_userId: { cohortId, userId } },
  });

  return new Response(null, { status: 204 });
}
