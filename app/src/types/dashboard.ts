"use client";

export type CalendarEventSource = "google" | "manual";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  source: CalendarEventSource;
}

export type TaskStatus = "pending" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  dueTime?: string;
  priority: TaskPriority;
  status: TaskStatus;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  category?: string;
}

export type Mood = "great" | "good" | "ok" | "bad";

export interface ReflectionEntry {
  notes: string;
  mood: Mood;
  checklist: ChecklistItem[];
}

export interface Goal {
  id: string;
  title: string;
  detail?: string;
  completed: boolean;
  inherited?: boolean; // true if goal was copied from previous day
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: "needsAction" | "completed";
  listName: string;
  listId: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  url: string;
  repository: string;
  status: "open" | "closed" | "merged";
  type: "issue" | "pr";
}

export interface DashboardSnapshot {
  date: string; // YYYY-MM-DD
  events: CalendarEvent[];
  tasks: Task[];
  googleTasks: GoogleTask[];
  githubIssues: GitHubIssue[];
  reflection: ReflectionEntry;
  goals: Goal[]; // Goals for today (inherited from previous day's goalsForTomorrow)
  goalsForTomorrow: Goal[]; // Goals being set for tomorrow
  checklistTemplate: ChecklistItem[];
}

export interface SyncState {
  status: "idle" | "loading" | "saving" | "synced" | "error";
  message?: string;
}
