import { DAY01 } from "./day01";
import { JEZERO_SITE } from "../../data/nasa/sources";

/**
 * Sol 2 has a fresh objective set. The interactions reuse the existing
 * stations and crew, while progress is tracked independently from Sol 1.
 */
export const DAY02 = {
  ...DAY01,
  day: 2,
  location: "Jezero Crater",
  coordinates: JEZERO_SITE.coordinates,
  objectives: [
    { id:"water_filter", icon:"drop", label:"Ask Nova about the water filter", targets:["nova"], targetOpen:(t,state)=>!state.seen.includes(t), check:(state)=>state.seen.includes("nova") },
    { id:"habitat_seal", icon:"home", label:"Ask Kai to check the habitat seal", targets:["kai"], targetOpen:(t,state)=>!state.seen.includes(t), check:(state)=>state.seen.includes("kai") },
    { id:"science_briefing", icon:"crew", label:"Talk to Rex about the crater", targets:["rex"], targetOpen:(t,state)=>!state.seen.includes(t), check:(state)=>state.seen.includes("rex") },
  ],
  briefing: {
    ...DAY01.briefing,
    kicker: "SOL 2 · JEZERO",
    title: "A new Sol begins",
    speaker: "layla",
    lines: [
      "Good morning, crew. Let's check the water system and habitat.",
      "Then catch up with Rex about the nearby terrain.",
    ],
    hint: "Complete the three checks before the next night cycle.",
    startLabel: "Start Sol 2",
    weather: {
      headline: "Dust-devil observation window",
      level: "dust",
      line: "Perseverance has recorded frequent dust devils at Jezero. The light drifting dust is an educational visualization of that observed phenomenon, not a prediction for this Sol.",
      source: "NASA/JPL · Perseverance MEDA and camera observations",
      sourceUrl: "https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-perseverance-studies-the-wild-winds-of-jezero-crater/",
    },
  },
  interactions: {
    ...DAY01.interactions,
    nova: { speaker:"nova", eyebrow:"WATER LOOP · SOL 2", title:"Water filter report", body:["I checked the water filter housing.","There is dust on the outer mesh. I'll clean it before the next circulation cycle."] },
    kai: { speaker:"kai", eyebrow:"HABITAT · SOL 2", title:"Habitat seal report", body:["I checked the dome's outer seal and pressure fittings.","Everything is seated correctly. I'll keep monitoring the pressure gauge."] },
    rex: { speaker:"rex", eyebrow:"SCIENCE · SOL 2", title:"Crater terrain report", body:["I mapped a fresh set of wind-shaped dust streaks nearby.","I'll compare them with our next rover images."] },
  },
};
