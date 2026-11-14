import { motion } from "framer-motion";

/**
 * PIP in the world, drawn as an overlay so it can hover over the canvas and fly
 * to the edge of the screen without touching the game renderer.
 *
 * The sprite lives at `assets/props/drone.png`; the CSS-drawn body remains as a
 * fallback for when the image is missing.
 */
import droneSprite from "../assets/props/drone.png";

export default function DroneCompanion({
  mode = "dock",
  alert = false,
  alertInfo = null,
  alertCount = 0,
  open = false,
  sprite = droneSprite,
  spot = null,
  onClick,
}) {
  const active = mode === "talk" || open;
  const spotStyle = spot
    ? { left: `${spot.x}px`, top: `${spot.y}px`, bottom: "auto", right: "auto" }
    : undefined;

  return (
    <motion.button
      type="button"
      className={`drone drone-${mode} ${alert ? "drone-alert" : ""} ${open ? "is-open" : ""} ${spot ? "is-flying" : ""}`}
      style={spotStyle}
      onClick={onClick}
      aria-label={alert ? "PIP has an alert. Open the drone panel." : "Open PIP, your outpost drone"}
      aria-expanded={open}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.span
        className="drone-body"
        animate={{ y: active ? [0, -4, 0] : [0, -2.5, 0] }}
        transition={{ duration: active ? 1.6 : 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {sprite ? (
          <img className="drone-sprite" src={sprite} alt="" />
        ) : (
          <span className="drone-art" aria-hidden="true">
            <span className="drone-rotor drone-rotor-left" />
            <span className="drone-rotor drone-rotor-right" />
            <span className="drone-shell">
              <span className="drone-eye" />
              <span className="drone-mouth" />
            </span>
            <span className="drone-leg drone-leg-left" />
            <span className="drone-leg drone-leg-right" />
          </span>
        )}
        {!sprite && <span className="drone-shadow" aria-hidden="true" />}
      </motion.span>

      {alert && <span className="drone-alert-ring" aria-hidden="true" />}
      {alert && <span className="drone-badge" aria-hidden="true">!</span>}

      {alert && !open && alertInfo && (
        <motion.span
          className={`drone-alert-callout drone-alert-${alertInfo.level}`}
          aria-hidden="true"
          initial={{ opacity: 0, x: -14, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 21 }}
        >
          <span className="drone-alert-kicker">
            {alertInfo.kind === "forecast" ? "INCOMING" : "ALERT"}
          </span>
          <span className="drone-alert-title">{alertInfo.title}</span>
          {alertCount > 1 && (
            <span className="drone-alert-more">+{alertCount - 1} more</span>
          )}
        </motion.span>
      )}

      {!open && !alert && !active && <span className="drone-hint">PIP</span>}
    </motion.button>
  );
}
