"use client";

import { Button } from "@/components/ui/button";
import { severityAccentClass, taskTypeIcon } from "@/lib/board/severity";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/board/types";

interface TaskCardProps {
  task: Task;
  selected: boolean;
  onSelect: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

export function TaskCard({ task, selected, onSelect, onMoveLeft, onMoveRight }: TaskCardProps) {
  const showLeft = selected && (task.status === "progress" || task.status === "done");
  const showRight = selected && (task.status === "plan" || task.status === "progress");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-2 text-sm cursor-pointer border-l-[3px]",
        severityAccentClass(task.severity),
        selected && "ring-2 ring-ring"
      )}
    >
      {showLeft ? (
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={task.status === "progress" ? "계획으로 이동 (보류)" : "실행으로 이동 (재개)"}
          onClick={(event) => {
            event.stopPropagation();
            onMoveLeft();
          }}
        >
          ‹
        </Button>
      ) : null}
      <span aria-hidden className="shrink-0 text-xs text-muted-foreground">
        {taskTypeIcon(task.type)}
      </span>
      <span
        className={cn(
          "flex-1 wrap-anywhere",
          task.status === "done" && "text-muted-foreground line-through"
        )}
      >
        {task.title}
      </span>
      {showRight ? (
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={task.status === "plan" ? "실행으로 이동 (착수)" : "완료로 이동"}
          onClick={(event) => {
            event.stopPropagation();
            onMoveRight();
          }}
        >
          ›
        </Button>
      ) : null}
    </div>
  );
}
