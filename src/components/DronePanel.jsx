import PixelIcon from "./PixelIcon";

/**
 * PIP's panel. It replaces the old HUD quest card: the drone owns the task list,
 * the warnings and the sleep button, exactly as the mission brief asked.
 */
export default function DronePanel({
  day,
  mission,
  groups = [],
  alerts = [],
  resources,
  canSleep,
  decision,
  onTrack,
  onAnswer,
  onSleep,
  onClose,
}) {
  const total = groups.reduce((sum, group) => sum + group.tasks.length, 0);
  const done = groups.reduce(
    (sum, group) => sum + group.tasks.filter((task) => task.status === "done").length,
    0,
  );

  return (
    <aside className="drone-panel" aria-label="PIP drone panel">
      <header className="drone-panel-head">
        <div>
          <p className="drone-panel-kicker">PIP · Outpost Drone</p>
          <h2>{mission?.title ?? `Sol ${day}`}</h2>
        </div>
        <button type="button" className="drone-panel-close" onClick={onClose} aria-label="Close PIP">
          ×
        </button>
      </header>

      <p className="drone-panel-brief">{mission?.brief}</p>

      <div className="drone-panel-progress">
        <span>
          SOL {day} · {done}/{total} TASKS
        </span>
        <span className="drone-panel-bar" aria-hidden="true">
          <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </span>
      </div>

      {decision && (
        <button type="button" className="drone-decision" onClick={onAnswer}>
          <span className="drone-decision-kicker">DECISION WAITING</span>
          <strong>{decision.shortTitle ?? decision.title}</strong>
          <span className="drone-decision-go">Answer PIP ›</span>
        </button>
      )}

      <div className="drone-task-groups">
        {groups.map((group) => (
          <section key={group.name} className="drone-task-group">
            <h3>{group.name}</h3>
            <ul>
              {group.tasks.map(({ subtask, status }) => (
                <li key={subtask.id}>
                  <button
                    type="button"
                    className={`drone-task drone-task-${status}`}
                    onClick={() => onTrack(subtask.target)}
                    disabled={status !== "open"}
                    title={
                      status === "locked"
                        ? "Finish the tasks above first"
                        : status === "done"
                          ? "Done for this Sol"
                          : subtask.how ?? "Walk over and start this task"
                    }
                  >
                    <span className="drone-task-icon">
                      <PixelIcon name={subtask.icon ?? "crew"} size={12} />
                    </span>
                    <span className="drone-task-label">{subtask.label}</span>
                    <span className="drone-task-state" aria-hidden="true">
                      {status === "done" ? "★" : status === "locked" ? "🔒" : "›"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {alerts.length > 0 && (
        <section className="drone-alerts" aria-label="Warnings">
          <h3>Alerts</h3>
          {alerts.slice(0, 4).map((alert) => (
            <p key={alert.id} className={`drone-alert-line drone-alert-${alert.level}`}>
              <strong>{alert.title}</strong> {alert.detail}
            </p>
          ))}
        </section>
      )}

      {resources && (
        <p className="drone-panel-note">
          Batteries {Math.round(resources.storedPower)}% · Air {Math.round(resources.lifeSupportCondition)}% ·
          Water {Math.round(resources.water)}%
        </p>
      )}

      <button
        type="button"
        className="drone-sleep"
        onClick={onSleep}
        disabled={!canSleep}
        title={canSleep ? "End this Sol" : "Finish every task first"}
      >
        <PixelIcon name="moon" size={12} /> {canSleep ? `Sleep · Sol ${day + 1}` : "Tasks remaining"}
      </button>
    </aside>
  );
}
