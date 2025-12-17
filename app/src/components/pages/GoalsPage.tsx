"use client";

import { useState, useEffect } from "react";
import { getCurrentAppDate } from "@/lib/dateFormatting";
import { useDashboardSnapshot } from "@/hooks/useDashboardSnapshot";
import { Plus } from "lucide-react";

export function GoalsPage() {
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

  return <GoalsPageContent initialDate={initialDate} />;
}

function GoalsPageContent({ initialDate }: { initialDate: string }) {
  const {
    snapshot,
    addGoal,
    toggleGoal,
    removeGoal,
  } = useDashboardSnapshot(initialDate);

  const [goalTitle, setGoalTitle] = useState("");
  const [goalDetail, setGoalDetail] = useState("");

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    addGoal(goalTitle, goalDetail || undefined);
    setGoalTitle("");
    setGoalDetail("");
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">目標管理</h1>
        
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">翌日の目標</h2>
          
          <form onSubmit={handleAddGoal} className="mb-6 space-y-3">
            <input
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="目標のタイトル"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-slate-900"
            />
            <textarea
              value={goalDetail}
              onChange={(e) => setGoalDetail(e.target.value)}
              placeholder="補足メモ (任意)"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-slate-900"
              rows={3}
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              目標を追加
            </button>
          </form>

          <div className="space-y-3">
            {snapshot.goalsForTomorrow?.length === 0 ? (
              <p className="text-center text-slate-500">目標がありません</p>
            ) : (
              snapshot.goalsForTomorrow?.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-start gap-4 rounded-xl border border-slate-100 p-4"
                >
                  <button
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={`mt-1 h-5 w-5 rounded-full border-2 ${
                      goal.completed
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-300"
                    }`}
                  />
                  <div className="flex-1">
                    <p className={`font-semibold ${
                      goal.completed ? "text-slate-400 line-through" : "text-slate-900"
                    }`}>
                      {goal.title}
                    </p>
                    {goal.detail && (
                      <p className="mt-1 text-sm text-slate-500">{goal.detail}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGoal(goal.id)}
                    className="text-sm text-slate-400 hover:text-red-500"
                  >
                    削除
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

