"use client";

import { useEffect, useState, useCallback } from "react";

type Exam = { id: string; name: string };
type ChallengeSet = { id: string; title: string; exam: { name: string } };
type Step = {
  id: string;
  order: number;
  title: string;
  type: "CHALLENGE_SET" | "MOCK_SCORE";
  challengeSetId: string | null;
  mockScoreThreshold: number | null;
  dayOffset: number;
};
type Plan = {
  id: string;
  title: string;
  description: string;
  exam: { id: string; name: string };
  _count: { steps: number; enrollments: number };
};

export default function AdminStudyPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [challengeSets, setChallengeSets] = useState<ChallengeSet[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);

  const loadPlans = useCallback(async () => {
    const res = await fetch("/api/admin/study-plans");
    if (res.ok) setPlans(await res.json());
  }, []);

  useEffect(() => {
    fetch("/api/admin/study-plans").then((r) => { if (r.ok) r.json().then(setPlans); });
    fetch("/api/admin/exams").then((r) => { if (r.ok) r.json().then(setExams); });
    fetch("/api/admin/challenges").then((r) => { if (r.ok) r.json().then(setChallengeSets); });
  }, []);

  async function loadSteps(planId: string) {
    const res = await fetch(`/api/admin/study-plans/${planId}`);
    if (res.ok) {
      const plan = await res.json();
      setSteps(plan.steps);
    }
  }

  function toggleExpand(planId: string) {
    if (expandedId === planId) {
      setExpandedId(null);
      setSteps([]);
    } else {
      setExpandedId(planId);
      loadSteps(planId);
    }
  }

  async function createPlan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/study-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examId: fd.get("examId"),
        title: fd.get("title"),
        description: fd.get("description"),
      }),
    });
    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      loadPlans();
    }
  }

  async function deletePlan(id: string) {
    if (!confirm("Delete this study plan and all its steps?")) return;
    await fetch(`/api/admin/study-plans/${id}`, { method: "DELETE" });
    if (expandedId === id) setExpandedId(null);
    loadPlans();
  }

  async function addStep(planId: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const type = fd.get("type") as string;
    const res = await fetch(`/api/admin/study-plans/${planId}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        type,
        challengeSetId: type === "CHALLENGE_SET" ? fd.get("challengeSetId") || null : null,
        mockScoreThreshold: type === "MOCK_SCORE" ? Number(fd.get("mockScoreThreshold")) || null : null,
        dayOffset: Number(fd.get("dayOffset")) || 0,
      }),
    });
    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      loadSteps(planId);
      loadPlans();
    }
  }

  async function deleteStep(planId: string, stepId: string) {
    await fetch(`/api/admin/study-plans/steps/${stepId}`, { method: "DELETE" });
    loadSteps(planId);
    loadPlans();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Study Plans</h1>

      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow mb-8 divide-y divide-gray-50">
        {plans.map((p) => (
          <div key={p.id}>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div>
                <p className="font-semibold text-gray-800">{p.title}</p>
                <p className="text-xs text-gray-500">
                  {p.exam.name} · {p._count.steps} steps · {p._count.enrollments} enrolled
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => toggleExpand(p.id)} className="text-xs font-semibold text-violet-600 hover:underline">
                  {expandedId === p.id ? "Hide steps" : "Manage steps"}
                </button>
                <button onClick={() => deletePlan(p.id)} className="text-xs font-semibold text-red-500 hover:underline">
                  Delete
                </button>
              </div>
            </div>

            {expandedId === p.id && (
              <div className="bg-gray-50 px-4 py-4">
                <div className="space-y-2 mb-4">
                  {steps.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl bg-white border border-gray-100 px-3 py-2">
                      <span className="text-sm text-gray-700">
                        <span className="font-bold text-gray-400 mr-2">{s.order}.</span>
                        {s.title}
                        <span className="ml-2 text-xs text-gray-400">
                          [{s.type === "MOCK_SCORE" ? `mock ≥ ${s.mockScoreThreshold ?? "pass"}%` : "challenge"} · day {s.dayOffset}]
                        </span>
                      </span>
                      <button onClick={() => deleteStep(p.id, s.id)} className="text-xs text-red-500 hover:underline">
                        Remove
                      </button>
                    </div>
                  ))}
                  {steps.length === 0 && <p className="text-xs text-gray-400">No steps yet.</p>}
                </div>

                <form onSubmit={(e) => addStep(p.id, e)} className="grid grid-cols-6 gap-2 items-end">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                    <input name="title" required className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
                    <select name="type" className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-violet-400">
                      <option value="CHALLENGE_SET">Challenge</option>
                      <option value="MOCK_SCORE">Mock score</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Challenge set</label>
                    <select name="challengeSetId" className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-violet-400">
                      <option value="">—</option>
                      {challengeSets.map((cs) => (
                        <option key={cs.id} value={cs.id}>{cs.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Mock %</label>
                    <input name="mockScoreThreshold" type="number" min="1" max="100" className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Day</label>
                    <input name="dayOffset" type="number" min="0" defaultValue="0" className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-violet-400" />
                  </div>
                  <div className="col-span-6">
                    <button type="submit" className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg text-xs">
                      Add step
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
        {plans.length === 0 && <p className="px-4 py-6 text-center text-gray-400">No study plans yet.</p>}
      </div>

      <div className="bg-white rounded-2xl border-2 border-violet-100 shadow p-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Create Study Plan</h2>
        <form onSubmit={createPlan} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
            <input name="title" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
            <textarea name="description" rows={2} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Exam</label>
            <select name="examId" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400">
              <option value="">Select an exam…</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm">
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
