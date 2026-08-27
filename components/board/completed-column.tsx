"use client";

import { TaskCard } from "@/components/board/task-card";
import { leftMoveTarget, rightMoveTarget } from "@/lib/board/schedule";
import { groupDoneByWeek, visibleDoneTasks, weekRangeLabel } from "@/lib/board/report";
import type { Task, TaskStatus } from "@/lib/board/types";

interface CompletedColumnProps {
  tasks: Task[];
  reportStart: string | null;
  showAll: boolean;
  onToggleShowAll: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, target: TaskStatus) => void;
}

export function CompletedColumn({
  tasks,
  reportStart,
  showAll,
  onToggleShowAll,
  selectedId,
  onSelect,
  onMove,
}: CompletedColumnProps) {
  const allDone = tasks.filter((t) => t.status === "done");
  const visible = visibleDoneTasks(tasks, reportStart, showAll);
  const groups = groupDoneByWeek(visible);
  const showDividers = groups.length > 1;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-medium">
          <span aria-hidden className="inline-block size-1.5 rounded-full bg-primary" />
          완료
          {reportStart !== null ? (
            <button
              type="button"
              onClick={onToggleShowAll}
              className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              {showAll ? "이번 주만" : "전체 보기"}
            </button>
          ) : null}
        </h3>
        <span className="text-xs text-muted-foreground">{visible.length ? `(${visible.length})` : ""}</span>
      </div>
      <div className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-0.5">
        {allDone.length === 0 ? (
          <p className="text-sm text-muted-foreground">작업이 없습니다.</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">완료한 작업이 없습니다.</p>
        ) : (
          groups.map((group) => (
            <div key={group.weekStart} className="flex flex-col gap-2">
              {showDividers ? (
                <p className="border-t border-dashed border-border pt-1 text-xs font-semibold text-muted-foreground first:border-t-0 first:pt-0">
                  {weekRangeLabel(group.weekStart)}
                </p>
              ) : null}
              {group.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  selected={task.id === selectedId}
                  onSelect={() => onSelect(task.id)}
                  onMoveLeft={() => onMove(task.id, leftMoveTarget(task.status))}
                  onMoveRight={() => onMove(task.id, rightMoveTarget(task.status))}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
