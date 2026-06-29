"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");
}

// ── Exams ────────────────────────────────────────────────────────────────────

export async function createExam(formData: FormData) {
  await requireAdmin();
  await prisma.exam.create({
    data: {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      passingScore: parseInt(formData.get("passingScore") as string, 10),
      durationMinutes: parseInt(formData.get("durationMinutes") as string, 10),
    },
  });
  revalidatePath("/admin/exams");
  redirect("/admin/exams");
}

export async function updateExam(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await prisma.exam.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      passingScore: parseInt(formData.get("passingScore") as string, 10),
      durationMinutes: parseInt(formData.get("durationMinutes") as string, 10),
    },
  });
  revalidatePath("/admin/exams");
  redirect("/admin/exams");
}

export async function deleteExam(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await prisma.exam.delete({ where: { id } });
  revalidatePath("/admin/exams");
  redirect("/admin/exams");
}

// ── Challenge Sets ────────────────────────────────────────────────────────────

export async function createChallengeSet(formData: FormData) {
  await requireAdmin();
  await prisma.challengeSet.create({
    data: {
      title: formData.get("title") as string,
      topic: formData.get("topic") as string,
      xpReward: parseInt(formData.get("xpReward") as string, 10),
      examId: formData.get("examId") as string,
    },
  });
  revalidatePath("/admin/challenges");
  redirect("/admin/challenges");
}

export async function updateChallengeSet(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await prisma.challengeSet.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      topic: formData.get("topic") as string,
      xpReward: parseInt(formData.get("xpReward") as string, 10),
      examId: formData.get("examId") as string,
    },
  });
  revalidatePath("/admin/challenges");
  redirect("/admin/challenges");
}

export async function deleteChallengeSet(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await prisma.challengeSet.delete({ where: { id } });
  revalidatePath("/admin/challenges");
  redirect("/admin/challenges");
}

// ── Questions ─────────────────────────────────────────────────────────────────

function buildOptions(formData: FormData, type: string) {
  if (type === "TRUE_FALSE") {
    return [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ];
  }
  const labels = ["a", "b", "c", "d"];
  return labels
    .map((id) => ({ id, text: (formData.get(`option_${id}`) as string)?.trim() }))
    .filter((o) => o.text);
}

export async function createQuestion(formData: FormData) {
  await requireAdmin();
  const type = formData.get("type") as "MCQ" | "TRUE_FALSE";
  const options = buildOptions(formData, type);
  await prisma.question.create({
    data: {
      text: formData.get("text") as string,
      preamble: (formData.get("preamble") as string) || null,
      type,
      options,
      correctOptionId: formData.get("correctOptionId") as string,
      explanation: formData.get("explanation") as string,
      examId: formData.get("examId") as string,
      challengeSetId: (formData.get("challengeSetId") as string) || null,
    },
  });
  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function updateQuestion(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const type = formData.get("type") as "MCQ" | "TRUE_FALSE";
  const options = buildOptions(formData, type);
  await prisma.question.update({
    where: { id },
    data: {
      text: formData.get("text") as string,
      preamble: (formData.get("preamble") as string) || null,
      type,
      options,
      correctOptionId: formData.get("correctOptionId") as string,
      explanation: formData.get("explanation") as string,
      examId: formData.get("examId") as string,
      challengeSetId: (formData.get("challengeSetId") as string) || null,
    },
  });
  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function deleteQuestion(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await prisma.question.delete({ where: { id } });
  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}
