import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { parseCsv } from "@/lib/csv";
import { NextResponse } from "next/server";

// Header-driven, order-independent. Recognised columns:
//   examId, challengeSetId, type, text, preamble, correctOptionId,
//   explanation, optionA, optionB, optionC, optionD
// type ∈ { MCQ, TRUE_FALSE }. For TRUE_FALSE, options are auto-built
// (true/false) and correctOptionId must be "true" or "false".

type RowError = { row: number; message: string };

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let csv: string;
  try {
    const body = await request.json();
    csv = body?.csv;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof csv !== "string" || csv.trim() === "") {
    return NextResponse.json({ error: "Missing 'csv' string" }, { status: 400 });
  }

  const rows = parseCsv(csv);
  if (rows.length < 2) {
    return NextResponse.json(
      { error: "CSV needs a header row and at least one data row" },
      { status: 400 }
    );
  }

  const header = rows[0].map((h) => h.trim());
  const col = (name: string) => header.indexOf(name);
  const required = ["examId", "type", "text", "correctOptionId", "explanation"];
  const missing = required.filter((c) => col(c) === -1);
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required column(s): ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  // Cache valid exam/challenge-set ids once to validate references.
  const [exams, challengeSets] = await Promise.all([
    prisma.exam.findMany({ select: { id: true } }),
    prisma.challengeSet.findMany({ select: { id: true, examId: true } }),
  ]);
  const examIds = new Set(exams.map((e) => e.id));
  const csById = new Map(challengeSets.map((c) => [c.id, c]));

  const get = (r: string[], name: string) => {
    const i = col(name);
    return i === -1 ? "" : (r[i] ?? "").trim();
  };

  const errors: RowError[] = [];
  const toCreate: {
    text: string;
    preamble: string | null;
    type: "MCQ" | "TRUE_FALSE";
    options: { id: string; text: string }[];
    correctOptionId: string;
    explanation: string;
    examId: string;
    challengeSetId: string | null;
  }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const lineNo = i + 1; // 1-based, matching spreadsheet rows
    const examId = get(r, "examId");
    const type = get(r, "type").toUpperCase();
    const text = get(r, "text");
    const explanation = get(r, "explanation");
    const correctOptionId = get(r, "correctOptionId");
    const challengeSetId = get(r, "challengeSetId") || null;
    const preamble = get(r, "preamble") || null;

    if (!text) { errors.push({ row: lineNo, message: "text is empty" }); continue; }
    if (!explanation) { errors.push({ row: lineNo, message: "explanation is empty" }); continue; }
    if (!examIds.has(examId)) { errors.push({ row: lineNo, message: `unknown examId '${examId}'` }); continue; }
    if (type !== "MCQ" && type !== "TRUE_FALSE") {
      errors.push({ row: lineNo, message: `type must be MCQ or TRUE_FALSE (got '${type}')` });
      continue;
    }
    if (challengeSetId) {
      const cs = csById.get(challengeSetId);
      if (!cs) { errors.push({ row: lineNo, message: `unknown challengeSetId '${challengeSetId}'` }); continue; }
      if (cs.examId !== examId) { errors.push({ row: lineNo, message: `challengeSetId '${challengeSetId}' does not belong to examId '${examId}'` }); continue; }
    }

    let options: { id: string; text: string }[];
    if (type === "TRUE_FALSE") {
      options = [{ id: "true", text: "True" }, { id: "false", text: "False" }];
      if (correctOptionId !== "true" && correctOptionId !== "false") {
        errors.push({ row: lineNo, message: "correctOptionId must be 'true' or 'false' for TRUE_FALSE" });
        continue;
      }
    } else {
      options = (["a", "b", "c", "d"] as const)
        .map((id) => ({ id, text: get(r, `option${id.toUpperCase()}`) }))
        .filter((o) => o.text);
      if (options.length < 2) {
        errors.push({ row: lineNo, message: "MCQ needs at least 2 options (optionA, optionB, …)" });
        continue;
      }
      if (!options.some((o) => o.id === correctOptionId)) {
        errors.push({ row: lineNo, message: `correctOptionId '${correctOptionId}' is not one of the provided options` });
        continue;
      }
    }

    toCreate.push({ text, preamble, type, options, correctOptionId, explanation, examId, challengeSetId });
  }

  let imported = 0;
  if (toCreate.length) {
    const result = await prisma.question.createMany({ data: toCreate });
    imported = result.count;
  }

  return NextResponse.json(
    { imported, failed: errors.length, errors },
    { status: errors.length && imported === 0 ? 422 : 200 }
  );
}
