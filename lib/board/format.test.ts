import { expect, test } from "vitest";

import { formatMonthDay } from "./format";

test("ISO 날짜를 월/일로 축약한다", () => {
  expect(formatMonthDay("2026-08-05")).toBe("8/5");
  expect(formatMonthDay("2026-12-31")).toBe("12/31");
});
