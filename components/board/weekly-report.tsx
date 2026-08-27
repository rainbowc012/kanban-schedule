"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { selectWeeklyReport } from "@/lib/board/report";
import { severityBadgeVariant, taskTypeIcon } from "@/lib/board/severity";
import type { Task } from "@/lib/board/types";

interface WeeklyReportProps {
  tasks: Task[];
  reportStart: string | null;
  selectedId: string | null;
  onSelectTask: (id: string) => void;
  onReport: () => void;
}

export function WeeklyReport({ tasks, reportStart, selectedId, onSelectTask, onReport }: WeeklyReportProps) {
  const report = selectWeeklyReport(tasks, reportStart);

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">주간보고</p>
        <Button type="button" variant="neutral" size="sm" className="w-[84px] justify-center" onClick={onReport}>
          Report
        </Button>
      </div>
      <ReportSection label="진행" dotClassName="bg-info" tasks={report.progress} selectedId={selectedId} onSelectTask={onSelectTask} />
      <ReportSection label="완료" dotClassName="bg-primary" tasks={report.done} selectedId={selectedId} onSelectTask={onSelectTask} />
      <ReportSection
        label="보류"
        dotClassName="bg-secondary border border-border"
        tasks={report.held}
        selectedId={selectedId}
        onSelectTask={onSelectTask}
      />
    </div>
  );
}

function ReportSection({
  label,
  dotClassName,
  tasks,
  selectedId,
  onSelectTask,
}: {
  label: string;
  dotClassName: string;
  tasks: Task[];
  selectedId: string | null;
  onSelectTask: (id: string) => void;
}) {
  return (
    <div className="mt-3 first:mt-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span aria-hidden className={`inline-block size-1.5 rounded-full ${dotClassName}`} />
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground">{tasks.length || ""}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="px-1 pb-1 text-sm text-muted-foreground">없음</p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectTask(task.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectTask(task.id);
              }
            }}
            className={`flex cursor-pointer items-center gap-1.5 rounded-sm px-1 py-1 text-sm hover:bg-muted ${
              task.id === selectedId ? "bg-muted" : ""
            }`}
          >
            <span aria-hidden className="shrink-0 text-xs text-muted-foreground">
              {taskTypeIcon(task.type)}
            </span>
            <span className="flex-1 wrap-anywhere">{task.title}</span>
            <Badge variant={severityBadgeVariant(task.severity)}>{task.severity}</Badge>
          </div>
        ))
      )}
    </div>
  );
}
