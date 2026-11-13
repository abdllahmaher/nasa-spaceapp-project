/**
 * Cached NASA data used by the Day 1 briefing.
 *
 * These are snapshots, not a live fetch at runtime. The UI always shows the
 * retrieval date and labels the source. DONKI products are preliminary CCMC
 * research, so the game never presents them as an official forecast.
 */
export const NASA_SOURCES = {
  donki: {
    name: "NASA DONKI",
    longName: "Space Weather Database Of Notifications, Knowledge, Information",
    url: "https://api.nasa.gov/DONKI/notifications",
    mode: "live",
    retrievedAt: "2026-11-13",
  },
  marsTrek: {
    name: "NASA Mars Trek",
    longName: "Mars Trek — MRO CTX Jezero mosaic",
    url: "https://trek.nasa.gov/mars/",
    mode: "archived",
    retrievedAt: "2026-11-13",
  },
};

export const DONKI_ADVISORY = {
  sourceId: "donki",
  mode: "live",
  issuedAt: "2026-11-11T21:02Z",
  eventStart: "2026-11-09T18:15Z",
  predictedImpact: "2026-11-13T12:00Z",
  window: "±7 hours",
  speed: "~726 km/s",
  headline: "CME predicted to glance Mars",
  summary:
    "A coronal mass ejection is predicted to deliver a glancing blow at Mars " +
    "around 2026-11-13T12:00Z (±7 hours). Preliminary CCMC modeling; not an " +
    "official forecast.",
};

export const JEZERO_SITE = {
  name: "Jezero Crater",
  coordinates: "18.44°N 77.45°E",
  sourceId: "marsTrek",
  note: "Site context from NASA Mars Trek's MRO CTX Jezero mosaic.",
};

// Atmospheric effects in the game are based on documented Jezero observations.
// Mars has no liquid-rain weather; use dust lifting, dust devils and water-ice haze/clouds.
export const JEZERO_WEATHER_SOURCES = [
  { title: "NASA: Perseverance Studies the Wild Winds of Jezero Crater", url: "https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-perseverance-studies-the-wild-winds-of-jezero-crater/" },
  { title: "NASA: Perseverance Pays Off When Studying the Martian Atmosphere", url: "https://science.nasa.gov/blog/perseverance-pays-off-when-studying-the-martian-atmosphere/" },
  { title: "NASA/JPL: Dust Devil Observations", url: "https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/perseverance-rover-witnesses-one-martian-dust-devil-eating-another/" },
];
