import { DAY01 } from "./day01";
import { DAY02 } from "./day02";
import { DAY03 } from "./day03";
import { DAY04 } from "./day04";
import { DAY05 } from "./day05";
export const DAYS = { 1: DAY01, 2: DAY02, 3: DAY03, 4: DAY04, 5: DAY05 };
export function getDay(day) {
  if (DAYS[day]) return DAYS[day];
  // Later sols continue with a distinct rotating objective set and an honest
  // label: a scheduled science watch, not a fabricated live weather forecast.
  const template = [DAY03, DAY04, DAY05][(Math.max(6, day) - 6) % 3];
  const rotation = [
    ["Review the rover's dust readings", "Check the station seals", "Log the morning sky"],
    ["Inspect the power junction", "Review the air intake", "Map the wind-shaped surface"],
    ["Check the habitat pressure", "Review the water loop", "Complete the science log"],
  ][day % 3];
  const names = ["kai", "nova", "rex"];
  const icons = ["bolt", "drop", "crew"];
  const objectives = names.map((name, index) => ({
    id: `sol${day}_${name}`,
    icon: icons[index],
    label: rotation[index],
    targets: [name],
    targetOpen: (target, state) => !state.seen.includes(target),
    check: (state) => state.seen.includes(name),
  }));
  const interactions = { ...template.interactions };
  for (const [index, name] of names.entries()) {
    const old = interactions[name];
    interactions[name] = {
      ...old,
      eyebrow: `${old.eyebrow?.split(" · ")[0] ?? "CREW RADIO"} · SOL ${day}`,
      title: `${old.title} · Sol ${day}`,
      body: [
        `Commander, this is ${name[0].toUpperCase() + name.slice(1)} checking in for Sol ${day}.`,
        `${rotation[index]}. I've logged the inspection in today's mission record.`,
      ],
    };
  }
  return { ...template, day, objectives, interactions, briefing: { ...template.briefing, kicker: `SOL ${day} · JEZERO`, title: `Sol ${day}: science watch`, lines: [`Welcome to Sol ${day}, crew. Today's checks are ready.`, ...template.briefing.lines.slice(1)], startLabel: `Start Sol ${day}` } };
}
export { DAY01, DAY02, DAY03, DAY04, DAY05 };
