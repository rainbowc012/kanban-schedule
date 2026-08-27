"use client";

import { useEffect, useState } from "react";

import { CalendarMonth } from "@/components/board/calendar-month";
import { KanbanColumn } from "@/components/board/kanban-column";
import { TaskPanel } from "@/components/board/task-panel";
import { moveTask } from "@/lib/board/schedule";
import { loadTasks, saveTasks } from "@/lib/board/storage";
import type { Task, TaskStatus } from "@/lib/board/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function createId(): string {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function Board() {
  const [today] = useState(todayIso);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    // localStorage는 서버에 없는 값이라 마운트 이후에만 읽을 수 있다. 처음
    // 렌더는 서버와 같은 빈 상태로 맞춰야 hydration이 어긋나지 않으므로,
    // 이 최초 동기화는 의도적으로 effect 안에서 한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasks(loadTasks());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveTasks(tasks);
  }, [tasks, loaded]);

  function handleSelect(id: string) {
    setRegistering(false);
    setSelectedId((current) => (current === id ? null : id));
  }

  function handleMove(id: string, target: TaskStatus) {
    setTasks((current) => current.map((task) => (task.id === id ? moveTask(task, target, today) : task)));
  }

  function handleStartNew() {
    setSelectedId(null);
    setRegistering(true);
  }

  function handleCancelNew() {
    setRegistering(false);
  }

  function handleDelete(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }

  function handleSubmitNew(input: { title: string; content: string; type: Task["type"]; severity: Task["severity"] }) {
    const task: Task = {
      id: createId(),
      title: input.title,
      content: input.content || "(상세 내용 없음)",
      type: input.type,
      severity: input.severity,
      status: "plan",
      segments: [],
    };
    setTasks((current) => [...current, task]);
    setRegistering(false);
    setSelectedId(task.id);
  }

  const selectedTask = tasks.find((task) => task.id === selectedId) ?? null;
  const planTasks = tasks.filter((task) => task.status === "plan");
  const progressTasks = tasks.filter((task) => task.status === "progress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3.5 p-4 md:grid-cols-[2fr_1fr]">
      <div className="md:col-start-1 md:row-start-1">
        <CalendarMonth tasks={tasks} today={today} onSelectTask={handleSelect} />
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 md:col-start-1 md:row-start-2">
        <KanbanColumn
          title="계획"
          dotClassName="inline-block size-1.5 rounded-full border border-border bg-background"
          tasks={planTasks}
          selectedId={selectedId}
          onSelect={handleSelect}
          onMove={handleMove}
        />
        <KanbanColumn
          title="실행"
          dotClassName="inline-block size-1.5 rounded-full bg-info"
          tasks={progressTasks}
          selectedId={selectedId}
          onSelect={handleSelect}
          onMove={handleMove}
        />
        <KanbanColumn
          title="완료"
          dotClassName="inline-block size-1.5 rounded-full bg-primary"
          tasks={doneTasks}
          selectedId={selectedId}
          onSelect={handleSelect}
          onMove={handleMove}
        />
      </div>

      <div className="md:col-start-1 md:row-start-3">
        <TaskPanel
          selectedTask={selectedTask}
          registering={registering}
          onStartNew={handleStartNew}
          onCancelNew={handleCancelNew}
          onSubmitNew={handleSubmitNew}
          onDelete={handleDelete}
        />
      </div>

      <div className="rounded-xl border border-dashed border-border p-3.5 md:col-start-2 md:row-span-3 md:row-start-1">
        <p className="text-sm font-semibold">주간보고</p>
        <div className="mt-2 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          이번 버전에는 포함되지 않았습니다.
        </div>
      </div>
    </div>
  );
}
