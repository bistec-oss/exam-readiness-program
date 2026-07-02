// Presentational timeline for a study plan's steps, grouped by week.
// Server-compatible (no client hooks) — pure display + deep links.
import Link from "next/link";

export type TimelineStep = {
  id: string;
  order: number;
  title: string;
  type: "CHALLENGE_SET" | "MOCK_SCORE";
  dayOffset: number;
  week: number;
  completed: boolean;
  link: string | null;
};

export function StudyPlanTimeline({
  steps,
  nextStepId,
}: {
  steps: TimelineStep[];
  nextStepId: string | null;
}) {
  // Group by week, preserving order.
  const weeks = new Map<number, TimelineStep[]>();
  for (const s of steps) {
    if (!weeks.has(s.week)) weeks.set(s.week, []);
    weeks.get(s.week)!.push(s);
  }

  return (
    <div className="space-y-6">
      {[...weeks.entries()].map(([week, weekSteps]) => (
        <div key={week}>
          <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Week {week}</p>
          <div className="space-y-3">
            {weekSteps.map((step) => {
              const isNext = step.id === nextStepId;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                    step.completed
                      ? "border-green-200 bg-green-50"
                      : isNext
                        ? "border-violet-400 bg-violet-50 shadow-md"
                        : "border-gray-100 bg-white"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
                      step.completed ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                    }`}
                    aria-hidden
                  >
                    {step.completed ? "✓" : step.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{step.title}</p>
                    <p className="text-xs text-gray-400">
                      {step.type === "MOCK_SCORE" ? "Mock exam target" : "Challenge set"}
                      {isNext && !step.completed && " · Next up"}
                    </p>
                  </div>
                  {step.link ? (
                    <Link
                      href={step.link}
                      className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                        step.completed
                          ? "bg-white text-green-700 border-2 border-green-200 hover:bg-green-100"
                          : "bg-violet-600 text-white hover:bg-violet-700"
                      }`}
                    >
                      {step.completed ? "Review" : "Start"}
                    </Link>
                  ) : (
                    <span className="shrink-0 text-xs text-gray-300 italic">unavailable</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
