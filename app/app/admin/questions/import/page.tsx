"use client";

import { useState } from "react";
import Link from "next/link";

type ImportResult = {
  created: number;
  updated: number;
  errors: string[];
};

export default function ImportQuestionsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/questions/import", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Upload failed");
      } else {
        setResult(await res.json());
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/questions" className="text-violet-600 hover:underline text-sm">
          ← Back to Questions
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bulk Import Questions</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">CSV Format</h2>
        <p className="text-sm text-gray-500 mb-2">Required columns:</p>
        <code className="block text-xs bg-gray-50 rounded p-3 text-gray-700 overflow-x-auto">
          text, type, option_a, option_b, option_c, option_d, correct_option, explanation, exam_name, preamble, challenge_set_title
        </code>
        <ul className="text-xs text-gray-500 mt-3 space-y-1">
          <li>• <strong>type</strong>: MCQ or TRUE_FALSE</li>
          <li>• <strong>correct_option</strong>: a/b/c/d for MCQ; true/false for TRUE_FALSE</li>
          <li>• <strong>exam_name</strong>: must match an existing exam exactly</li>
          <li>• <strong>preamble</strong>, <strong>challenge_set_title</strong>: optional</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select CSV File
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-violet-100 file:text-violet-700 file:font-semibold hover:file:bg-violet-200 cursor-pointer"
            data-testid="csv-file-input"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-violet-700 transition-colors"
        >
          {loading ? "Importing…" : "Import Questions"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6" data-testid="import-result">
          <h2 className="font-semibold text-gray-800 mb-4">Import Result</h2>
          <div className="flex gap-6 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{result.created}</div>
              <div className="text-xs text-gray-500">Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{result.updated}</div>
              <div className="text-xs text-gray-500">Updated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{result.errors.length}</div>
              <div className="text-xs text-gray-500">Errors</div>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-50 rounded-xl p-3 space-y-1">
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
