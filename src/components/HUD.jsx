import PixelIcon from "./PixelIcon";

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

export default function HUD({
  day,
  location,
  objectives,
  resources,
  onEndDay,
  onTrack,
  canEndDay,
}) {
  return (
    <div className="hud" aria-label="Mission status">
      <section className="hud-card hud-mission">
        <p className="hud-kicker">
          SOL {day} · {location}
        </p>
        <ul className="quest-list">
          {objectives.map((objective) => {
            const target = objective.nextTarget;
            return (
              <li key={objective.id}>
                <button
                  type="button"
                  className={`quest ${objective.done ? "is-done" : ""}`}
                  onClick={() => onTrack?.(target)}
                  disabled={objective.done || !target}
                  title={target ? "Walk here" : undefined}
                >
                  <span className="quest-icon">
                    <PixelIcon name={objective.icon} size={11} />
                  </span>
                  <span className="quest-label">{objective.label}</span>
                  {objective.progressMax > 0 ? (
                    <span
                      className="quest-pips"
                      aria-label={`${objective.progress} of ${objective.progressMax}`}
                    >
                      {Array.from({ length: objective.progressMax }, (_, i) => (
                        <span key={i} className={i < objective.progress ? "is-filled" : ""} />
                      ))}
                    </span>
                  ) : (
                    <span className="quest-check">{objective.done ? "★" : ""}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="hud-right">
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

        <div className="hud-actions">
          <button
            type="button"
            className="sleep-button"
            onClick={onEndDay}
            disabled={!canEndDay}
          >
            <PixelIcon name="moon" size={12} />
            End Day
          </button>
          <p className="hud-hint">
            {canEndDay ? "All done! Time to sleep." : "Finish the list to sleep."}
          </p>
        </div>
      </div>
    </div>
  );
}
