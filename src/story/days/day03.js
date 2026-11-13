import { DAY01 } from "./day01";
export const DAY03 = {
  ...DAY01, day: 3, location: "Jezero Crater",
  objectives: [
    { id:"inspect_power_day3", icon:"bolt", label:"Ask Kai to test the power reserve", targets:["kai"], targetOpen:(t,s)=>!s.seen.includes(t), check:s=>s.seen.includes("kai") },
    { id:"inspect_air_day3", icon:"drop", label:"Ask Nova to check the air filters", targets:["nova"], targetOpen:(t,s)=>!s.seen.includes(t), check:s=>s.seen.includes("nova") },
    { id:"terrain_day3", icon:"crew", label:"Get Rex's dust-field report", targets:["rex"], targetOpen:(t,s)=>!s.seen.includes(t), check:s=>s.seen.includes("rex") },
  ],
  briefing:{...DAY01.briefing,kicker:"SOL 3 · JEZERO",title:"Dust on the horizon",lines:["Crew, the wind has been lifting fine dust across Jezero.","Check the power reserve, air filters, and Rex's terrain report."],hint:"Three crew radio check-ins are waiting.",startLabel:"Start Sol 3",weather:{headline:"Dust-lifting gusts",level:"dust",line:"Wind gusts can lift broad clouds of dust at Jezero. This is a documented Martian process, shown as a mild visual effect rather than a forecast.",source:"NASA Perseverance / MEDA observations",sourceUrl:"https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-perseverance-studies-the-wild-winds-of-jezero-crater/"}},
  interactions:{...DAY01.interactions,kai:{speaker:"kai",eyebrow:"POWER CHECK · SOL 3",title:"Reserve test",body:["I ran a short load test on the power junction.","The readings are stable for now. Keep an eye on the reserve." ]},nova:{speaker:"nova",eyebrow:"LIFE SUPPORT · SOL 3",title:"Air filter check",body:["The intake filter has a thin layer of Martian dust.","I'll clean the outer screen and log the airflow." ]},rex:{speaker:"rex",eyebrow:"SCIENCE · SOL 3",title:"Dust field report",body:["I spotted fresh streaks where gusts moved loose dust.","No rain or liquid water here — just wind-driven dust." ]}}
};
