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
