import { PORTRAITS } from "../data/portraits";

/**
 * Shows idle frame 0 from a character sheet as a crisp pixel portrait.
 * The sheet is 8×7 frames of 128px, so the background is scaled by 8×7.
 */
export default function Portrait({ id, size = 132, className = "" }) {
  const person = PORTRAITS[id] ?? PORTRAITS.layla;

  return (
    <div
      className={`portrait ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${person.src})`,
        backgroundSize: `${size * 8}px ${size * 7}px`,
        backgroundPosition: "0 0",
        "--accent": person.accent,
      }}
      role="img"
      aria-label={`${person.name}, ${person.role}`}
    >
      <span className="portrait-spark" aria-hidden="true" />
    </div>
  );
}
