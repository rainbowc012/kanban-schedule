const DAY_MS = 86_400_000;

// 날짜는 전부 UTC로 계산한다. 로컬 자정으로 만든 Date를 toISOString()
// (항상 UTC)으로 되돌리면, 로컬 타임존이 UTC보다 앞선 환경(KST 등)에서
// 하루가 밀리는 문제가 생기기 때문이다.
export function toUtcDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number): string {
  return toIsoDate(new Date(toUtcDate(isoDate).getTime() + days * DAY_MS));
}
