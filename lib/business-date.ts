import { TZDate } from "react-day-picker";

export const BUSINESS_TIME_ZONE = "Asia/Jakarta";

// Calendar dates always represent noon in Jakarta, never browser-local midnight.
export function toCalendarDate(value: string): TZDate {
  const [year, month, day] = value.split("-").map(Number);
  return new TZDate(year, month - 1, day, 12, BUSINESS_TIME_ZONE);
}

export function fromCalendarDate(value: Date): string {
  const date = new TZDate(value, BUSINESS_TIME_ZONE);
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
