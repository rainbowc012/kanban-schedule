"use client";

import { useMemo, useState } from "react";

import { getMonthGridWeeks, layoutCalendarRow } from "@/lib/board/calendar";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/board/types";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const ROW_CAP = 2;
const BAR_HEIGHT = 17;
const BAR_GAP = 2;

interface CalendarMonthProps {
  tasks: Task[];
  today: string;
  onSelectTask: (id: string) => void;
}

export function CalendarMonth({ tasks, today, onSelectTask }: CalendarMonthProps) {
  const weeks = useMemo(() => getMonthGridWeeks(today), [today]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const currentMonth = new Date(today + "T00:00:00").getMonth();

  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <p className="text-sm font-semibold">{currentMonth + 1}월</p>
      <div className="mt-1.5 grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="text-center text-[0.68rem] text-muted-foreground">
            {label}
          </span>
        ))}
      </div>
      {weeks.map((week, rowIndex) => {
        const expanded = expandedRows.has(rowIndex);
        const { bars, overflowCount } = layoutCalendarRow(tasks, week, today, {
          cap: ROW_CAP,
          expanded,
        });
        const showsToggle = overflowCount > 0 || (expanded && bars.length > ROW_CAP);
        const visibleLanes = Math.min(bars.length, expanded ? bars.length : ROW_CAP) || 0;
        const laneRows = (bars.length ? visibleLanes : 0) + (showsToggle ? 1 : 0);

        return (
          <div key={week[0]} className="relative border-t border-border last:border-b">
            <div className="grid grid-cols-7">
              {week.map((date) => {
                const isToday = date === today;
                const isCurrentMonth = new Date(date + "T00:00:00").getMonth() === currentMonth;
                return (
                  <div
                    key={date}
                    className={cn(
                      "py-0.5 text-center text-[0.68rem]",
                      !isCurrentMonth && "text-muted-foreground/50"
                    )}
                  >
                    {isToday ? (
                      <span className="inline-flex size-[18px] items-center justify-center rounded-full bg-destructive font-bold text-primary-foreground">
                        {Number(date.slice(-2))}
                      </span>
                    ) : (
                      Number(date.slice(-2))
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className="relative"
              style={{ height: laneRows ? laneRows * (BAR_HEIGHT + BAR_GAP) + 1 : 5 }}
            >
              {bars.map((bar) => (
                <button
                  key={`${bar.taskId}-${bar.segmentIndex}`}
                  type="button"
                  onClick={() => onSelectTask(bar.taskId)}
                  title={bar.title}
                  className={cn(
                    "absolute overflow-hidden text-ellipsis rounded-sm px-1.5 text-left text-[0.68rem] leading-[17px] whitespace-nowrap",
                    bar.outcome === "open" && "border-r-2 border-dashed border-info-foreground/50 bg-info text-info-foreground",
                    bar.outcome === "done" && "bg-primary text-primary-foreground",
                    bar.outcome === "held" && "border border-dashed border-border bg-secondary text-secondary-foreground"
                  )}
                  style={{
                    left: `${(bar.colStart / 7) * 100}%`,
                    width: `${((bar.colEnd - bar.colStart + 1) / 7) * 100}%`,
                    top: bar.lane * (BAR_HEIGHT + BAR_GAP) + 1,
                    height: BAR_HEIGHT,
                  }}
                >
                  {bar.outcome === "open" ? "▸ " : bar.outcome === "done" ? "✓ " : "⏸ "}
                  {bar.title}
                </button>
              ))}
              {showsToggle ? (
                <button
                  type="button"
                  className="absolute left-0 text-[0.66rem] font-medium text-muted-foreground hover:text-foreground hover:underline"
                  style={{ top: visibleLanes * (BAR_HEIGHT + BAR_GAP) + 1, height: BAR_HEIGHT }}
                  onClick={() =>
                    setExpandedRows((prev) => {
                      const next = new Set(prev);
                      if (expanded) next.delete(rowIndex);
                      else next.add(rowIndex);
                      return next;
                    })
                  }
                >
                  {expanded ? "접기" : `+${overflowCount}개`}
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
      <div className="mt-1.5 flex flex-wrap gap-3.5 text-[0.68rem] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span aria-hidden className="inline-block size-2.5 rounded-sm bg-info" />
          진행 중
        </span>
        <span className="inline-flex items-center gap-1">
          <span aria-hidden className="inline-block size-2.5 rounded-sm bg-primary" />
          완료
        </span>
        <span className="inline-flex items-center gap-1">
          <span aria-hidden className="inline-block size-2.5 rounded-sm border border-border bg-secondary" />
          보류
        </span>
      </div>
    </div>
  );
}
