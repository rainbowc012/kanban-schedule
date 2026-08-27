import type { Task, TaskStatus } from "./types";

export function moveTask(task: Task, targetStatus: TaskStatus, today: string): Task {
  const wasInProgress = task.status === "progress";
  const entersProgress = targetStatus === "progress";

  let segments = task.segments;

  if (wasInProgress && !entersProgress) {
    segments = closeOpenSegment(segments, today, targetStatus === "done" ? "done" : "held");
  }

  if (!wasInProgress && entersProgress) {
    segments = [...segments, { start: today, end: null }];
  }

  return { ...task, status: targetStatus, segments };
}

function closeOpenSegment(
  segments: Task["segments"],
  today: string,
  outcome: "done" | "held"
): Task["segments"] {
  return segments.map((segment, index) =>
    index === segments.length - 1 && segment.end === null
      ? { ...segment, end: today, outcome }
      : segment
  );
}
