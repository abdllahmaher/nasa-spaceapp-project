import { DAY01 } from "./day01";
export const DAY04 = {
  ...DAY01, day: 4, location: "Jezero Crater",
  objectives:[
    {id:"clouds_day4",icon:"crew",label:"Ask Rex to log the morning sky",targets:["rex"],targetOpen:(t,s)=>!s.seen.includes(t),check:s=>s.seen.includes("rex")},
    {id:"habitat_day4",icon:"home",label:"Ask Kai to inspect the habitat seal",targets:["kai"],targetOpen:(t,s)=>!s.seen.includes(t),check:s=>s.seen.includes("kai")},
    {id:"filter_day4",icon:"drop",label:"Ask Nova to check the water loop",targets:["nova"],targetOpen:(t,s)=>!s.seen.includes(t),check:s=>s.seen.includes("nova")},
  ],
  briefing:{...DAY01.briefing,kicker:"SOL 4 · JEZERO",title:"A hazy Martian morning",lines:["Morning ice hazes and water-ice clouds have been observed over Jezero.","Let's log the sky and make sure the habitat and water loop are ready."],hint:"Talk to each specialist to complete today's checks.",startLabel:"Start Sol 4",weather:{headline:"Morning water-ice haze",level:"haze",line:"Morning ice hazes and occasional water-ice clouds have been observed by Perseverance. The scene is an educational depiction, not a forecast.",source:"NASA Perseverance atmospheric observations",sourceUrl:"https://science.nasa.gov/blog/perseverance-pays-off-when-studying-the-martian-atmosphere/"}},
  interactions:{...DAY01.interactions,rex:{speaker:"rex",eyebrow:"SKY LOG · SOL 4",title:"Morning haze",body:["I can see a thin bright haze near the sunrise.","Perseverance has observed morning ice haze at Jezero. I'll add it to our sky log."]},kai:{speaker:"kai",eyebrow:"HABITAT · SOL 4",title:"Seal inspection",body:["The outer seal looks seated correctly.","I'll mark the inspection complete and keep monitoring pressure."]},nova:{speaker:"nova",eyebrow:"WATER LOOP · SOL 4",title:"Water check",body:["The loop is circulating normally.","I'll inspect the filter mesh for dust before the next cycle."]}}
};
