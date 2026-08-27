import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";

import Home from "@/app/page";

beforeEach(() => {
  window.localStorage.clear();
});

test("새로운 작업을 등록하면 계획 열에 나타난다", async () => {
  render(<Home />);

  fireEvent.click(screen.getByRole("button", { name: "New" }));
  fireEvent.change(await screen.findByLabelText("제목"), {
    target: { value: "결제 실패 로그 알림 연동" },
  });
  fireEvent.click(screen.getByRole("button", { name: "등록" }));

  const planHeading = await screen.findByRole("heading", { name: /계획/ });
  const planColumn = planHeading.closest("div")!.parentElement!;
  expect(within(planColumn).getByText("결제 실패 로그 알림 연동")).toBeInTheDocument();
});

test("확인창에서 승인하면 선택된 작업이 삭제된다", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  render(<Home />);

  fireEvent.click(screen.getByRole("button", { name: "New" }));
  fireEvent.change(await screen.findByLabelText("제목"), {
    target: { value: "삭제할 작업" },
  });
  fireEvent.click(screen.getByRole("button", { name: "등록" }));

  fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

  expect(screen.queryByText("삭제할 작업")).not.toBeInTheDocument();
});
