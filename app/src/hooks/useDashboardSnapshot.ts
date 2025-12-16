"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addDays, formatISO, parseISO } from "date-fns";
import { v4 as uuid } from "uuid";
import type {
  DashboardSnapshot,
  Goal,
  Mood,
  TaskPriority,
  TaskStatus,
} from "@/types/dashboard";
import { buildDefaultSnapshot } from "@/lib/defaultSnapshot";
import {
  deleteSnapshot,
  loadSnapshot,
  persistSnapshot,
} from "@/lib/snapshotStorage";
import { fetchGoogleEvents } from "@/lib/googleClient";



type SnapshotUpdater = (snapshot: DashboardSnapshot) => DashboardSnapshot;

const cloneSnapshot = (snapshot: DashboardSnapshot) =>
  typeof structuredClone === "function"
    ? structuredClone(snapshot)
    : (JSON.parse(JSON.stringify(snapshot)) as DashboardSnapshot);

export const useDashboardSnapshot = (initialDate: string) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(() =>
    buildDefaultSnapshot(initialDate),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [syncState, setSyncState] = useState<{
    status: "idle" | "loading" | "saving" | "synced" | "error";
    message: string;
  }>({
    status: "idle",
    message: "未保存",
  });

  const pendingPersist = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    queueMicrotask(() => {
      if (!isMounted) return;
      setIsLoading(true);
      setSyncState({ status: "loading", message: "データ読み込み中..." });
    });

    const loadData = async () => {
      try {
        const loaded = await loadSnapshot(selectedDate);
        if (!isMounted) return;
        let workingSnapshot = loaded ?? buildDefaultSnapshot(selectedDate);

        if (workingSnapshot.goals.length === 0) {
          const previousDate = formatISO(
            addDays(parseISO(selectedDate), -1),
            { representation: "date" },
          );
          const previousSnapshot = await loadSnapshot(previousDate);
          // Load goals from previous day's goalsForTomorrow
          const goalsForToday = previousSnapshot?.goalsForTomorrow ?? [];
          if (goalsForToday.length > 0) {
            workingSnapshot = {
              ...workingSnapshot,
              goals: goalsForToday.map((goal) => ({
                ...goal,
                id: uuid(),
                completed: false,
              })),
            };
            // Save the inherited goals to persist them
            await persistSnapshot(workingSnapshot);
          }
        }

        setSnapshot(workingSnapshot);
        setSyncState({ status: "idle", message: "最新" });

        const events = await fetchGoogleEvents(selectedDate);
        if (isMounted && events && events.length > 0) {
          setSnapshot((prev) => ({ ...prev, events }));
        }

        const { fetchGoogleTasks } = await import("@/lib/googleClient");
        const googleTasks = await fetchGoogleTasks(selectedDate);
        if (isMounted && googleTasks) {
          setSnapshot((prev) => ({ ...prev, googleTasks }));
        }

        const { fetchGitHubIssues } = await import("@/lib/githubClient");
        const githubIssues = await fetchGitHubIssues();
        if (isMounted) {
          setSnapshot((prev) => ({ ...prev, githubIssues }));
        }
      } catch (error) {
        console.error("Failed to load snapshot", error);
        if (!isMounted) return;
        setSnapshot(buildDefaultSnapshot(selectedDate));
        setSyncState({
          status: "error",
          message: "データの読み込みに失敗しました",
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const queuePersist = useCallback(
    (updated: DashboardSnapshot) => {
      if (pendingPersist.current) {
        clearTimeout(pendingPersist.current);
      }
      pendingPersist.current = setTimeout(() => {
        setSyncState({ status: "saving", message: "自動保存中..." });
        persistSnapshot(updated)
          .then((result) => {
            if (result.success) {
              setSyncState({ status: "synced", message: "自動保存済み" });
            } else {
              setSyncState({
                status: "error",
                message: "Supabase への保存に失敗しました",
              });
            }
          })
          .catch((error) => {
            setSyncState({
              status: "error",
              message: error?.message ?? "同期に失敗しました",
            });
          });
      }, 600);
    },
    [setSyncState],
  );

  useEffect(() => {
    return () => {
      if (pendingPersist.current) {
        clearTimeout(pendingPersist.current);
      }
    };
  }, []);

  const mutateSnapshot = useCallback(
    (updater: SnapshotUpdater) => {
      setSnapshot((prev) => {
        const updated = updater(cloneSnapshot(prev));
        queuePersist(updated);
        return updated;
      });
    },
    [queuePersist],
  );

  const changeDate = (delta: number) => {
    if (delta === 0) {
      setSelectedDate(initialDate);
      return;
    }
    const next = addDays(parseISO(selectedDate), delta);
    setSelectedDate(formatISO(next, { representation: "date" }));
  };

  const addTask = (title: string, priority: TaskPriority, dueTime?: string) => {
    mutateSnapshot((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        { id: uuid(), title, priority, status: "pending", dueTime },
      ],
    }));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    mutateSnapshot((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id
          ? {
            ...task,
            status,
          }
          : task,
      ),
    }));
  };

  const removeTask = (id: string) => {
    mutateSnapshot((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  };

  const addGoal = (goal: Pick<Goal, "title" | "detail">) => {
    mutateSnapshot((prev) => ({
      ...prev,
      goalsForTomorrow: [
        ...(prev.goalsForTomorrow ?? []),
        { id: uuid(), title: goal.title, detail: goal.detail, completed: false },
      ],
    }));
  };

  const toggleGoal = (id: string) => {
    mutateSnapshot((prev) => ({
      ...prev,
      goalsForTomorrow: (prev.goalsForTomorrow ?? []).map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal,
      ),
    }));
  };

  const removeGoal = (id: string) => {
    mutateSnapshot((prev) => ({
      ...prev,
      goalsForTomorrow: (prev.goalsForTomorrow ?? []).filter((goal) => goal.id !== id),
    }));
  };

  // 当日の目標を操作する関数
  const addTodayGoal = (goal: Pick<Goal, "title" | "detail">) => {
    mutateSnapshot((prev) => ({
      ...prev,
      goals: [
        ...(prev.goals ?? []),
        { id: uuid(), title: goal.title, detail: goal.detail, completed: false },
      ],
    }));
  };

  const toggleTodayGoal = (id: string) => {
    mutateSnapshot((prev) => ({
      ...prev,
      goals: (prev.goals ?? []).map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal,
      ),
    }));
  };

  const removeTodayGoal = (id: string) => {
    mutateSnapshot((prev) => ({
      ...prev,
      goals: (prev.goals ?? []).filter((goal) => goal.id !== id),
    }));
  };

  const updateTodayGoal = (id: string, updates: Partial<Pick<Goal, "title" | "detail">>) => {
    mutateSnapshot((prev) => ({
      ...prev,
      goals: (prev.goals ?? []).map((goal) =>
        goal.id === id ? { ...goal, ...updates } : goal,
      ),
    }));
  };

  const updateReflectionNotes = (notes: string) => {
    mutateSnapshot((prev) => ({
      ...prev,
      reflection: {
        ...prev.reflection,
        notes,
      },
    }));
  };

  const updateReflectionMood = (mood: Mood) => {
    mutateSnapshot((prev) => ({
      ...prev,
      reflection: {
        ...prev.reflection,
        mood,
      },
    }));
  };

  const toggleReflectionChecklist = (itemId: string) => {
    mutateSnapshot((prev) => ({
      ...prev,
      reflection: {
        ...prev.reflection,
        checklist: prev.reflection.checklist.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item,
        ),
      },
    }));
  };

  const addTemplateItem = (label: string, category?: string) => {
    const item = { id: uuid(), label, category, checked: false };
    mutateSnapshot((prev) => ({
      ...prev,
      checklistTemplate: [...prev.checklistTemplate, { ...item }],
      reflection: {
        ...prev.reflection,
        checklist: [...prev.reflection.checklist, { ...item }],
      },
    }));
  };

  const updateTemplateItem = (id: string, label: string) => {
    mutateSnapshot((prev) => ({
      ...prev,
      checklistTemplate: prev.checklistTemplate.map((item) =>
        item.id === id ? { ...item, label } : item,
      ),
      reflection: {
        ...prev.reflection,
        checklist: prev.reflection.checklist.map((item) =>
          item.id === id ? { ...item, label } : item,
        ),
      },
    }));
  };

  const removeTemplateItem = (id: string) => {
    mutateSnapshot((prev) => ({
      ...prev,
      checklistTemplate: prev.checklistTemplate.filter((item) => item.id !== id),
      reflection: {
        ...prev.reflection,
        checklist: prev.reflection.checklist.filter((item) => item.id !== id),
      },
    }));
  };

  const syncGoogleCalendar = useCallback(async () => {
    setSyncState({ status: "loading", message: "Google カレンダー同期中..." });
    try {
      const events = await fetchGoogleEvents(selectedDate);
      if (events.length === 0) {
        setSyncState({ 
          status: "synced", 
          message: "同期しました（予定が見つかりませんでした）" 
        });
      } else {
        mutateSnapshot((prev) => ({
          ...prev,
          events,
        }));
        setSyncState({ 
          status: "synced", 
          message: `Google カレンダーと同期しました（${events.length}件の予定）` 
        });
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setSyncState({
        status: "error",
        message: errorMessage || "Google カレンダーとの同期で問題が発生しました",
      });
    }
  }, [mutateSnapshot, selectedDate]);

  const syncGitHub = useCallback(async () => {
    setSyncState({ status: "loading", message: "GitHub 同期中..." });
    try {
      const { fetchGitHubIssues } = await import("@/lib/githubClient");
      const issues = await fetchGitHubIssues();
      mutateSnapshot((prev) => ({
        ...prev,
        githubIssues: issues,
      }));
      setSyncState({ status: "synced", message: "GitHub と同期しました" });
    } catch (error) {
      console.error(error);
      setSyncState({
        status: "error",
        message: "GitHub との同期に失敗しました",
      });
    }
  }, [mutateSnapshot]);

  const summary = useMemo(() => {
    const completedTasks = snapshot.tasks.filter((task) => task.status === "done")
      .length;
    const progress =
      snapshot.tasks.length === 0
        ? 0
        : Math.round((completedTasks / snapshot.tasks.length) * 100);
    return {
      taskProgress: progress,
      goals: snapshot.goals,
      events: snapshot.events,
    };
  }, [snapshot]);

  return {
    snapshot,
    summary,
    isLoading,
    syncState,
    selectedDate,
    setSelectedDate,
    changeDate,
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
    updateTemplateItem,
    removeTemplateItem,
    syncGoogleCalendar,
    syncGitHub,
    resetSnapshot: useCallback(async () => {
      setIsLoading(true);
      setSyncState({ status: "saving", message: "データを削除しています..." });
      try {
        const result = await deleteSnapshot(selectedDate);
        if (result?.success === false) {
          throw result.error;
        }
        setSnapshot(buildDefaultSnapshot(selectedDate));
        setSyncState({ status: "idle", message: "最新" });
      } catch (error) {
        console.error("Failed to reset snapshot", error);
        setSyncState({
          status: "error",
          message: (error as Error)?.message ?? "データの削除に失敗しました",
        });
      } finally {
        setIsLoading(false);
      }
    }, [selectedDate]),
  };
};
