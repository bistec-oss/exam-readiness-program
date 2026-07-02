// Pure completion-derivation for study plans (slice 15).
// No prisma import — callers fetch data and pass it in, so this stays testable
// and shared between the candidate progress API and any future consumer.

export type StepType = "CHALLENGE_SET" | "MOCK_SCORE";

export type PlanStepInput = {
  id: string;
  order: number;
  title: string;
  type: StepType;
  challengeSetId: string | null;
  mockScoreThreshold: number | null;
  dayOffset: number;
};

export type AttemptInput = { challengeSetId: string; score: number; total: number };
export type MockInput = { score: number; total: number };

export type DerivedStep = PlanStepInput & {
  week: number;
  completed: boolean;
  link: string | null;
};

export type DerivedProgress = {
  steps: DerivedStep[];
  completedCount: number;
  totalSteps: number;
  completionPct: number;
  nextStep: DerivedStep | null;
};

// A challenge set counts as passed once the user scores >= 50% on any attempt.
const CHALLENGE_PASS_RATIO = 0.5;

/**
 * Derive per-step completion from existing attempt data.
 * @param steps        plan steps (any order — sorted internally by `order`)
 * @param attempts     the user's challenge attempts
 * @param mocks        the user's mock attempts for this plan's exam
 * @param examId       plan's exam id (used to build the mock deep link)
 * @param passingScore exam passing score, used when a MOCK_SCORE step has no explicit threshold
 */
export function deriveProgress(
  steps: PlanStepInput[],
  attempts: AttemptInput[],
  mocks: MockInput[],
  examId: string,
  passingScore: number
): DerivedProgress {
  const passedSetIds = new Set(
    attempts
      .filter((a) => a.total > 0 && a.score / a.total >= CHALLENGE_PASS_RATIO)
      .map((a) => a.challengeSetId)
  );

  const bestMockPct =
    mocks.length === 0
      ? 0
      : Math.max(...mocks.map((m) => (m.total > 0 ? (m.score / m.total) * 100 : 0)));

  const ordered = [...steps].sort((a, b) => a.order - b.order);

  const derived: DerivedStep[] = ordered.map((step) => {
    let completed = false;
    let link: string | null = null;

    if (step.type === "CHALLENGE_SET") {
      completed = step.challengeSetId ? passedSetIds.has(step.challengeSetId) : false;
      link = step.challengeSetId ? `/challenges/${step.challengeSetId}/play` : null;
    } else {
      const threshold = step.mockScoreThreshold ?? passingScore;
      completed = bestMockPct >= threshold;
      link = `/mock-exam/${examId}`;
    }

    return {
      ...step,
      week: Math.floor(step.dayOffset / 7) + 1,
      completed,
      link,
    };
  });

  const completedCount = derived.filter((s) => s.completed).length;
  const totalSteps = derived.length;
  const completionPct = totalSteps === 0 ? 0 : Math.round((completedCount / totalSteps) * 100);
  const nextStep = derived.find((s) => !s.completed) ?? null;

  return { steps: derived, completedCount, totalSteps, completionPct, nextStep };
}
