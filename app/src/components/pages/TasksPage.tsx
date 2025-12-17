"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getCurrentAppDate } from "@/lib/dateFormatting";
import { useDashboardSnapshot } from "@/hooks/useDashboardSnapshot";
import { Plus } from "lucide-react";

export function TasksPage() {
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

  return <TasksPageContent initialDate={initialDate} />;
}

function TasksPageContent({ initialDate }: { initialDate: string }) {
  const {
    snapshot,
    selectedDate,
    addTask,
    updateTaskStatus,
    removeTask,
    changeDate,
    setSelectedDate,
  } = useDashboardSnapshot(initialDate);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [taskDueTime, setTaskDueTime] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask(taskTitle, taskPriority, taskDueTime || undefined);
    setTaskTitle("");
    setTaskDueTime("");
  };

  const formattedDate = format(new Date(selectedDate), "yyyy年MM月dd日 (E)", { locale: ja });

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">タスク管理</h1>
        
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">{formattedDate}</h2>
          
          <form onSubmit={handleAddTask} className="mb-6 space-y-3">
            <input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="タスクを追加..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-slate-900"
            />
            <div className="flex gap-2">
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as "high" | "medium" | "low")}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-slate-900"
              >
                <option value="high">優先度: 高</option>
                <option value="medium">優先度: 中</option>
                <option value="low">優先度: 低</option>
              </select>
              <input
                value={taskDueTime}
                onChange={(e) => setTaskDueTime(e.target.value)}
                type="time"
                className="w-32 rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-slate-900"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white transition hover:bg-amber-700"
            >
              <Plus className="h-4 w-4" />
              タスクを追加
            </button>
          </form>

          <div className="space-y-3">
            {snapshot.tasks.length === 0 ? (
              <p className="text-center text-slate-500">タスクがありません</p>
            ) : (
              snapshot.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 p-4"
                >
                  <button
                    type="button"
                    onClick={() => updateTaskStatus(task.id, task.status === "done" ? "pending" : "done")}
                    className={`h-5 w-5 rounded-full border-2 ${
                      task.status === "done"
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-300"
                    }`}
                  />
                  <div className="flex-1">
                    <p className={`font-semibold ${
                      task.status === "done" ? "text-slate-400 line-through" : "text-slate-900"
                    }`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      優先度: {task.priority === "high" ? "高" : task.priority === "medium" ? "中" : "低"}
                      {task.dueTime && ` / ${task.dueTime}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
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

