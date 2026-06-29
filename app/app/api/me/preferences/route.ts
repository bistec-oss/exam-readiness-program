import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { leaderboardOptIn: true, weeklyEmailOptIn: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: { leaderboardOptIn?: boolean; weeklyEmailOptIn?: boolean } = {};
  if ("leaderboardOptIn" in body) {
    if (typeof body.leaderboardOptIn !== "boolean") {
      return NextResponse.json({ error: "leaderboardOptIn must be boolean" }, { status: 400 });
    }
    data.leaderboardOptIn = body.leaderboardOptIn;
  }
  if ("weeklyEmailOptIn" in body) {
    if (typeof body.weeklyEmailOptIn !== "boolean") {
      return NextResponse.json({ error: "weeklyEmailOptIn must be boolean" }, { status: 400 });
    }
    data.weeklyEmailOptIn = body.weeklyEmailOptIn;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No preferences provided" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data,
    select: { leaderboardOptIn: true, weeklyEmailOptIn: true },
  });

  return NextResponse.json(user);
}
