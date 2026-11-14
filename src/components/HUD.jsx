import PixelIcon from "./PixelIcon";

/**
 * The bars. Tasks, warnings and sleep now belong to PIP's panel, so the HUD
 * keeps only the four systems the drone teaches on Sol 1.
 */
const METERS = [
  { key: "storedPower", label: "Power", icon: "bolt", color: "#ffd166", guideId: "hud-power" },
  { key: "lifeSupportCondition", label: "Air", icon: "drop", color: "#7ee0ff", guideId: "hud-air" },
  { key: "food", label: "Food", icon: "leaf", color: "#9df5a8", guideId: "hud-food" },
];

const BLOCKS = 10;

function Meter({ label, icon, color, value, guideId }) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * BLOCKS);

  return (
    <div className="meter" style={{ "--meter-color": color }} data-pip-target={guideId}>
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
            guideId={meter.guideId}
          />
        ))}
        <div className="parts" data-pip-target="hud-parts">
          <span className="parts-label">
            <PixelIcon name="wrench" size={11} /> Parts
          </span>
          <span
            className="parts-pips"
            aria-label={`${resources.spareParts} spare parts`}
          >
            {Array.from(
              // Four is the usual load-out, but a survey can add a fifth.
              { length: Math.max(4, Math.ceil(resources.spareParts ?? 0)) },
              (_, i) => (
                <span key={i} className={i < resources.spareParts ? "is-filled" : ""} />
              ),
            )}
          </span>
        </div>
      </section>
    </div>
  );
}
