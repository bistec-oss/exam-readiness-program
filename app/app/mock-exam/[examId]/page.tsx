import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MockExamClient } from "@/components/MockExamClient";

export default async function MockExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { examId } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, name: true, durationMinutes: true },
  });

  if (!exam) redirect("/exams");

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50">
      <MockExamClient
        examId={exam.id}
        examName={exam.name}
        durationMinutes={exam.durationMinutes}
      />
    </div>
  );
}
