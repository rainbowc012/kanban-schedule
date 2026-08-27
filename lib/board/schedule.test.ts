import { describe, expect, test } from "vitest";

import { moveTask } from "./schedule";
import type { Task } from "./types";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "샘플 작업",
    content: "내용",
    type: "기능",
    severity: "Minor",
    status: "plan",
    segments: [],
    ...overrides,
  };
}

describe("moveTask", () => {
  test("계획에서 실행으로 옮기면 오늘 날짜로 열린 구간이 생긴다", () => {
    const task = makeTask({ status: "plan", segments: [] });

    const moved = moveTask(task, "progress", "2026-08-27");

    expect(moved.status).toBe("progress");
    expect(moved.segments).toEqual([{ start: "2026-08-27", end: null }]);
  });

  test("실행에서 계획으로 옮기면(보류) 열려 있던 구간이 오늘 날짜로 닫힌다", () => {
    const task = makeTask({
      status: "progress",
      segments: [{ start: "2026-08-20", end: null }],
    });

    const moved = moveTask(task, "plan", "2026-08-27");

    expect(moved.status).toBe("plan");
    expect(moved.segments).toEqual([
      { start: "2026-08-20", end: "2026-08-27", outcome: "held" },
    ]);
  });

  test("실행에서 완료로 옮기면 열려 있던 구간이 오늘 날짜로 닫히고 완료로 기록된다", () => {
    const task = makeTask({
      status: "progress",
      segments: [{ start: "2026-08-20", end: null }],
    });

    const moved = moveTask(task, "done", "2026-08-27");

    expect(moved.status).toBe("done");
    expect(moved.segments).toEqual([
      { start: "2026-08-20", end: "2026-08-27", outcome: "done" },
    ]);
  });

  test("완료에서 실행으로 옮기면(재개) 이전 구간은 그대로 두고 오늘 날짜로 새 구간이 열린다", () => {
    const task = makeTask({
      status: "done",
      segments: [{ start: "2026-08-10", end: "2026-08-12", outcome: "done" }],
    });

    const moved = moveTask(task, "progress", "2026-08-27");

    expect(moved.status).toBe("progress");
    expect(moved.segments).toEqual([
      { start: "2026-08-10", end: "2026-08-12", outcome: "done" },
      { start: "2026-08-27", end: null },
    ]);
  });

  test("같은 날 안에서 실행⇄계획을 여러 번 오가도 구간은 하나로 유지된다", () => {
    let task = makeTask({ status: "plan", segments: [] });

    task = moveTask(task, "progress", "2026-08-27");
    task = moveTask(task, "plan", "2026-08-27");
    task = moveTask(task, "progress", "2026-08-27");
    task = moveTask(task, "plan", "2026-08-27");
    task = moveTask(task, "progress", "2026-08-27");

    expect(task.status).toBe("progress");
    expect(task.segments).toEqual([{ start: "2026-08-27", end: null }]);
  });

  test("여러 날에 걸친 구간을 오늘 닫았다가 같은 날 다시 열면 별개 구간 두 개로 남는다", () => {
    const task = makeTask({
      status: "progress",
      segments: [{ start: "2026-08-20", end: null }],
    });

    const held = moveTask(task, "plan", "2026-08-27");
    const resumed = moveTask(held, "progress", "2026-08-27");

    expect(resumed.status).toBe("progress");
    expect(resumed.segments).toEqual([
      { start: "2026-08-20", end: "2026-08-27", outcome: "held" },
      { start: "2026-08-27", end: null },
    ]);
  });
});
