"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import clsx from "clsx";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock3,
  Loader2,
  Plus,
  RefreshCcw,
} from "lucide-react";
import { useDashboardSnapshot } from "@/hooks/useDashboardSnapshot";
import type { Mood, TaskPriority, TaskStatus } from "@/types/dashboard";
import { getCurrentAppDate } from "@/lib/dateFormatting";

const moodLabels: Record<Mood, string> = {
  great: "最高",
  good: "良い",
  ok: "普通",
  bad: "疲れ気味",
};

const priorityLabels: Record<TaskPriority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const statusCycle: Record<TaskStatus, TaskStatus> = {
  pending: "in-progress",
  "in-progress": "done",
  done: "pending",
};

const formatRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const isSameDay = startDate.toDateString() === endDate.toDateString();
  const day = format(startDate, "MM/dd");
  const time = `${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`;
  return `${isSameDay ? day : `${day} ~ ${format(endDate, "MM/dd")}`} ${time}`;
};

// ... imports

export const Dashboard = () => {
  const [initialDate, setInitialDate] = useState<string | null>(null);

  useEffect(() => {
    // Postpone state update to next tick to avoid synchronous render warning
    const timer = setTimeout(() => setInitialDate(getCurrentAppDate()), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!initialDate) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        ダッシュボードを読み込んでいます...
      </main>
    );
  }

  return <DashboardContent initialDate={initialDate} />;
};

const DashboardContent = ({ initialDate }: { initialDate: string }) => {
  const router = useRouter();
  const {
    snapshot,
    summary,
    isLoading,
    syncState,
    selectedDate,

    addTask,
    updateTaskStatus,
    removeTask,
    addGoal,
    toggleGoal,
    removeGoal,
    updateReflectionNotes,
    updateReflectionMood,
    toggleReflectionChecklist,
    addTemplateItem,
    removeTemplateItem,
    updateTemplateItem,
    syncGoogleCalendar,
    syncGitHub,
  } = useDashboardSnapshot(initialDate);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [taskDueTime, setTaskDueTime] = useState("");

  const [goalTitle, setGoalTitle] = useState("");
  const [goalDetail, setGoalDetail] = useState("");

  const [templateLabel, setTemplateLabel] = useState("");
  const [templateCategory, setTemplateCategory] = useState("reflection");
  const planningTabs = [
    { id: "goals", label: "翌日の目標" },
    { id: "reflection", label: "1日の振り返り" },
    { id: "checklist", label: "チェックリストテンプレ" },
  ] as const;
  type PlanningTab = (typeof planningTabs)[number]["id"];
  const [activePlanningTab, setActivePlanningTab] =
    useState<PlanningTab>("reflection");

  // New event form state
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStart, setNewEventStart] = useState("");
  const [newEventEnd, setNewEventEnd] = useState("");

  // New Google Task form state
  const [newGoogleTaskTitle, setNewGoogleTaskTitle] = useState("");


  const incompleteTaskCount = snapshot.tasks.filter(
    (task) => task.status !== "done",
  ).length;
  const hasIncompleteTasks = incompleteTaskCount > 0;
  const [reportReminderVisible, setReportReminderVisible] = useState(false);

  const handleEveningReportFocus = () => {
    if (hasIncompleteTasks) {
      setReportReminderVisible(true);
    }
  };

  useEffect(() => {
    if (!hasIncompleteTasks) {
      setReportReminderVisible(false);
    }
  }, [hasIncompleteTasks]);

  useEffect(() => {
    setReportReminderVisible(false);
  }, [selectedDate]);

  const handleAddTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    addTask(taskTitle.trim(), taskPriority, taskDueTime || undefined);
    setTaskTitle("");
    setTaskDueTime("");
    setTaskPriority("medium");
  };

  const handleAddGoal = (event: React.FormEvent) => {
    event.preventDefault();
    if (!goalTitle.trim()) return;
    addGoal({ title: goalTitle.trim(), detail: goalDetail || undefined });
    setGoalTitle("");
    setGoalDetail("");
  };

  const handleAddTemplateItem = (event: React.FormEvent) => {
    event.preventDefault();
    if (!templateLabel.trim()) return;
    addTemplateItem(templateLabel.trim(), templateCategory);
    setTemplateLabel("");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };





  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            ログアウト
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">タスク進捗</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-semibold text-slate-900">
                {summary.taskProgress}%
              </p>
              <p className="text-sm text-slate-500">
                {summary.events.length}件の予定
              </p>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-slate-900 transition-all"
                style={{ width: `${summary.taskProgress}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">次の目標</p>
            <div className="mt-2 space-y-1">
              {summary.goals.filter((goal) => !goal.completed).length === 0 ? (
                <p className="text-sm text-slate-400">目標がありません</p>
              ) : (
                summary.goals
                  .filter((goal) => !goal.completed)
                  .slice(0, 3)
                  .map((goal) => (
                    <p key={goal.id} className="text-sm font-medium text-slate-900 truncate">
                      • {goal.title}
                    </p>
                  ))
              )}
              {summary.goals.filter((goal) => !goal.completed).length > 3 && (
                <p className="text-xs text-slate-500">
                  +{summary.goals.filter((goal) => !goal.completed).length - 3}件
                </p>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">同期状況</p>
            <div className="mt-2 flex items-center gap-2">
              {syncState.status === "loading" ||
                syncState.status === "saving" ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              )}
              <span className="text-base font-semibold text-slate-900">
                {syncState.message}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Supabase & ローカルへ自動保存
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <header className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Google カレンダー</p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    今日の予定
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={syncGoogleCalendar}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RefreshCcw className="h-4 w-4" />
                  同期
                </button>
              </header>
              {snapshot.events.length === 0 && (
                <p className="text-sm text-slate-500">
                  予定が見つかりませんでした。Google カレンダーと同期するか手動で追加してください。
                </p>
              )}
              <div className="space-y-4">
                {snapshot.events.map((event) => (
                  <article
                    key={event.id}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4"
                  >
                    <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-900">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {event.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatRange(event.start, event.end)}
                      </p>
                      {event.location && (
                        <p className="text-xs text-slate-400">
                          {event.location}
                        </p>
                      )}
                    </div>
                    {event.source === "google" && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const { deleteGoogleEvent } = await import("@/lib/googleClient");
                            await deleteGoogleEvent(event.id);
                            syncGoogleCalendar();
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="text-xs text-slate-400 underline-offset-4 hover:text-red-500 hover:underline"
                      >
                        削除
                      </button>
                    )}
                    <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-700">
                      {event.source === "google" ? "Google" : "手動"}
                    </span>
                  </article>
                ))}
              </div>
              {/* Add Event form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newEventTitle.trim() || !newEventStart || !newEventEnd) return;
                  try {
                    const { createGoogleEvent } = await import("@/lib/googleClient");
                    await createGoogleEvent({
                      title: newEventTitle.trim(),
                      start: new Date(`${selectedDate}T${newEventStart}`).toISOString(),
                      end: new Date(`${selectedDate}T${newEventEnd}`).toISOString(),
                    });
                    setNewEventTitle("");
                    setNewEventStart("");
                    setNewEventEnd("");
                    syncGoogleCalendar();
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="mt-4 space-y-3"
              >
                <input
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="新しい予定を追加..."
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                />
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newEventStart}
                    onChange={(e) => setNewEventStart(e.target.value)}
                    className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                    placeholder="開始"
                  />
                  <input
                    type="time"
                    value={newEventEnd}
                    onChange={(e) => setNewEventEnd(e.target.value)}
                    className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                    placeholder="終了"
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  予定を追加
                </button>
              </form>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">タスク管理</h2>
              <Clock3 className="h-5 w-5 text-slate-400" />
            </header>
            <div className="space-y-4">
              {snapshot.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        優先度: {priorityLabels[task.priority]}{" "}
                        {task.dueTime && ` / 目安 ${task.dueTime}`}
                      </p>
                    </div>
                    <span
                      className={clsx(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        {
                          "bg-amber-100 text-amber-700": task.status === "pending",
                          "bg-blue-100 text-blue-700":
                            task.status === "in-progress",
                          "bg-emerald-100 text-emerald-700":
                            task.status === "done",
                        },
                      )}
                    >
                      {task.status === "pending"
                        ? "未着手"
                        : task.status === "in-progress"
                          ? "進行中"
                          : "完了"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateTaskStatus(task.id, statusCycle[task.status])
                      }
                      className="text-xs font-semibold text-slate-600 underline-offset-4 hover:underline"
                    >
                      次のステータスへ
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      className="text-xs text-slate-400 underline-offset-4 hover:text-red-500 hover:underline"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
              <form onSubmit={handleAddTask} className="space-y-3">
                <input
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="タスク名"
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                />
                <div className="flex gap-2">
                  <select
                    value={taskPriority}
                    onChange={(event) =>
                      setTaskPriority(event.target.value as TaskPriority)
                    }
                    className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  >
                    <option value="high">優先度: 高</option>
                    <option value="medium">優先度: 中</option>
                    <option value="low">優先度: 低</option>
                  </select>
                  <input
                    value={taskDueTime}
                    onChange={(event) => setTaskDueTime(event.target.value)}
                    type="time"
                    className="w-32 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  タスクを追加
                </button>
              </form>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Google Tasks</p>
                <h2 className="text-xl font-semibold text-slate-900">
                  カレンダータスク
                </h2>
              </div>
            </header>
            {(snapshot.googleTasks?.length ?? 0) === 0 && (
              <p className="text-sm text-slate-500">
                Google Tasks にタスクがありません。
              </p>
            )}
            <div className="space-y-4">
              {(snapshot.googleTasks ?? []).map((task) => (
                <article
                  key={task.id}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4"
                >
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const { completeGoogleTask } = await import("@/lib/googleClient");
                        await completeGoogleTask(task.id, task.listId);
                        syncGoogleCalendar();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className={clsx(
                      "flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-2 hover:border-emerald-500",
                      task.status === "completed"
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-300",
                    )}
                  >
                    {task.status === "completed" && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={clsx("text-sm font-semibold", {
                        "text-slate-400 line-through":
                          task.status === "completed",
                        "text-slate-900": task.status !== "completed",
                      })}
                    >
                      {task.title}
                    </p>
                    {task.notes && (
                      <p className="text-xs text-slate-500">{task.notes}</p>
                    )}
                    {task.due && (
                      <p className="text-xs text-slate-400">
                        期限: {task.due.split("T")[0]}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const { deleteGoogleTask } = await import("@/lib/googleClient");
                        await deleteGoogleTask(task.id, task.listId);
                        syncGoogleCalendar();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="text-xs text-slate-400 underline-offset-4 hover:text-red-500 hover:underline"
                  >
                    削除
                  </button>
                  <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-700">
                    {task.listName}
                  </span>
                </article>
              ))}
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newGoogleTaskTitle.trim()) return;
                try {
                  const { createGoogleTask } = await import("@/lib/googleClient");
                  await createGoogleTask({ title: newGoogleTaskTitle.trim() });
                  setNewGoogleTaskTitle("");
                  syncGoogleCalendar();
                } catch (err) {
                  console.error(err);
                }
              }}
              className="mt-4 flex gap-2"
            >
              <input
                value={newGoogleTaskTitle}
                onChange={(e) => setNewGoogleTaskTitle(e.target.value)}
                placeholder="新しいタスクを追加..."
                className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                追加
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">GitHub</p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Issues & PRs
                </h2>
              </div>
              <button
                type="button"
                onClick={syncGitHub}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw className="h-4 w-4" />
                同期
              </button>
            </header>
            {(snapshot.githubIssues?.length ?? 0) === 0 && (
              <p className="text-sm text-slate-500">
                割り当てられた Issue やレビュー待ちの PR はありません。
              </p>
            )}
            <div className="space-y-4">
              {(snapshot.githubIssues ?? []).map((issue) => (
                <a
                  key={issue.id}
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50"
                >
                  <div
                    className={clsx(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      issue.type === "pr"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-green-100 text-green-600",
                    )}
                  >
                    {issue.type === "pr" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="18" cy="18" r="3" />
                        <circle cx="6" cy="6" r="3" />
                        <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                        <line x1="6" x2="6" y1="9" y2="21" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="8" y2="12" />
                        <line x1="12" x2="12.01" y1="16" y2="16" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {issue.title}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {issue.repository} • #{issue.number}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "rounded-full px-2 py-1 text-xs font-medium",
                      issue.status === "open"
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {issue.status}
                  </span>
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">
                夜のレポート
              </h2>
              <div className="flex flex-wrap gap-2">
                {planningTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePlanningTab(tab.id)}
                    className={clsx(
                      "rounded-full px-3 py-1 text-sm font-semibold",
                      activePlanningTab === tab.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </header>

            {activePlanningTab === "goals" && (
              <div className="space-y-4">
                {(snapshot.goalsForTomorrow ?? []).map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4"
                  >
                    <button
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className={clsx(
                        "mt-1 h-5 w-5 rounded-full border-2",
                        goal.completed
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-300",
                      )}
                    />
                    <div className="flex-1">
                      <p
                        className={clsx("text-sm font-semibold", {
                          "text-slate-400 line-through": goal.completed,
                          "text-slate-900": !goal.completed,
                        })}
                      >
                        {goal.title}
                      </p>
                      {goal.detail && (
                        <p className="text-xs text-slate-500">{goal.detail}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGoal(goal.id)}
                      className="text-xs text-slate-400 underline-offset-4 hover:text-red-500 hover:underline"
                    >
                      削除
                    </button>
                  </div>
                ))}
                <form onSubmit={handleAddGoal} className="space-y-3">
                  <input
                    value={goalTitle}
                    onChange={(event) => setGoalTitle(event.target.value)}
                    onFocus={handleEveningReportFocus}
                    placeholder="目標のタイトル"
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  />
                  <textarea
                    value={goalDetail}
                    onChange={(event) => setGoalDetail(event.target.value)}
                    onFocus={handleEveningReportFocus}
                    placeholder="補足メモ (任意)"
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                    目標を追加
                  </button>
                </form>
              </div>
            )}

            {activePlanningTab === "reflection" && (
              <div>
                {reportReminderVisible && hasIncompleteTasks && (
                  <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold">今日のタスクが完了していません</p>
                      <p>
                        振り返りや目標を書く前に未完了 {incompleteTaskCount}
                        件のタスクを確認してください。
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-amber-900 underline-offset-4 hover:underline"
                      onClick={() => setReportReminderVisible(false)}
                    >
                      閉じる
                    </button>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(moodLabels) as Mood[]).map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => updateReflectionMood(mood)}
                        className={clsx(
                          "rounded-full px-4 py-2 text-sm font-semibold transition",
                          snapshot.reflection.mood === mood
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700",
                        )}
                      >
                        {moodLabels[mood]}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {snapshot.reflection.checklist.map((item) => (
                      <label
                        key={item.id}
                        className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 p-3"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleReflectionChecklist(item.id)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                        <span className="text-sm text-slate-700">
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    value={snapshot.reflection.notes}
                    onChange={(event) => updateReflectionNotes(event.target.value)}
                    onFocus={handleEveningReportFocus}
                    placeholder="気づき、学び、感謝を書き留める..."
                    className="h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            )}

            {activePlanningTab === "checklist" && (
              <div className="space-y-4">
                {snapshot.checklistTemplate.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 p-4"
                  >
                    <input
                      value={item.label}
                      onChange={(event) =>
                        updateTemplateItem(item.id, event.target.value)
                      }
                      className="w-full rounded-2xl border border-transparent px-3 py-2 text-sm outline-none focus:border-slate-200 focus:bg-slate-50"
                    />
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>{item.category ?? "custom"}</span>
                      <button
                        type="button"
                        onClick={() => removeTemplateItem(item.id)}
                        className="text-slate-400 underline-offset-4 hover:text-red-500 hover:underline"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
                <form onSubmit={handleAddTemplateItem} className="space-y-3">
                  <input
                    value={templateLabel}
                    onChange={(event) => setTemplateLabel(event.target.value)}
                    placeholder="テンプレ項目を追加"
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  />
                  <select
                    value={templateCategory}
                    onChange={(event) => setTemplateCategory(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  >
                    <option value="reflection">振り返り</option>
                    <option value="goal">目標設定</option>
                    <option value="custom">カスタム</option>
                  </select>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    <Plus className="h-4 w-4" />
                    新規項目
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>

        {isLoading && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur">
            <Loader2 className="h-10 w-10 animate-spin text-slate-700" />
          </div>
        )}
      </div>
    </div>
  );
};
