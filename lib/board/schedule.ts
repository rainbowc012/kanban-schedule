import type { Task, TaskStatus } from "./types";

// 선택된 카드의 ‹ › 버튼이 어느 상태로 이동시키는지: 계획 카드는 ›만(착수),
// 완료 카드는 ‹만(재개), 실행 카드는 양쪽(‹ 보류, › 완료) 갖는다.
export function leftMoveTarget(status: TaskStatus): TaskStatus {
  return status === "progress" ? "plan" : "progress";
}

export function rightMoveTarget(status: TaskStatus): TaskStatus {
  return status === "plan" ? "progress" : "done";
}

export function moveTask(task: Task, targetStatus: TaskStatus, today: string): Task {
  const wasInProgress = task.status === "progress";
  const entersProgress = targetStatus === "progress";

  let segments = task.segments;

  if (wasInProgress && !entersProgress) {
    segments = closeOpenSegment(segments, today, targetStatus === "done" ? "done" : "held");
  }

  if (!wasInProgress && entersProgress) {
    const last = segments[segments.length - 1];
    // 오늘 이미 손댄 구간(오늘 열렸다 닫힌 구간)을 오늘 다시 열 때는 새 구간을
    // 쌓지 않고 그 구간을 다시 연다. 그래야 하루 안에서 여러 번 오가도 기록이
    // 계속 늘어나지 않는다. 다른 날 시작된 구간을 오늘 닫았다가 다시 여는
    // 경우는(last.start !== today) 실제 히스토리이므로 새 구간을 그대로 연다.
    segments =
      last && last.start === today
        ? segments.map((segment, index) =>
            index === segments.length - 1 ? { start: segment.start, end: null } : segment
          )
        : [...segments, { start: today, end: null }];
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
