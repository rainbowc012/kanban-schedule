"use client";

import { TaskCard } from "@/components/board/task-card";
import { isHeld, leftMoveTarget, rightMoveTarget } from "@/lib/board/schedule";
import type { Task, TaskStatus } from "@/lib/board/types";

interface PlanColumnProps {
  tasks: Task[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, target: TaskStatus) => void;
}

export function PlanColumn({ tasks, selectedId, onSelect, onMove }: PlanColumnProps) {
  const registered = tasks.filter((task) => !isHeld(task));
  const held = tasks.filter((task) => isHeld(task));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-medium">
          <span aria-hidden className="inline-block size-1.5 rounded-full border border-border bg-background" />
          계획
        </h3>
        <span className="text-xs text-muted-foreground">{tasks.length ? `(${tasks.length})` : ""}</span>
      </div>
      <div className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-0.5">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">작업이 없습니다.</p>
        ) : (
          <>
            {registered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={task.id === selectedId}
                onSelect={() => onSelect(task.id)}
                onMoveLeft={() => onMove(task.id, leftMoveTarget(task.status))}
                onMoveRight={() => onMove(task.id, rightMoveTarget(task.status))}
              />
            ))}
            {held.length > 0 ? (
              <p className="border-t border-dashed border-border pt-1 text-xs font-semibold text-muted-foreground">
                보류
              </p>
            ) : null}
            {held.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={task.id === selectedId}
                onSelect={() => onSelect(task.id)}
                onMoveLeft={() => onMove(task.id, leftMoveTarget(task.status))}
                onMoveRight={() => onMove(task.id, rightMoveTarget(task.status))}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
