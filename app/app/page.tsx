import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ExamCatalog } from "@/components/ExamCatalog";

export default async function HomePage() {
  const [session, exams] = await Promise.all([
    getSession(),
    prisma.exam.findMany({
      include: { _count: { select: { challengeSets: true, questions: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <ExamCatalog
      exams={exams}
      auth={
        session
          ? { kind: "loggedIn", userName: session.name }
          : { kind: "anonymous" }
      }
    />
  );
}
