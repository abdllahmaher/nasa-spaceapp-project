import { DAY01, DAYS } from "./day01";

export function getDay(day) {
  return DAYS[day] ?? DAY01;
}

export { DAY01 };
