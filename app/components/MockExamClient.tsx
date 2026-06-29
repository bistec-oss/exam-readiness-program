"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; text: string };
type Question = {
  id: string;
  text: string;
  preamble: string | null;
  type: string;
  options: Option[];
};

type Phase = "idle" | "loading" | "running" | "submitting";

export function MockExamClient({
  examId,
  examName,
  durationMinutes,
}: {
  examId: string;
  examName: string;
  durationMinutes: number;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [startedAt, setStartedAt] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitExam = useCallback(
    async (currentAnswers: Record<string, string>, sat: string) => {
      setIsSubmitting(true);
      setPhase("submitting");
      try {
        const res = await fetch("/api/mock-exams/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examId, answers: currentAnswers, startedAt: sat }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Submit failed");
        router.push(`/mock-exam/${examId}/review/${data.attemptId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Submission failed");
        setIsSubmitting(false);
        setPhase("running");
      }
    },
    [examId, router]
  );

  useEffect(() => {
    if (phase !== "running") return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam(answers, startedAt);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, answers, startedAt, submitExam]);

  const handleStart = async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/mock-exams/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start exam");
      setQuestions(data.questions);
      setStartedAt(data.startedAt);
      setSecondsLeft(data.durationMinutes * 60);
      setCurrentIndex(0);
      setAnswers({});
      setPhase("running");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start exam");
      setPhase("idle");
    }
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const timerWarning = secondsLeft < 600;

  if (phase === "idle") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border-4 border-violet-300 shadow-xl p-8 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-2xl font-extrabold text-violet-700 mb-2">
            {examName}
          </h1>
          <p className="text-gray-500 mb-6">Full Mock Exam</p>
          <div className="bg-violet-50 rounded-2xl p-4 mb-6 text-left space-y-2 text-sm">
            <p className="text-violet-700 font-semibold">
              ⏱ Duration: {durationMinutes} minutes
            </p>
            <p className="text-violet-700 font-semibold">
              📋 All questions from the pool — randomised
            </p>
            <p className="text-violet-700 font-semibold">
              🔇 No per-question feedback during exam
            </p>
            <p className="text-violet-700 font-semibold">
              ⚠️ Timer auto-submits on expiry
            </p>
          </div>
          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}
          <button
            onClick={handleStart}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-2xl text-lg transition-colors"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-violet-600 font-bold text-xl animate-pulse">
          Loading exam...
        </p>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-violet-600 font-bold text-xl animate-pulse">
          Submitting exam...
        </p>
      </div>
    );
  }

  const question = questions[currentIndex];
  const options = question.options as Option[];
  const answered = Object.keys(answers).length;

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full mb-4">
        <div className="flex items-center justify-between bg-white rounded-2xl border-2 border-violet-200 shadow px-4 py-3">
          <span className="text-sm font-semibold text-violet-700">
            Q {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-sm font-semibold text-gray-500">
            Answered: {answered}/{questions.length}
          </span>
          <span
            className={`text-lg font-extrabold tabular-nums ${
              timerWarning ? "text-red-600 animate-pulse" : "text-violet-700"
            }`}
          >
            ⏱ {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
        <div className="bg-white rounded-3xl border-4 border-violet-300 shadow-xl p-6 mb-4">
          {question.preamble && (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3 mb-4 font-mono whitespace-pre-wrap">
              {question.preamble}
            </p>
          )}
          <p className="text-lg font-bold text-gray-800">{question.text}</p>
        </div>

        <div className="grid gap-3 mb-6">
          {options.map((option) => {
            const selected = answers[question.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(question.id, option.id)}
                className={`w-full text-left p-4 rounded-2xl font-semibold transition-all border-4 ${
                  selected
                    ? "border-violet-500 bg-violet-50 text-violet-800"
                    : "border-gray-200 bg-white text-gray-700 hover:border-violet-300"
                }`}
              >
                <span className="inline-flex w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-bold items-center justify-center mr-3 flex-shrink-0">
                  {option.id.toUpperCase()}
                </span>
                {option.text}
              </button>
            );
          })}
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            ← Previous
          </button>
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => submitExam(answers, startedAt)}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors"
            >
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
