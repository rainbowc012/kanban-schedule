import { describe, expect, test } from "vitest";

import { getMonthGridWeeks, layoutCalendarRow } from "./calendar";
import type { Task } from "./types";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "샘플 작업",
    content: "",
    type: "기능",
    severity: "Minor",
    status: "progress",
    segments: [],
    ...overrides,
  };
}

const ROW = ["2026-08-23", "2026-08-24", "2026-08-25", "2026-08-26", "2026-08-27", "2026-08-28", "2026-08-29"];

describe("layoutCalendarRow", () => {
  test("한 주 안에서 시작·종료하는 구간은 그 열 범위에 막대 하나로 배치된다", () => {
    const tasks = [
      makeTask({
        id: "t1",
        title: "다크모드 버그 수정",
        segments: [{ start: "2026-08-24", end: "2026-08-26", outcome: "done" }],
      }),
    ];

    const result = layoutCalendarRow(tasks, ROW, "2026-08-27", { cap: 2, expanded: false });

    expect(result.bars).toEqual([
      {
        taskId: "t1",
        segmentIndex: 0,
        title: "다크모드 버그 수정",
        colStart: 1,
        colEnd: 3,
        lane: 0,
        outcome: "done",
      },
    ]);
    expect(result.overflowCount).toBe(0);
  });

  test("아직 닫히지 않은 구간은 오늘까지만 그려진다", () => {
    const tasks = [
      makeTask({
        id: "t1",
        title: "로그인 API 리팩터링",
        segments: [{ start: "2026-08-20", end: null }],
      }),
    ];

    const result = layoutCalendarRow(tasks, ROW, "2026-08-27", { cap: 2, expanded: false });

    expect(result.bars).toEqual([
      {
        taskId: "t1",
        segmentIndex: 0,
        title: "로그인 API 리팩터링",
        colStart: 0,
        colEnd: 4,
        lane: 0,
        outcome: "open",
      },
    ]);
  });

  test("겹치는 구간은 서로 다른 레인에 배치된다", () => {
    const tasks = [
      makeTask({ id: "t1", title: "작업 A", segments: [{ start: "2026-08-23", end: null }] }),
      makeTask({ id: "t2", title: "작업 B", segments: [{ start: "2026-08-24", end: null }] }),
    ];

    const result = layoutCalendarRow(tasks, ROW, "2026-08-27", { cap: 2, expanded: false });

    expect(result.bars.map((bar) => ({ taskId: bar.taskId, lane: bar.lane }))).toEqual([
      { taskId: "t1", lane: 0 },
      { taskId: "t2", lane: 1 },
    ]);
  });

  test("레인 수가 캡을 넘으면 넘는 만큼 접히고, expanded면 전부 보인다", () => {
    const tasks = [
      makeTask({ id: "t1", title: "작업 A", segments: [{ start: "2026-08-23", end: null }] }),
      makeTask({ id: "t2", title: "작업 B", segments: [{ start: "2026-08-24", end: null }] }),
      makeTask({ id: "t3", title: "작업 C", segments: [{ start: "2026-08-25", end: null }] }),
    ];

    const collapsed = layoutCalendarRow(tasks, ROW, "2026-08-27", { cap: 2, expanded: false });
    expect(collapsed.bars).toHaveLength(2);
    expect(collapsed.overflowCount).toBe(1);

    const expanded = layoutCalendarRow(tasks, ROW, "2026-08-27", { cap: 2, expanded: true });
    expect(expanded.bars).toHaveLength(3);
    expect(expanded.overflowCount).toBe(0);
  });

  test("같은 작업이 같은 날 다시 열린 구간을 가지면 각 구간이 구분되는 segmentIndex를 가진다", () => {
    const tasks = [
      makeTask({
        id: "t1",
        title: "로그인 API 리팩터링",
        segments: [
          { start: "2026-08-20", end: "2026-08-27", outcome: "done" },
          { start: "2026-08-27", end: null },
        ],
      }),
    ];

    const result = layoutCalendarRow(tasks, ROW, "2026-08-27", { cap: 2, expanded: false });

    expect(result.bars.map((bar) => bar.segmentIndex)).toEqual([0, 1]);
  });
});

describe("getMonthGridWeeks", () => {
  test("오늘이 속한 달을 일요일 시작 6주 격자로 반환한다", () => {
    const weeks = getMonthGridWeeks("2026-08-27");

    expect(weeks).toHaveLength(6);
    weeks.forEach((week) => expect(week).toHaveLength(7));
    expect(weeks[0][0]).toBe("2026-07-26");
    expect(weeks[4]).toContain("2026-08-27");
    expect(weeks[5][6]).toBe("2026-09-05");
  });
});
