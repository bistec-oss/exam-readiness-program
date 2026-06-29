import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

/** Current user's generated notification emails, newest first. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.emailLog.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, subject: true, body: true, createdAt: true },
  });

  return NextResponse.json(logs);
}
