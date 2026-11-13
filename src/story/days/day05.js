import { DAY01 } from "./day01";
export const DAY05 = {
  ...DAY01, day: 5, location: "Jezero Crater",
  objectives:[
    {id:"dust_watch_day5",icon:"crew",label:"Ask Rex to review the dust watch",targets:["rex"],targetOpen:(t,s)=>!s.seen.includes(t),check:s=>s.seen.includes("rex")},
    {id:"power_day5",icon:"bolt",label:"Ask Kai to verify the solar array",targets:["kai"],targetOpen:(t,s)=>!s.seen.includes(t),check:s=>s.seen.includes("kai")},
    {id:"air_day5",icon:"drop",label:"Ask Nova to check the habitat air",targets:["nova"],targetOpen:(t,s)=>!s.seen.includes(t),check:s=>s.seen.includes("nova")},
  ],
  briefing:{...DAY01.briefing,kicker:"SOL 5 · JEZERO",title:"Dust-watch day",lines:["The crew has scheduled another dust observation window.","Check the array, the air system, and Rex's weather notes."],hint:"The dust is a real Martian hazard; this is not an Earth-style rainstorm.",startLabel:"Start Sol 5",weather:{headline:"Dust-devil observation window",level:"storm",line:"Dust devils and dust-lifting gusts have been recorded at Jezero. Their timing is unpredictable, so this is a themed observation window, not a claimed forecast.",source:"NASA/JPL Perseverance observations",sourceUrl:"https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/perseverance-rover-witnesses-one-martian-dust-devil-eating-another/"}},
  interactions:{...DAY01.interactions,rex:{speaker:"rex",eyebrow:"WEATHER · SOL 5",title:"Dust watch",body:["Dust devils can pass the rover several times in a sol.","I'll scan the horizon and log any visible vortices."]},kai:{speaker:"kai",eyebrow:"POWER · SOL 5",title:"Array check",body:["Fine dust can settle on exposed equipment.","The array is clear enough for today's operations."]},nova:{speaker:"nova",eyebrow:"LIFE SUPPORT · SOL 5",title:"Air system",body:["The habitat air remains within our operating limits.","I'll keep the intake shield closed during dusty periods."]}}
};
