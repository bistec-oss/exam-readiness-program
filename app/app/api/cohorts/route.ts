import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

function genCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cohorts = await prisma.cohort.findMany({
    include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cohorts);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const name = (body.name as string)?.trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const code = genCode();
  const cohort = await prisma.cohort.create({ data: { name, code } });
  return NextResponse.json(cohort, { status: 201 });
}
