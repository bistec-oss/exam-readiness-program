import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);
  if (rows.length === 0) return NextResponse.json({ error: "Empty or invalid CSV" }, { status: 400 });

  // Pre-load exams and challenge sets for lookup
  const exams = await prisma.exam.findMany({ select: { id: true, name: true } });
  const examByName = new Map(exams.map((e) => [e.name.toLowerCase(), e.id]));

  const challengeSets = await prisma.challengeSet.findMany({
    select: { id: true, title: true, examId: true },
  });

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed, skip header

    try {
      const text = row["text"];
      if (!text) { errors.push(`Row ${rowNum}: missing text`); continue; }

      const examName = row["exam_name"];
      if (!examName) { errors.push(`Row ${rowNum}: missing exam_name`); continue; }
      const examId = examByName.get(examName.toLowerCase());
      if (!examId) { errors.push(`Row ${rowNum}: exam "${examName}" not found`); continue; }

      const rawType = (row["type"] || "MCQ").toUpperCase();
      const type = rawType === "TRUE_FALSE" ? "TRUE_FALSE" : "MCQ";

      let options: { id: string; text: string }[];
      let correctOptionId: string;

      if (type === "TRUE_FALSE") {
        options = [
          { id: "true", text: "True" },
          { id: "false", text: "False" },
        ];
        const raw = (row["correct_option"] || "").toLowerCase();
        correctOptionId = raw === "false" ? "false" : "true";
      } else {
        const optA = row["option_a"] || "";
        const optB = row["option_b"] || "";
        const optC = row["option_c"] || "";
        const optD = row["option_d"] || "";
        if (!optA || !optB) { errors.push(`Row ${rowNum}: MCQ needs at least option_a and option_b`); continue; }
        options = [
          { id: "a", text: optA },
          { id: "b", text: optB },
        ];
        if (optC) options.push({ id: "c", text: optC });
        if (optD) options.push({ id: "d", text: optD });
        const rawCorrect = (row["correct_option"] || "a").toLowerCase();
        correctOptionId = ["a", "b", "c", "d"].includes(rawCorrect) ? rawCorrect : "a";
      }

      const explanation = row["explanation"] || "";
      const preamble = row["preamble"] || null;

      let challengeSetId: string | null = null;
      const csTitle = row["challenge_set_title"];
      if (csTitle) {
        const cs = challengeSets.find(
          (c) => c.examId === examId && c.title.toLowerCase() === csTitle.toLowerCase()
        );
        if (cs) {
          challengeSetId = cs.id;
        } else {
          errors.push(`Row ${rowNum}: challenge set "${csTitle}" not found for exam "${examName}" — skipping set assignment`);
        }
      }

      // Upsert by (examId + text)
      const existing = await prisma.question.findFirst({
        where: { examId, text },
      });

      if (existing) {
        await prisma.question.update({
          where: { id: existing.id },
          data: { type, options, correctOptionId, explanation, preamble, challengeSetId },
        });
        updated++;
      } else {
        await prisma.question.create({
          data: { text, preamble, type, options, correctOptionId, explanation, examId, challengeSetId },
        });
        created++;
      }
    } catch (err) {
      errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ created, updated, errors });
}
