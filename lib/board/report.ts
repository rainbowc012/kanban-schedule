import { addDays, toUtcDate } from "./date";
import { formatMonthDay } from "./format";
import type { Severity, Task } from "./types";

// 월~일 기준, 주어진 날짜가 속한 주의 월요일을 돌려준다
export function mondayOf(iso: string): string {
  const dow = toUtcDate(iso).getUTCDay(); // 0=일,1=월,...,6=토
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  return addDays(iso, diffToMonday);
}

export function weekRangeLabel(mondayIso: string): string {
  return `${formatMonthDay(mondayIso)} ~ ${formatMonthDay(addDays(mondayIso, 6))}`;
}

function lastSegment(task: Task) {
  return task.segments[task.segments.length - 1];
}

// 보고 시작일 이후에 "새로 생긴 소식"인지 판정한다. 실행 중인 작업은
// 보고했는지와 무관하게 항상 참이다.
export function isReportEligible(task: Task, reportStart: string | null): boolean {
  if (task.status === "progress") return true;
  const last = lastSegment(task);
  if (!last || !last.end) return false;
  if (reportStart === null) return true;
  return last.end >= reportStart;
}

function severityRank(severity: Severity): number {
  if (severity === "Critical") return 0;
  if (severity === "Major") return 1;
  return 2;
}

function sortForReport(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => severityRank(a.severity) - severityRank(b.severity) || a.title.localeCompare(b.title)
  );
}

export interface WeeklyReport {
  progress: Task[];
  done: Task[];
  held: Task[];
}

export function selectWeeklyReport(tasks: Task[], reportStart: string | null): WeeklyReport {
  const progress = tasks.filter((t) => t.status === "progress");
  const done = tasks.filter((t) => t.status === "done" && isReportEligible(t, reportStart));
  const held = tasks.filter(
    (t) => t.status === "plan" && lastSegment(t)?.outcome === "held" && isReportEligible(t, reportStart)
  );
  return { progress: sortForReport(progress), done: sortForReport(done), held: sortForReport(held) };
}

export function visibleDoneTasks(tasks: Task[], reportStart: string | null, showAll: boolean): Task[] {
  const done = tasks.filter((t) => t.status === "done");
  if (showAll || reportStart === null) return done;
  return done.filter((t) => isReportEligible(t, reportStart));
}

export interface DoneWeekGroup {
  weekStart: string;
  tasks: Task[];
}

// 완료일이 속한 주(월~일)로 묶는다. 최근 주가 먼저 오도록 정렬한다.
export function groupDoneByWeek(tasks: Task[]): DoneWeekGroup[] {
  const groups = new Map<string, Task[]>();
  for (const task of tasks) {
    const end = lastSegment(task)?.end;
    if (!end) continue;
    const weekStart = mondayOf(end);
    const bucket = groups.get(weekStart) ?? [];
    bucket.push(task);
    groups.set(weekStart, bucket);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([weekStart, weekTasks]) => ({ weekStart, tasks: weekTasks }));
}
