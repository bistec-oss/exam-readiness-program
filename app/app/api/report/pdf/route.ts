import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId");

  const [user, exams, attempts, mockAttempts, allChallengeSets] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, email: true } }),
    examId
      ? prisma.exam.findMany({ where: { id: examId }, select: { id: true, name: true, passingScore: true } })
      : prisma.exam.findMany({ select: { id: true, name: true, passingScore: true } }),
    prisma.attempt.findMany({
      where: { userId: session.userId },
      include: { challengeSet: { select: { title: true, topic: true, examId: true } } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.mockAttempt.findMany({
      where: { userId: session.userId },
      include: { exam: { select: { name: true, passingScore: true } } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.challengeSet.findMany({ select: { id: true, title: true, examId: true } }),
  ]);

  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const pdfReady = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // Header
  doc.fontSize(22).fillColor("#7c3aed").text("Exam Readiness Report", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor("#6b7280").text(
    `Candidate: ${user?.name ?? session.email}  |  ${user?.email ?? ""}`,
    { align: "center" }
  );
  doc.fontSize(10).fillColor("#9ca3af").text(
    `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    { align: "center" }
  );
  doc.moveDown(1);

  for (const exam of exams) {
    const examAttempts = attempts.filter((a) => a.challengeSet?.examId === exam.id);
    const examMocks = mockAttempts.filter((m) => m.examId === exam.id);

    const avgChallenge =
      examAttempts.length === 0
        ? 0
        : examAttempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / examAttempts.length;
    const bestMock =
      examMocks.length === 0 ? 0 : Math.max(...examMocks.map((m) => (m.score / m.total) * 100));
    const readiness = Math.round(avgChallenge * 0.5 + bestMock * 0.5);

    // Exam header
    doc.fontSize(16).fillColor("#1f2937").text(exam.name);
    doc.moveDown(0.2);
    doc.fontSize(11).fillColor("#374151")
      .text(`Readiness: ${readiness}%  |  Passing score: ${exam.passingScore}%  |  Status: ${readiness >= exam.passingScore ? "✓ READY" : "✗ Not ready"}`);
    doc.moveDown(0.5);

    // Mock exam history
    if (examMocks.length > 0) {
      doc.fontSize(12).fillColor("#4b5563").text("Mock Exam History:");
      doc.moveDown(0.2);
      for (const m of examMocks.slice(0, 5)) {
        const pct = Math.round((m.score / m.total) * 100);
        const pass = pct >= exam.passingScore;
        doc.fontSize(10).fillColor(pass ? "#16a34a" : "#dc2626")
          .text(`  ${m.completedAt.toLocaleDateString()}  —  ${m.score}/${m.total}  (${pct}%)  ${pass ? "PASS" : "FAIL"}`);
      }
      doc.moveDown(0.5);
    }

    // Challenge set completion
    const examSets = allChallengeSets.filter((cs) => cs.examId === exam.id);
    if (examSets.length > 0) {
      doc.fontSize(12).fillColor("#4b5563").text("Challenge Sets:");
      doc.moveDown(0.2);
      for (const cs of examSets) {
        const done = examAttempts.some((a) => a.challengeSetId === cs.id);
        doc.fontSize(10).fillColor(done ? "#16a34a" : "#9ca3af")
          .text(`  ${done ? "✓" : "○"}  ${cs.title}`);
      }
      doc.moveDown(0.5);
    }

    // Weak topics
    const weakTopics = examAttempts
      .filter((a) => (a.score / a.total) < 0.6 && a.challengeSet?.topic)
      .map((a) => a.challengeSet!.topic!)
      .filter((t, i, arr) => arr.indexOf(t) === i);

    if (weakTopics.length > 0) {
      doc.fontSize(12).fillColor("#d97706").text("Weak Topics:");
      doc.moveDown(0.2);
      for (const t of weakTopics) {
        doc.fontSize(10).fillColor("#b45309").text(`  • ${t}`);
      }
      doc.moveDown(0.5);
    }

    doc.moveDown(0.5);
    if (exams.indexOf(exam) < exams.length - 1) {
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e5e7eb").stroke();
      doc.moveDown(0.5);
    }
  }

  doc.end();
  const pdfBuffer = await pdfReady;

  const safeName = (user?.name ?? "report").replace(/[^a-z0-9]/gi, "_").toLowerCase();
  // Slice ensures the ArrayBuffer view covers exactly our bytes (Buffer may share a larger backing store)
  const arrayBuffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength) as ArrayBuffer;
  return new Response(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}_readiness_report.pdf"`,
    },
  });
}
