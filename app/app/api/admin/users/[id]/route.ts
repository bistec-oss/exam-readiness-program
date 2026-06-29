import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { z } from "zod";

const PatchSchema = z
  .object({
    role: z.enum(["ADMIN", "CANDIDATE"]).optional(),
    status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  })
  .refine((d) => d.role !== undefined || d.status !== undefined, {
    error: "Provide role or status.",
  });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  // Guard against self-lockout: an admin cannot suspend or demote their own account.
  if (id === session.userId) {
    if (parsed.data.status === "SUSPENDED") {
      return NextResponse.json({ error: "You cannot suspend your own account." }, { status: 400 });
    }
    if (parsed.data.role === "CANDIDATE") {
      return NextResponse.json({ error: "You cannot remove your own admin role." }, { status: 400 });
    }
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  return NextResponse.json(user);
}
