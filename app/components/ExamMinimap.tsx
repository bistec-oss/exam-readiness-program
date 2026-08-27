"use client";

type MinimapQuestion = { id: string };

export function ExamMinimap<T extends MinimapQuestion>({
  questions,
  currentIndex,
  answers,
  markedForReview,
  onJump,
}: {
  questions: T[];
  currentIndex: number;
  answers: Record<string, string>;
  markedForReview: Set<string>;
  onJump: (index: number) => void;
}) {
  return (
    <div className="hidden md:grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-2">
      {questions.map((question, index) => {
        const isAnswered = Boolean(answers[question.id]);
        const isMarked = markedForReview.has(question.id);
        const isCurrent = index === currentIndex;

        let colorClasses = "border-gray-200 bg-gray-100 text-gray-600 hover:border-violet-300";
        if (isAnswered && isMarked) {
          colorClasses = "border-amber-400 bg-violet-600 text-white";
        } else if (isAnswered) {
          colorClasses = "border-violet-600 bg-violet-600 text-white";
        } else if (isMarked) {
          colorClasses = "border-amber-400 bg-amber-100 text-amber-700";
        }

        return (
          <button
            key={question.id}
            onClick={() => onJump(index)}
            className={`w-9 h-9 rounded-xl border-2 font-bold text-xs flex items-center justify-center transition-colors ${colorClasses} ${
              isCurrent ? "ring-2 ring-offset-2 ring-violet-700" : ""
            }`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
