import { toIsoDate, toUtcDate } from "./date";
import type { Task } from "./types";

const DAY_MS = 86_400_000;

export function getMonthGridWeeks(today: string): string[][] {
  const current = toUtcDate(today);
  const monthStart = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1));
  const gridStart = new Date(monthStart.getTime() - monthStart.getUTCDay() * DAY_MS);

  const weeks: string[][] = [];
  for (let week = 0; week < 6; week++) {
    const days: string[] = [];
    for (let day = 0; day < 7; day++) {
      days.push(toIsoDate(new Date(gridStart.getTime() + (week * 7 + day) * DAY_MS)));
    }
    weeks.push(days);
  }
  return weeks;
}

export interface CalendarBar {
  taskId: string;
  segmentIndex: number;
  title: string;
  colStart: number;
  colEnd: number;
  lane: number;
  outcome: "open" | "done" | "held";
}

export interface CalendarRowLayout {
  bars: CalendarBar[];
  overflowCount: number;
}

interface LayoutOptions {
  cap: number;
  expanded: boolean;
}

export function layoutCalendarRow(
  tasks: Task[],
  rowDates: string[],
  today: string,
  options: LayoutOptions
): CalendarRowLayout {
  const rowStart = rowDates[0];
  const rowEnd = rowDates[rowDates.length - 1];

  const candidates: Omit<CalendarBar, "lane">[] = [];

  for (const task of tasks) {
    task.segments.forEach((segment, segmentIndex) => {
      const effectiveEnd = segment.end ?? today;
      if (segment.start > rowEnd || effectiveEnd < rowStart) return;

      const clipStart = segment.start < rowStart ? rowStart : segment.start;
      const clipEnd = effectiveEnd > rowEnd ? rowEnd : effectiveEnd;

      candidates.push({
        taskId: task.id,
        segmentIndex,
        title: task.title,
        colStart: rowDates.indexOf(clipStart),
        colEnd: rowDates.indexOf(clipEnd),
        outcome: segment.end === null ? "open" : (segment.outcome ?? "done"),
      });
    });
  }

  candidates.sort((a, b) => a.colStart - b.colStart);

  const laneEnds: number[] = [];
  const withLanes: CalendarBar[] = candidates.map((candidate) => {
    let lane = laneEnds.findIndex((end) => end < candidate.colStart);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(candidate.colEnd);
    } else {
      laneEnds[lane] = candidate.colEnd;
    }
    return { ...candidate, lane };
  });

  const laneCount = laneEnds.length;
  const cap = options.expanded ? laneCount : options.cap;
  const overflowCount = Math.max(0, laneCount - cap);

  return {
    bars: withLanes.filter((bar) => bar.lane < cap),
    overflowCount,
  };
}
