import { motion } from "framer-motion";

/**
 * PIP in the world, drawn as an overlay so it can hover over the canvas and fly
 * to the edge of the screen without touching the game renderer.
 *
 * If you drop `assets/props/drone.png` into the project, pass `sprite` here and
 * the image replaces the drawn body — nothing else has to change.
 */
import sprite from "../assets/props/drone.png"
export default function DroneCompanion({
  mode = "dock",
  alert = false,
  open = false,
  sprite = null,
  onClick,
}) {
  const active = mode === "talk" || open;

  return (
    <motion.button
      type="button"
      className={`drone drone-${mode} ${alert ? "drone-alert" : ""} ${open ? "is-open" : ""}`}
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
        <span className="drone-shadow" aria-hidden="true" />
      </motion.span>

      {alert && <span className="drone-badge" aria-hidden="true">!</span>}
      {!open && !alert && <span className="drone-hint">PIP</span>}
    </motion.button>
  );
}
