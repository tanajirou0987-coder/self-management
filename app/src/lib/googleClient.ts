"use client";

import type { CalendarEvent, GoogleTask } from "@/types/dashboard";

export const fetchGoogleEvents = async (date: string) => {
  try {
    const response = await fetch(`/api/google/sync?date=${date}`);
    const payload = (await response.json().catch(() => ({}))) as {
      events?: CalendarEvent[];
      message?: string;
    };
    if (!response.ok) {
      throw new Error(
        payload?.message ?? "Google カレンダー同期に失敗しました",
      );
    }
    return payload.events ?? [];
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Google カレンダーとの連携に失敗しました",
    );
  }
};

export const createGoogleEvent = async (event: {
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}) => {
  const response = await fetch("/api/google/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message ?? "予定の作成に失敗しました");
  }
  return payload.event as CalendarEvent;
};

export const deleteGoogleEvent = async (eventId: string) => {
  const response = await fetch(`/api/google/sync?eventId=${eventId}`, {
    method: "DELETE",
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message ?? "予定の削除に失敗しました");
  }
  return payload.success;
};

export const fetchGoogleTasks = async (date: string) => {
  try {
    const response = await fetch(`/api/google/tasks?date=${date}`);
    const payload = (await response.json().catch(() => ({}))) as {
      tasks?: GoogleTask[];
      message?: string;
    };
    if (!response.ok) {
      throw new Error(
        payload?.message ?? "Google Tasks 同期に失敗しました",
      );
    }
    return payload.tasks ?? [];
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Google Tasks との連携に失敗しました",
    );
  }
};

export const completeGoogleTask = async (taskId: string, listId: string) => {
  const response = await fetch("/api/google/tasks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId, listId, status: "completed" }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message ?? "タスクの完了に失敗しました");
  }
  return payload.success;
};

export const deleteGoogleTask = async (taskId: string, listId: string) => {
  const response = await fetch(
    `/api/google/tasks?taskId=${taskId}&listId=${listId}`,
    { method: "DELETE" },
  );
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message ?? "タスクの削除に失敗しました");
  }
  return payload.success;
};

export const createGoogleTask = async (task: {
  title: string;
  notes?: string;
  due?: string;
}) => {
  const response = await fetch("/api/google/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message ?? "タスクの作成に失敗しました");
  }
  return payload.task;
};
