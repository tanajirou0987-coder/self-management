"use client";

import { useState, useEffect } from "react";
import { getCurrentAppDate } from "@/lib/dateFormatting";
import { useDashboardSnapshot } from "@/hooks/useDashboardSnapshot";
import type { Mood } from "@/types/dashboard";

const moodLabels: Record<Mood, string> = {
  great: "最高",
  good: "良い",
  ok: "普通",
  bad: "疲れ気味",
};

export function ReflectionPage() {
  const [initialDate, setInitialDate] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setInitialDate(getCurrentAppDate()), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!initialDate) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">読み込んでいます...</p>
      </div>
    );
  }

  return <ReflectionPageContent initialDate={initialDate} />;
}

function ReflectionPageContent({ initialDate }: { initialDate: string }) {
  const {
    snapshot,
    updateReflectionNotes,
    updateReflectionMood,
    toggleReflectionChecklist,
  } = useDashboardSnapshot(initialDate);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">1日の振り返り</h1>
        
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">今日の気分</h2>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(moodLabels) as Mood[]).map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => updateReflectionMood(mood)}
                  className={`rounded-full px-4 py-2 font-semibold transition ${
                    snapshot.reflection?.mood === mood
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {moodLabels[mood]}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">振り返り</h2>
            <textarea
              value={snapshot.reflection?.notes ?? ""}
              onChange={(e) => updateReflectionNotes(e.target.value)}
              placeholder="気づき、学び、感謝を書き留める..."
              className="h-48 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">チェックリスト</h2>
            <div className="space-y-3">
              {snapshot.reflection?.checklist?.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleReflectionChecklist(item.id)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className={`flex-1 ${
                    item.checked ? "text-slate-400 line-through" : "text-slate-700"
                  }`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

