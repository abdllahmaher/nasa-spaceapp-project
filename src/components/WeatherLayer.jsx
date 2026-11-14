import { motion, useReducedMotion } from "framer-motion";

/**
 * Weather on the surface, drawn with Framer Motion.
 *
 * The canvas paints the world; this layer adds the atmosphere the game data
 * describes (`clear`, `haze`, `dust`, `storm`, `frost`). Every particle is a
 * plain motion span, so the effect never touches the game loop and can be
 * turned off entirely for players who prefer reduced motion.
 */

const PRESETS = {
  storm: {
    label: "Dust storm",
    tint: "linear-gradient(105deg, rgba(96, 62, 36, 0.42), rgba(180, 126, 70, 0.34))",
    streak: {
      count: 44,
      className: "weather-streak",
      duration: [1.5, 3.4],
      x: [-300, -540],
      y: [10, 34],
      opacity: [0, 0.9, 0],
      width: [10, 30],
      height: [2, 4],
    },
    clouds: { count: 7, duration: [9, 16], opacity: 0.5 },
    gusts: 4,
    pulse: [0.92, 1, 0.82, 1],
  },
  dust: {
    label: "Blowing dust",
    tint: "linear-gradient(110deg, rgba(132, 92, 51, 0.24), rgba(186, 145, 91, 0.2))",
    streak: {
      count: 22,
      className: "weather-mote",
      duration: [4.5, 8.5],
      x: [-90, -210],
      y: [8, 26],
      opacity: [0, 0.7, 0],
      width: [4, 9],
      height: [3, 6],
    },
    clouds: { count: 3, duration: [18, 28], opacity: 0.34 },
    gusts: 1,
    pulse: [0.94, 1, 0.9],
  },
  haze: {
    label: "Settling haze",
    tint: "linear-gradient(180deg, rgba(196, 210, 220, 0.18), rgba(196, 210, 220, 0.08))",
    streak: {
      count: 12,
      className: "weather-mote",
      duration: [9, 15],
      x: [-24, -60],
      y: [0, 12],
      opacity: [0, 0.42, 0],
      width: [6, 13],
      height: [4, 8],
    },
    clouds: { count: 4, duration: [22, 34], opacity: 0.26 },
    gusts: 0,
    pulse: [0.94, 1, 0.92],
  },
  frost: {
    label: "Cold frost",
    tint: "linear-gradient(180deg, rgba(146, 196, 224, 0.16), rgba(120, 160, 210, 0.08))",
    streak: {
      count: 34,
      className: "weather-crystal",
      duration: [5, 10],
      x: [0, 20, 42],
      y: [0, 60, 130],
      opacity: [0, 0.85, 0],
      width: [3, 6],
      height: [3, 6],
    },
    clouds: { count: 2, duration: [26, 38], opacity: 0.18 },
    gusts: 0,
    pulse: [0.96, 1, 0.94],
  },
};

/** Deterministic pseudo-random spread: same scene on every render. */
const spread = (index, seed, step) => (index * seed + step) % 100;
const between = (index, min, max) => min + (index % 100) / 100 * (max - min);

function Particle({ preset, index }) {
  const spec = preset.streak;
  const size = between(index, spec.width[0], spec.width[1]);
  const height = between(index + 5, spec.height[0], spec.height[1]);
  const duration = between(index, spec.duration[0], spec.duration[1]);
  const drift = between(index + 11, spec.x[0], spec.x[1]);
  const rise = between(index + 17, spec.y[0], spec.y[1]);

  return (
    <motion.span
      className={`weather-particle ${spec.className}`}
      style={{
        left: `${spread(index, 37, 7)}%`,
        top: `${spread(index, 53, 13)}%`,
        width: size,
        height,
      }}
      animate={{
        x: [0, drift * 0.55, drift],
        y: [0, rise * 0.4, rise],
        opacity: spec.opacity,
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay: (index % 12) * 0.22,
        ease: "linear",
      }}
    />
  );
}

function Cloud({ preset, index }) {
  const spec = preset.clouds;
  const width = between(index, 140, 360);
  const height = between(index + 9, 40, 110);
  const duration = between(index, spec.duration[0], spec.duration[1]);

  return (
    <motion.span
      className="weather-cloud"
      style={{
        left: `${spread(index, 71, 3)}%`,
        top: `${spread(index, 29, 22)}%`,
        width,
        height,
        opacity: spec.opacity,
      }}
      animate={{
        x: [0, -90, -180],
        y: [0, -8, 0],
        opacity: [spec.opacity * 0.6, spec.opacity, spec.opacity * 0.5],
      }}
      transition={{ duration, repeat: Infinity, delay: index * 1.7, ease: "linear" }}
    />
  );
}

function Gust({ index }) {
  return (
    <motion.span
      className="weather-gust"
      style={{ top: `${12 + index * 22}%` }}
      animate={{
        x: ["-40%", "140%"],
        opacity: [0, 0.55, 0],
        scaleY: [0.6, 1, 0.7],
      }}
      transition={{
        duration: 5.5 + index * 1.3,
        repeat: Infinity,
        delay: index * 1.9,
        repeatDelay: 2.4,
        ease: "easeInOut",
      }}
    />
  );
}

export default function WeatherLayer({ level = "clear" }) {
  const reduced = useReducedMotion();
  const preset = PRESETS[level];
  if (!preset) return null;

  return (
    <motion.div
      className={`weather-fx weather-${level}`}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    >
      <motion.span
        className="weather-tint"
        style={{ background: preset.tint }}
        animate={reduced ? { opacity: 1 } : { opacity: preset.pulse }}
        transition={reduced ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {!reduced &&
        preset.clouds.count > 0 &&
        Array.from({ length: preset.clouds.count }, (_, index) => (
          <Cloud key={`cloud-${index}`} preset={preset} index={index} />
        ))}

      {!reduced &&
        preset.gusts > 0 &&
        Array.from({ length: preset.gusts }, (_, index) => (
          <Gust key={`gust-${index}`} index={index} />
        ))}

      {!reduced &&
        Array.from({ length: preset.streak.count }, (_, index) => (
          <Particle key={`particle-${index}`} preset={preset} index={index} />
        ))}

      <span className="weather-vignette" />
    </motion.div>
  );
}
