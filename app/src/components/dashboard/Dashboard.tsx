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
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
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
          </div>
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
