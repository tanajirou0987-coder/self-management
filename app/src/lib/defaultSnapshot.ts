import { v4 as uuid } from "uuid";
import type { ChecklistItem, DashboardSnapshot } from "@/types/dashboard";

const BASE_TEMPLATE: ChecklistItem[] = [
  {
    id: "gratitude",
    label: "今日よかったことを3つ挙げる",
    checked: false,
    category: "reflection",
  },
  {
    id: "energy",
    label: "エネルギーレベルを自己評価する",
    checked: false,
    category: "reflection",
  },
  {
    id: "improvement",
    label: "改善したいことを具体化する",
    checked: false,
    category: "reflection",
  },
  {
    id: "tomorrow_focus",
    label: "明日のフォーカスポイントを1つ決める",
    checked: false,
    category: "goal",
  },
];

export function buildTemplateClone(): ChecklistItem[] {
  return BASE_TEMPLATE.map((item) => ({
    ...item,
    checked: false,
    id: `${item.id}-${uuid()}`,
  }));
}

export function buildDefaultSnapshot(date: string): DashboardSnapshot {
  return {
    date,
    events: [],
    tasks: [],
    googleTasks: [],
    githubIssues: [],
    reflection: {
      mood: "ok",
      notes: "",
      checklist: buildTemplateClone(),
    },
    goals: [],
    goalsForTomorrow: [],
    checklistTemplate: BASE_TEMPLATE.map((item) => ({ ...item })),
  };
}

