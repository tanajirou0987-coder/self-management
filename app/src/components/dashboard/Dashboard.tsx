"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import clsx from "clsx";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListTodo,
  Loader2,
  Plus,
  RefreshCcw,
} from "lucide-react";
import { useDashboardSnapshot } from "@/hooks/useDashboardSnapshot";
import type { Mood, TaskPriority, TaskStatus } from "@/types/dashboard";
import { getCurrentAppDate } from "@/lib/dateFormatting";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";

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
    addTodayGoal,
    toggleTodayGoal,
    removeTodayGoal,
    updateTodayGoal,
    updateReflectionNotes,
    updateReflectionMood,
    toggleReflectionChecklist,
    addTemplateItem,
    removeTemplateItem,
    updateTemplateItem,
    syncGoogleCalendar,
    changeDate,
    setSelectedDate,
  } = useDashboardSnapshot(initialDate);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [taskDueTime, setTaskDueTime] = useState("");

  const [goalTitle, setGoalTitle] = useState("");
  const [goalDetail, setGoalDetail] = useState("");

  const [todayGoalTitle, setTodayGoalTitle] = useState("");
  const [todayGoalDetail, setTodayGoalDetail] = useState("");
  const [showTodayGoalsModal, setShowTodayGoalsModal] = useState(false);

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

  const handleAddTodayGoal = (event: React.FormEvent) => {
    event.preventDefault();
    if (!todayGoalTitle.trim()) return;
    addTodayGoal({ title: todayGoalTitle.trim(), detail: todayGoalDetail || undefined });
    setTodayGoalTitle("");
    setTodayGoalDetail("");
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





  const formattedDate = format(new Date(selectedDate), "yyyy年MM月dd日 (E)", { locale: ja });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row lg:h-screen">
      {/* サイドバー */}
      <aside className="w-full border-b border-slate-100 bg-white shadow-lg lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:h-screen lg:w-80 lg:flex-shrink-0 lg:border-b-0 lg:border-r lg:overflow-y-auto">
        <div className="flex h-full flex-col p-6">
          {/* サイドバーヘッダー */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">自己管理アプリ</h1>
          </div>

          {/* 日付ナビゲーション */}
          <div className="mb-6 rounded-2xl bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => changeDate(-1)}
                className="rounded-full p-2 text-slate-600 hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(initialDate)}
                className="text-sm font-semibold text-slate-900"
              >
                今日
              </button>
              <button
                type="button"
                onClick={() => changeDate(1)}
                className="rounded-full p-2 text-slate-600 hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <p className="text-center text-sm text-slate-600">{formattedDate}</p>
          </div>

          {/* 統計情報 */}
          <div className="mb-6 space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white">
              <p className="text-sm text-slate-300">タスク進捗</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-4xl font-bold">{summary.taskProgress}%</p>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-600">
                <div
                  className="h-2 rounded-full bg-white transition-all"
                  style={{ width: `${summary.taskProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-300">
                {summary.events.length}件の予定
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowTodayGoalsModal(true)}
              className="w-full rounded-2xl bg-white p-4 text-left shadow-sm transition hover:bg-slate-50"
            >
              <p className="text-sm text-slate-500">今日の目標</p>
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
            </button>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">同期状況</p>
              <div className="mt-2 flex items-center gap-2">
                {syncState.status === "loading" || syncState.status === "saving" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                <span className="text-sm font-semibold text-slate-900">
                  {syncState.message}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Supabase & ローカルへ自動保存
              </p>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="mt-auto space-y-2">
            <QRCodeGenerator />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ログアウト
            </button>
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 lg:ml-80">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">

        {/* 予定とタスクの統合表示セクション */}
        <section className="mb-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">今日の予定とタスク</h2>
                <p className="text-sm text-slate-500">予定とタスクを時系列で表示</p>
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

            {/* 統合された予定とタスクのリスト */}
            {(() => {
              // すべての予定とタスクを時系列でソート
              const allItems: Array<{
                type: "event" | "googleTask" | "task";
                id: string;
                time: string;
                data: any;
              }> = [];

              // Calendar Events
              snapshot.events.forEach((event) => {
                allItems.push({
                  type: "event",
                  id: event.id,
                  time: event.start,
                  data: event,
                });
              });

              // Google Tasks
              (snapshot.googleTasks ?? []).forEach((task) => {
                allItems.push({
                  type: "googleTask",
                  id: task.id,
                  time: task.due || new Date().toISOString(),
                  data: task,
                });
              });

              // ローカルのタスク
              snapshot.tasks.forEach((task) => {
                allItems.push({
                  type: "task",
                  id: task.id,
                  time: task.dueTime
                    ? `${selectedDate}T${task.dueTime}:00`
                    : new Date().toISOString(),
                  data: task,
                });
              });

              // 時系列でソート
              allItems.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

              if (allItems.length === 0) {
                return (
                  <p className="text-sm text-slate-500">
                    予定やタスクが見つかりませんでした。追加してください。
                  </p>
                );
              }

              return (
                <div className="space-y-4">
                  {allItems.map((item) => {
                    if (item.type === "event") {
                      const event = item.data;
                      return (
                        <article
                          key={`event-${event.id}`}
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
                              <p className="text-xs text-slate-400">{event.location}</p>
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
                      );
                    }

                    if (item.type === "googleTask") {
                      const task = item.data;
                      return (
                        <article
                          key={`google-task-${task.id}`}
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
                          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                            <ListTodo className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p
                              className={clsx("text-sm font-semibold", {
                                "text-slate-400 line-through": task.status === "completed",
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
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            タスク
                          </span>
                        </article>
                      );
                    }

                    // ローカルのタスク
                    const task = item.data;
                    return (
                      <article
                        key={`task-${task.id}`}
                        className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4"
                      >
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(task.id, statusCycle[task.status])}
                          className={clsx(
                            "flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-2 hover:border-emerald-500",
                            task.status === "done"
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-slate-300",
                          )}
                        >
                          {task.status === "done" && (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          )}
                        </button>
                        <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                          <Clock3 className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p
                            className={clsx("text-sm font-semibold", {
                              "text-slate-400 line-through": task.status === "done",
                              "text-slate-900": task.status !== "done",
                            })}
                          >
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            優先度: {priorityLabels[task.priority]}
                            {task.dueTime && ` / 目安 ${task.dueTime}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          className="text-xs text-slate-400 underline-offset-4 hover:text-red-500 hover:underline"
                        >
                          削除
                        </button>
                        <span
                          className={clsx("rounded-full px-3 py-1 text-xs font-semibold", {
                            "bg-amber-100 text-amber-700": task.status === "pending",
                            "bg-blue-100 text-blue-700": task.status === "in-progress",
                            "bg-emerald-100 text-emerald-700": task.status === "done",
                          })}
                        >
                          {task.status === "pending"
                            ? "未着手"
                            : task.status === "in-progress"
                              ? "進行中"
                              : "完了"}
                        </span>
                      </article>
                    );
                  })}
                </div>
              );
            })()}

            {/* 追加フォーム */}
            <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
              {/* Google Task追加フォーム */}
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
                className="flex gap-2"
              >
                <input
                  value={newGoogleTaskTitle}
                  onChange={(e) => setNewGoogleTaskTitle(e.target.value)}
                  placeholder="Googleタスクを追加..."
                  className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  追加
                </button>
              </form>

              {/* 予定追加フォーム */}
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
                className="space-y-3"
              >
                <input
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="予定を追加..."
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

              {/* ローカルタスク追加フォーム */}
              <form onSubmit={handleAddTask} className="space-y-3">
                <input
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="タスクを追加..."
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
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  <Plus className="h-4 w-4" />
                  タスクを追加
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* 編集タブセクション（夜のレポート） */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
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

          {isLoading && (
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur">
              <Loader2 className="h-10 w-10 animate-spin text-slate-700" />
            </div>
          )}

          {/* 今日の目標編集モーダル */}
          {showTodayGoalsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-slate-900">今日の目標</h2>
                  <button
                    type="button"
                    onClick={() => setShowTodayGoalsModal(false)}
                    className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {(snapshot.goals ?? []).map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTodayGoal(goal.id)}
                        className={clsx(
                          "mt-1 h-5 w-5 rounded-full border-2",
                          goal.completed
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-slate-300",
                        )}
                      />
                      <div className="flex-1">
                        <input
                          value={goal.title}
                          onChange={(e) => updateTodayGoal(goal.id, { title: e.target.value })}
                          className="w-full rounded-lg border border-transparent px-2 py-1 text-sm font-semibold outline-none focus:border-slate-200 focus:bg-slate-50"
                          placeholder="目標のタイトル"
                        />
                        <textarea
                          value={goal.detail || ""}
                          onChange={(e) => updateTodayGoal(goal.id, { detail: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-transparent px-2 py-1 text-xs text-slate-500 outline-none focus:border-slate-200 focus:bg-slate-50"
                          placeholder="補足メモ (任意)"
                          rows={2}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTodayGoal(goal.id)}
                        className="text-xs text-slate-400 underline-offset-4 hover:text-red-500 hover:underline"
                      >
                        削除
                      </button>
                    </div>
                  ))}

                  <form onSubmit={handleAddTodayGoal} className="space-y-3 rounded-2xl border border-dashed border-slate-200 p-4">
                    <input
                      value={todayGoalTitle}
                      onChange={(e) => setTodayGoalTitle(e.target.value)}
                      placeholder="新しい目標を追加..."
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                    />
                    <textarea
                      value={todayGoalDetail}
                      onChange={(e) => setTodayGoalDetail(e.target.value)}
                      placeholder="補足メモ (任意)"
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                      rows={2}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
