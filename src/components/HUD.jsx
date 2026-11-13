import { RESOURCES, formatResource } from "../logic/resources";

export default function HUD({
  day,
  location,
  coordinates,
  objectives,
  resources,
  onEndDay,
  canEndDay,
}) {
  return (
    <div className="hud" aria-label="Mission status">
      <section className="hud-panel hud-mission">
        <p className="hud-kicker">
          SOL {day} · {location}
        </p>
        <div className="hud-title-row">
          <h2>Mission board</h2>
          <span className="hud-coords">{coordinates}</span>
        </div>
        <ul className="hud-objectives">
          {objectives.map((objective) => {
            const detail =
              !objective.done && objective.progress ? objective.progress : null;
            return (
              <li
                key={objective.id}
                className={`hud-objective ${objective.done ? "is-done" : ""}`}
              >
                <span className="hud-check" aria-hidden="true">
                  {objective.done ? "✓" : "○"}
                </span>
                <span>{objective.label}</span>
                {detail && <span className="hud-progress">{detail}</span>}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="hud-panel hud-resources">
        <p className="hud-kicker">OUTPOST STATUS</p>
        <div className="resource-grid">
          {RESOURCES.map((resource) => {
            const value = resources[resource.key] ?? 0;
            const low = resource.unit === "%" && value < 35;
            return (
              <div className={`resource ${low ? "is-low" : ""}`} key={resource.key}>
                <span className="resource-label">{resource.label}</span>
                <strong className="resource-value">
                  {formatResource(resource.key, value)}
                </strong>
                {resource.unit === "%" && (
                  <span className="resource-bar" aria-hidden="true">
                    <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="hud-actions">
        <button
          type="button"
          className="end-day-button"
          onClick={onEndDay}
          disabled={!canEndDay}
        >
          End Sol {day}
        </button>
        <p className="hud-hint">
          {canEndDay ? "Checklist complete." : "Finish the checklist to end the day."}
        </p>
      </div>
    </div>
  );
}
