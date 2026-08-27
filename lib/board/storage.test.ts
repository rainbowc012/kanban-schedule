import { beforeEach, describe, expect, test } from "vitest";

import { loadTasks, saveTasks } from "./storage";
import type { Task } from "./types";

beforeEach(() => {
  window.localStorage.clear();
});

describe("board storage", () => {
  test("저장한 작업 목록을 그대로 불러온다", () => {
    const tasks: Task[] = [
      {
        id: "t1",
        title: "결제 모듈 성능 이슈",
        content: "내용",
        type: "이슈",
        severity: "Critical",
        status: "plan",
        segments: [],
      },
    ];

    saveTasks(tasks);

    expect(loadTasks()).toEqual(tasks);
  });

  test("저장된 것이 없으면 빈 배열을 돌려준다", () => {
    expect(loadTasks()).toEqual([]);
  });
});
