import { describe, expect, test } from "vitest";

import { groupDoneByWeek, isReportEligible, mondayOf, selectWeeklyReport, visibleDoneTasks, weekRangeLabel } from "./report";
import type { Task } from "./types";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "샘플 작업",
    content: "",
    type: "기능",
    severity: "Minor",
    status: "plan",
    segments: [],
    ...overrides,
  };
}

describe("mondayOf", () => {
  test("목요일이면 그 주의 월요일을 돌려준다", () => {
    expect(mondayOf("2026-08-27")).toBe("2026-08-24");
  });

  test("월요일 자신은 그대로 돌려준다", () => {
    expect(mondayOf("2026-08-17")).toBe("2026-08-17");
  });

  test("일요일이면 그 주의(그 전날까지 이어지는) 월요일을 돌려준다", () => {
    expect(mondayOf("2026-08-23")).toBe("2026-08-17");
  });
});

describe("weekRangeLabel", () => {
  test("월요일부터 일요일까지 범위를 표기한다", () => {
    expect(weekRangeLabel("2026-08-24")).toBe("8/24 ~ 8/30");
  });
});

describe("isReportEligible", () => {
  test("실행 중인 작업은 보고 시작일과 무관하게 항상 대상이다", () => {
    const task = makeTask({ status: "progress", segments: [{ start: "2026-08-01", end: null }] });
    expect(isReportEligible(task, "2026-08-24")).toBe(true);
  });

  test("보고 시작일이 없으면(한 번도 보고 안 함) 전부 대상이다", () => {
    const task = makeTask({
      status: "done",
      segments: [{ start: "2026-08-01", end: "2026-08-02", outcome: "done" }],
    });
    expect(isReportEligible(task, null)).toBe(true);
  });

  test("마지막 구간 종료일이 보고 시작일보다 이르면 대상이 아니다", () => {
    const task = makeTask({
      status: "done",
      segments: [{ start: "2026-08-01", end: "2026-08-02", outcome: "done" }],
    });
    expect(isReportEligible(task, "2026-08-24")).toBe(false);
  });

  test("마지막 구간 종료일이 보고 시작일 이후면 대상이다", () => {
    const task = makeTask({
      status: "done",
      segments: [{ start: "2026-08-24", end: "2026-08-26", outcome: "done" }],
    });
    expect(isReportEligible(task, "2026-08-24")).toBe(true);
  });

  test("일정 구간이 없는 계획 작업은 대상이 아니다", () => {
    const task = makeTask({ status: "plan", segments: [] });
    expect(isReportEligible(task, null)).toBe(false);
  });
});

describe("selectWeeklyReport", () => {
  test("진행은 항상, 완료·보류는 보고 시작일 이후 것만 심각도 순으로 담는다", () => {
    const tasks: Task[] = [
      makeTask({ id: "p1", title: "실행중 작업", status: "progress", severity: "Minor", segments: [{ start: "2026-08-20", end: null }] }),
      makeTask({ id: "d1", title: "이번주 완료", status: "done", severity: "Minor", segments: [{ start: "2026-08-24", end: "2026-08-25", outcome: "done" }] }),
      makeTask({ id: "d2", title: "이번주 완료 Critical", status: "done", severity: "Critical", segments: [{ start: "2026-08-24", end: "2026-08-26", outcome: "done" }] }),
      makeTask({ id: "d3", title: "지난주 완료", status: "done", severity: "Critical", segments: [{ start: "2026-08-10", end: "2026-08-11", outcome: "done" }] }),
      makeTask({ id: "h1", title: "이번주 보류", status: "plan", severity: "Major", segments: [{ start: "2026-08-24", end: "2026-08-25", outcome: "held" }] }),
    ];

    const report = selectWeeklyReport(tasks, "2026-08-24");

    expect(report.progress.map((t) => t.id)).toEqual(["p1"]);
    expect(report.done.map((t) => t.id)).toEqual(["d2", "d1"]); // Critical 먼저
    expect(report.held.map((t) => t.id)).toEqual(["h1"]);
  });
});

describe("visibleDoneTasks / groupDoneByWeek", () => {
  const tasks: Task[] = [
    makeTask({ id: "a", title: "A", status: "done", segments: [{ start: "2026-08-24", end: "2026-08-25", outcome: "done" }] }),
    makeTask({ id: "b", title: "B", status: "done", segments: [{ start: "2026-08-10", end: "2026-08-11", outcome: "done" }] }),
  ];

  test("전체 보기가 아니면 보고 시작일 이후 것만 보인다", () => {
    expect(visibleDoneTasks(tasks, "2026-08-24", false).map((t) => t.id)).toEqual(["a"]);
  });

  test("전체 보기면 보고 시작일과 무관하게 전부 보인다", () => {
    expect(visibleDoneTasks(tasks, "2026-08-24", true).map((t) => t.id)).toEqual(["a", "b"]);
  });

  test("완료일이 속한 주별로 묶고 최근 주가 먼저 온다", () => {
    const groups = groupDoneByWeek(tasks);
    expect(groups.map((g) => g.weekStart)).toEqual(["2026-08-24", "2026-08-10"]);
    expect(groups[0].tasks.map((t) => t.id)).toEqual(["a"]);
  });
});
