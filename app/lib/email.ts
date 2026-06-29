import "server-only";

export type WeeklySummaryData = {
  name: string;
  readiness: number;
  xp: number;
  challengesCompleted: number;
  bestMockScore: number;
  weakTopics: { topic: string; avgScore: number }[];
};

export type RenderedEmail = { subject: string; body: string };

/**
 * Render the weekly readiness summary email for a candidate.
 * Pure function — no transport. The "sending" layer persists the result
 * to EmailLog so it can be previewed / audited (no real SMTP in this env).
 */
export function buildWeeklySummary(data: WeeklySummaryData): RenderedEmail {
  const subject = `Your weekly readiness: ${data.readiness}% ready`;

  const weak =
    data.weakTopics.length === 0
      ? "No weak topics yet — keep practising to surface them."
      : data.weakTopics
          .map((t) => `  • ${t.topic} (${t.avgScore}%)`)
          .join("\n");

  const nudge =
    data.readiness >= 80
      ? "You're exam-ready. Lock it in with one more full mock."
      : data.readiness >= 50
      ? "Solid progress. Focus your weak topics to cross 80%."
      : "Early days. Aim for one challenge set per day this week.";

  const body = [
    `Hi ${data.name},`,
    ``,
    `Here's your study week in review:`,
    ``,
    `  Readiness:        ${data.readiness}%`,
    `  Total XP:         ${data.xp}`,
    `  Challenges done:  ${data.challengesCompleted}`,
    `  Best mock score:  ${data.bestMockScore}%`,
    ``,
    `Weak topics to revisit:`,
    weak,
    ``,
    nudge,
    ``,
    `— Bistec Exam Readiness`,
  ].join("\n");

  return { subject, body };
}
