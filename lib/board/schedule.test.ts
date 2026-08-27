import { describe, expect, test } from "vitest";

import { isHeld, moveTask, updateTaskContent } from "./schedule";
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

describe("isHeld", () => {
  test("세그먼트가 없는 신규 등록 작업은 보류가 아니다", () => {
    const task = makeTask({ status: "plan", segments: [] });

    expect(isHeld(task)).toBe(false);
  });

  test("마지막 구간이 held로 닫힌 작업은 보류다", () => {
    const task = makeTask({
      status: "plan",
      segments: [{ start: "2026-08-20", end: "2026-08-27", outcome: "held" }],
    });

    expect(isHeld(task)).toBe(true);
  });

  test("마지막 구간이 done으로 닫힌 작업(재개 후 재보류가 아닌 경우)은 보류가 아니다", () => {
    const task = makeTask({
      status: "done",
      segments: [{ start: "2026-08-20", end: "2026-08-27", outcome: "done" }],
    });

    expect(isHeld(task)).toBe(false);
  });
});

describe("updateTaskContent", () => {
  test("제목·내용·이슈/기능·심각도를 새 값으로 바꾸고 상태와 일정 구간은 그대로 둔다", () => {
    const task = makeTask({
      title: "이전 제목",
      content: "이전 내용",
      type: "기능",
      severity: "Minor",
      status: "progress",
      segments: [{ start: "2026-08-20", end: null }],
    });

    const updated = updateTaskContent(task, {
      title: "새 제목",
      content: "새 내용",
      type: "이슈",
      severity: "Critical",
    });

    expect(updated).toEqual({
      ...task,
      title: "새 제목",
      content: "새 내용",
      type: "이슈",
      severity: "Critical",
    });
  });
});
