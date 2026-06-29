"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ImportResult = {
  imported: number;
  failed: number;
  errors: { row: number; message: string }[];
};

const SAMPLE = `examId,challengeSetId,type,text,preamble,correctOptionId,explanation,optionA,optionB,optionC,optionD
claude-architect-v1,,MCQ,What does stop_reason "tool_use" indicate?,,b,Continue the agentic loop and execute the requested tools.,The model is done,The model wants to call a tool,An error occurred,The context is full`;

export default function CsvImport() {
  const router = useRouter();
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setCsv(await file.text());
  }

  async function submit() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok && data.error) {
        setError(data.error);
      } else {
        setResult(data as ImportResult);
        if (data.imported > 0) router.refresh();
      }
    } catch {
      setError("Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-100 shadow p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-700 mb-2">Bulk Import (CSV)</h2>
      <p className="text-xs text-gray-500 mb-3">
        Header row required. Columns: <code>examId, challengeSetId, type, text, preamble, correctOptionId, explanation, optionA-D</code>.
        <code>type</code> is <code>MCQ</code> or <code>TRUE_FALSE</code>.
      </p>
      <input type="file" accept=".csv,text/csv" onChange={onFile} className="block text-xs mb-2" data-testid="csv-file" />
      <textarea
        name="csv"
        data-testid="csv-text"
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={6}
        placeholder={SAMPLE}
        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:border-emerald-400 outline-none"
      />
      <div className="flex items-center gap-3 mt-3">
        <button
          type="button"
          onClick={submit}
          disabled={busy || csv.trim() === ""}
          data-testid="csv-import-btn"
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors"
        >
          {busy ? "Importing…" : "Import Questions"}
        </button>
        <button
          type="button"
          onClick={() => setCsv(SAMPLE)}
          className="text-xs text-emerald-700 hover:underline font-semibold"
        >
          Load sample
        </button>
      </div>

      {error && (
        <p data-testid="csv-error" className="mt-3 text-sm text-red-600 font-semibold">{error}</p>
      )}
      {result && (
        <div data-testid="csv-result" className="mt-3 text-sm">
          <p className="font-semibold text-emerald-700">
            Imported {result.imported}{result.failed ? `, ${result.failed} failed` : ""}.
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-1 text-xs text-red-600 list-disc list-inside">
              {result.errors.map((e, i) => (
                <li key={i}>Row {e.row}: {e.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
