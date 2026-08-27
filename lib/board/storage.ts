import type { Task } from "./types";

const STORAGE_KEY = "kanban-schedule:tasks";
const REPORT_START_KEY = "kanban-schedule:report-start";

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // 저장 공간이 없거나 접근이 막힌 경우, 화면 동작은 계속되도록 조용히 넘어간다
  }
}

export function loadReportStart(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(REPORT_START_KEY);
  } catch {
    return null;
  }
}

export function saveReportStart(date: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(REPORT_START_KEY, date);
  } catch {
    // 저장 공간이 없거나 접근이 막힌 경우, 화면 동작은 계속되도록 조용히 넘어간다
  }
}
