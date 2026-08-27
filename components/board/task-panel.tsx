"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMonthDay } from "@/lib/board/format";
import { severityBadgeVariant } from "@/lib/board/severity";
import type { TaskContentInput } from "@/lib/board/schedule";
import type { ScheduleSegment, Severity, Task, TaskType } from "@/lib/board/types";

interface TaskPanelProps {
  selectedTask: Task | null;
  registering: boolean;
  onStartNew: () => void;
  onCancelNew: () => void;
  onSubmitNew: (input: TaskContentInput) => void;
  onUpdate: (id: string, input: TaskContentInput) => void;
  onDelete: (id: string) => void;
}

export function TaskPanel({
  selectedTask,
  registering,
  onStartNew,
  onCancelNew,
  onSubmitNew,
  onUpdate,
  onDelete,
}: TaskPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">작업</p>
        <Button type="button" variant="action" size="sm" className="w-[84px] justify-center" onClick={onStartNew}>
          New
        </Button>
      </div>
      <div className="mt-2">
        {registering ? (
          <TaskContentForm submitLabel="등록" onCancel={onCancelNew} onSubmit={onSubmitNew} />
        ) : selectedTask ? (
          <TaskDetail key={selectedTask.id} task={selectedTask} onUpdate={onUpdate} onDelete={onDelete} />
        ) : (
          <p className="text-sm text-muted-foreground">카드를 선택하면 상세 내용이 여기에 표시됩니다.</p>
        )}
      </div>
    </div>
  );
}

function TaskDetail({
  task,
  onUpdate,
  onDelete,
}: {
  task: Task;
  onUpdate: (id: string, input: TaskContentInput) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  function handleDeleteClick() {
    const confirmed = window.confirm(`"${task.title}" 작업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`);
    if (confirmed) onDelete(task.id);
  }

  if (editing) {
    return (
      <TaskContentForm
        initialValue={task}
        submitLabel="저장"
        onCancel={() => setEditing(false)}
        onSubmit={(input) => {
          onUpdate(task.id, input);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h4
            className={`text-sm font-medium ${task.status === "done" ? "text-muted-foreground line-through" : ""}`}
          >
            {task.title}
          </h4>
          <Badge variant="outline">{task.type}</Badge>
          <Badge variant={severityBadgeVariant(task.severity)}>{task.severity}</Badge>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button type="button" variant="outline" size="sm" className="w-[72px] justify-center" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="w-[72px] justify-center"
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </div>
      </div>
      <div className="mt-2 max-h-40 overflow-y-auto pr-0.5 text-sm leading-relaxed whitespace-pre-wrap wrap-anywhere">
        {task.content}
      </div>
      {task.segments.length > 0 ? (
        <div className="mt-3 flex flex-col gap-1 border-t border-border pt-2">
          <p className="text-xs font-medium text-muted-foreground">일정 구간</p>
          {task.segments.map((segment, index) => (
            <SegmentRow key={index} segment={segment} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SegmentRow({ segment }: { segment: ScheduleSegment }) {
  const isOpen = segment.end === null;
  const colorClass = isOpen
    ? "text-info"
    : segment.outcome === "done"
      ? "text-primary"
      : "text-muted-foreground";
  const icon = isOpen ? "▸" : segment.outcome === "done" ? "✓" : "⏸";
  const range = isOpen
    ? `${formatMonthDay(segment.start)} ~ 진행 중`
    : `${formatMonthDay(segment.start)} ~ ${formatMonthDay(segment.end!)}`;

  return (
    <div className={`flex items-center gap-1.5 text-xs ${colorClass}`}>
      <span aria-hidden>{icon}</span>
      <span>{range}</span>
    </div>
  );
}

// 등록(New)과 수정(Edit)이 같은 필드 구성(제목·이슈/기능·심각도·상세 내용)과
// 같은 유효성 규칙(제목 필수)을 쓰므로 하나의 폼으로 공유한다.
function TaskContentForm({
  initialValue,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initialValue?: TaskContentInput;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (input: TaskContentInput) => void;
}) {
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [type, setType] = useState<TaskType>(initialValue?.type ?? "기능");
  const [severity, setSeverity] = useState<Severity>(initialValue?.severity ?? "Minor");
  const [content, setContent] = useState(initialValue?.content ?? "");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-title">제목</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="예: 결제 실패 로그 알림 연동"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>이슈/기능</Label>
        <div className="inline-flex w-fit overflow-hidden rounded-lg border border-border">
          {(["기능", "이슈"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`px-3 py-1 text-sm ${
                type === value ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-severity">심각도</Label>
        <select
          id="task-severity"
          value={severity}
          onChange={(event) => setSeverity(event.target.value as Severity)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="Critical">Critical</option>
          <option value="Major">Major</option>
          <option value="Minor">Minor</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-content">작업 상세 내용</Label>
        <Textarea
          id="task-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="무엇을, 왜 하는지 적어주세요"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="action"
          disabled={!title.trim()}
          onClick={() => onSubmit({ title: title.trim(), content: content.trim(), type, severity })}
        >
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
      </div>
    </div>
  );
}
