import PixelIcon from "./PixelIcon";

/**
 * The bars. Tasks, warnings and sleep now belong to PIP's panel, so the HUD
 * keeps only the four systems the drone teaches on Sol 1.
 */
const METERS = [
  { key: "storedPower", label: "Power", icon: "bolt", color: "#ffd166" },
  { key: "lifeSupportCondition", label: "Air", icon: "drop", color: "#7ee0ff" },
  { key: "food", label: "Food", icon: "leaf", color: "#9df5a8" },
];

const BLOCKS = 10;

function Meter({ label, icon, color, value }) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * BLOCKS);

  return (
    <div className="meter" style={{ "--meter-color": color }}>
      <span className="meter-icon">
        <PixelIcon name={icon} size={12} />
      </span>
      <span className="meter-label">{label}</span>
      <span className="meter-track" aria-hidden="true">
        {Array.from({ length: BLOCKS }, (_, i) => (
          <span key={i} className={i < filled ? "is-filled" : ""} />
        ))}
      </span>
    </div>
  );
}

export default function HUD({ resources }) {
  return (
    <div className="hud" aria-label="Outpost systems">
      <section className="hud-card hud-meters">
        {METERS.map((meter) => (
          <Meter
            key={meter.key}
            label={meter.label}
            icon={meter.icon}
            color={meter.color}
            value={resources[meter.key] ?? 0}
          />
        ))}
        <div className="parts">
          <span className="parts-label">
            <PixelIcon name="wrench" size={11} /> Parts
          </span>
          <span className="parts-pips" aria-label={`${resources.spareParts} spare parts`}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={i < resources.spareParts ? "is-filled" : ""} />
            ))}
          </span>
        </div>
      </section>
    </div>
  );
}
