// SERVER COMPONENT — no "use client"
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ExamCatalog } from "@/components/ExamCatalog";

export default async function ExamsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const exams = await prisma.exam.findMany({
    include: { _count: { select: { challengeSets: true, questions: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <ExamCatalog
      exams={exams}
      auth={{ kind: "loggedIn", userName: session.name }}
    />
  );
}