"use client";

import { useState } from "react";
import Link from "next/link";

type Option = { id: string; text: string };
type Question = {
  id: string;
  text: string;
  preamble: string | null;
  type: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
};
type ChallengeSet = {
  id: string;
  title: string;
  topic: string;
  xpReward: number;
  exam: { id: string; name: string };
  questions: Question[];
};

export function FlashCardPlayer({
  challengeSet,
}: {
  challengeSet: ChallengeSet;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const question = challengeSet.questions[currentIndex];
  const total = challengeSet.questions.length;
  const options = question.options as Option[];

  const handleSelect = (optionId: string) => {
    if (showFeedback) return;
    setSelectedOption(optionId);
    setShowFeedback(true);
  };

  const handleNext = async () => {
    const newAnswers = { ...answers, [question.id]: selectedOption! };
    setAnswers(newAnswers);

    if (currentIndex + 1 < total) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      return;
    }

    setSubmitting(true);
    let score = 0;
    for (const q of challengeSet.questions) {
      if (newAnswers[q.id] === q.correctOptionId) score++;
    }
    const earned =
      score === total
        ? challengeSet.xpReward
        : Math.floor(challengeSet.xpReward * (score / total));

    try {
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeSetId: challengeSet.id,
          answers: newAnswers,
          score,
          total,
          xpEarned: earned,
          idempotencyKey: `${challengeSet.id}-${Date.now()}`,
        }),
      });
    } catch {
      // best-effort — show results even if persist fails
    }

    setFinalScore(score);
    setXpEarned(earned);
    setCompleted(true);
    setSubmitting(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setAnswers({});
    setCompleted(false);
    setFinalScore(0);
    setXpEarned(0);
    setSubmitting(false);
  };

  if (completed) {
    const pct = Math.round((finalScore / total) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border-4 border-violet-300 shadow-xl p-8 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">{pct >= 70 ? "🎉" : "💪"}</div>
          <h2 className="text-2xl font-extrabold text-violet-700 mb-1">
            Challenge Complete!
          </h2>
          <p className="text-gray-500 mb-6">{challengeSet.title}</p>
          <div className="bg-violet-50 rounded-2xl p-4 mb-4">
            <p className="text-4xl font-extrabold text-violet-700">
              {finalScore}/{total}
            </p>
            <p className="text-gray-500 text-sm mt-1">{pct}% correct</p>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-3 mb-6">
            <p className="text-yellow-700 font-bold text-lg">
              +{xpEarned} XP earned! ⭐
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/exams/${challengeSet.exam.id}`}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm text-center"
            >
              Back
            </Link>
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCorrect = selectedOption === question.correctOptionId;

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-2xl mx-auto w-full">
      <div className="mb-6 pt-4">
        <div className="flex justify-between text-sm font-semibold text-violet-600 mb-2">
          <span>{challengeSet.title}</span>
          <span>
            {currentIndex + 1}/{total}
          </span>
        </div>
        <div className="bg-violet-100 rounded-full h-3">
          <div
            className="bg-violet-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border-4 border-violet-300 shadow-xl p-6 mb-4">
        {question.preamble && (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3 mb-4 font-mono whitespace-pre-wrap">
            {question.preamble}
          </p>
        )}
        <p className="text-lg font-bold text-gray-800">{question.text}</p>
      </div>

      <div className="grid gap-3">
        {options.map((option) => {
          let cls =
            "bg-white border-4 border-gray-200 hover:border-violet-300 text-gray-700 cursor-pointer";
          if (showFeedback) {
            if (option.id === question.correctOptionId) {
              cls = "bg-green-50 border-4 border-green-400 text-green-800 cursor-default";
            } else if (option.id === selectedOption) {
              cls = "bg-red-50 border-4 border-red-400 text-red-800 cursor-default";
            } else {
              cls = "bg-white border-4 border-gray-200 text-gray-400 cursor-default";
            }
          }
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full text-left p-4 rounded-2xl font-semibold transition-all ${cls}`}
            >
              <span className="inline-flex w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-bold items-center justify-center mr-3 flex-shrink-0">
                {option.id.toUpperCase()}
              </span>
              {option.text}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div
          className={`mt-4 p-4 rounded-2xl border-2 ${
            isCorrect
              ? "bg-green-50 border-green-300"
              : "bg-red-50 border-red-300"
          }`}
        >
          <p
            className={`font-bold mb-1 ${
              isCorrect ? "text-green-700" : "text-red-700"
            }`}
          >
            {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
          </p>
          <p className="text-gray-700 text-sm">{question.explanation}</p>
        </div>
      )}

      {showFeedback && (
        <button
          onClick={handleNext}
          disabled={submitting}
          className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-bold rounded-2xl transition-colors text-lg"
        >
          {submitting
            ? "Saving..."
            : currentIndex + 1 < total
            ? "Next Question →"
            : "See Results 🎉"}
        </button>
      )}
    </div>
  );
}
