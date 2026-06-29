import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FlashCardPlayer } from "@/components/FlashCardPlayer";

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const challengeSet = await prisma.challengeSet.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { createdAt: "asc" } },
      exam: { select: { id: true, name: true } },
    },
  });

  if (!challengeSet) redirect("/exams");

  const csData = {
    id: challengeSet.id,
    title: challengeSet.title,
    topic: challengeSet.topic,
    xpReward: challengeSet.xpReward,
    exam: challengeSet.exam,
    questions: challengeSet.questions.map((q) => ({
      id: q.id,
      text: q.text,
      preamble: q.preamble,
      type: q.type,
      options: q.options as { id: string; text: string }[],
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50">
      <FlashCardPlayer challengeSet={csData} />
    </div>
  );
}
