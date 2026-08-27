import type { Severity, TaskType } from "./types";

export function severityBadgeVariant(severity: Severity): "destructive" | "warning" | "secondary" {
  if (severity === "Critical") return "destructive";
  if (severity === "Major") return "warning";
  return "secondary";
}

export function severityAccentClass(severity: Severity): string {
  if (severity === "Critical") return "border-l-destructive";
  if (severity === "Major") return "border-l-warning";
  return "border-l-border";
}

export function taskTypeIcon(type: TaskType): string {
  return type === "이슈" ? "⚠" : "✦";
}
