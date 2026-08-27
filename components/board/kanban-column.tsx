"use client";

import { TaskCard } from "@/components/board/task-card";
import type { Task, TaskStatus } from "@/lib/board/types";

interface KanbanColumnProps {
  title: string;
  dotClassName?: string;
  tasks: Task[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, target: TaskStatus) => void;
}

function leftTarget(status: TaskStatus): TaskStatus {
  return status === "progress" ? "plan" : "progress";
}

function rightTarget(status: TaskStatus): TaskStatus {
  return status === "plan" ? "progress" : "done";
}

export function KanbanColumn({
  title,
  dotClassName,
  tasks,
  selectedId,
  onSelect,
  onMove,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-medium">
          <span
            aria-hidden
            className={dotClassName ?? "inline-block size-1.5 rounded-full border border-border bg-background"}
          />
          {title}
        </h3>
        <span className="text-xs text-muted-foreground">{tasks.length ? `(${tasks.length})` : ""}</span>
      </div>
      <div className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-0.5">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">작업이 없습니다.</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              selected={task.id === selectedId}
              onSelect={() => onSelect(task.id)}
              onMoveLeft={() => onMove(task.id, leftTarget(task.status))}
              onMoveRight={() => onMove(task.id, rightTarget(task.status))}
            />
          ))
        )}
      </div>
    </div>
  );
}
