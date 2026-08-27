export type TaskStatus = "plan" | "progress" | "done";

export type TaskType = "이슈" | "기능";

export type Severity = "Critical" | "Major" | "Minor";

export type SegmentOutcome = "done" | "held";

export interface ScheduleSegment {
  start: string; // YYYY-MM-DD
  end: string | null; // null이면 아직 열려 있는 구간
  outcome?: SegmentOutcome; // end가 있을 때만 의미를 가짐
}

export interface Task {
  id: string;
  title: string;
  content: string;
  type: TaskType;
  severity: Severity;
  status: TaskStatus;
  segments: ScheduleSegment[];
}
