import PixelIcon from "./PixelIcon";
import droneSprite from "../assets/props/drone.png";

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
  onAlert,
  onSleep,
  onClose,
}) {
  const total = groups.reduce((sum, group) => sum + group.tasks.length, 0);
  const done = groups.reduce(
    (sum, group) => sum + group.tasks.filter((task) => task.status === "done").length,
    0,
  );
  // The first task the player can actually start right now. PIP keeps it at
  // the top so the panel always answers "what do I do next?".
  let next = null;
  for (const group of groups) {
    const task = group.tasks.find((entry) => entry.status === "open");
    if (task) {
      next = { ...task, groupName: group.name };
      break;
    }
  }

  return (
    <aside className="drone-panel" aria-label="PIP drone panel">
      <header className="drone-panel-head">
        <img className="drone-panel-sprite" src={droneSprite} alt="" aria-hidden="true" />
        <div className="drone-panel-heading">
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

      {alerts.length > 0 && (
        <button
          type="button"
          className={`drone-alert-banner drone-alert-${alerts[0].level}`}
          onClick={onAlert}
        >
          <span className="drone-alert-siren" aria-hidden="true" />
          <span className="drone-alert-banner-copy">
            <span className="drone-alert-banner-kicker">
              {alerts[0].kind === "forecast"
                ? "INCOMING · FORECAST"
                : alerts[0].level === "critical"
                  ? "CRITICAL ALERT"
                  : "PIP ALERT"}
            </span>
            <strong>{alerts[0].title}</strong>
            <span className="drone-alert-banner-detail">{alerts[0].detail}</span>
            {alerts.length > 1 && (
              <span className="drone-alert-banner-more">
                +{alerts.length - 1} more warning{alerts.length > 2 ? "s" : ""} · tap to hear PIP
              </span>
            )}
          </span>
        </button>
      )}

      {decision && (
        <button type="button" className="drone-decision" onClick={onAnswer}>
          <span className="drone-decision-kicker">DECISION WAITING</span>
          <strong>{decision.shortTitle ?? decision.title}</strong>
          <span className="drone-decision-go">Answer PIP ›</span>
        </button>
      )}

      {next && (
        <button
          type="button"
          className="drone-next"
          onClick={() => onTrack(next.subtask.target)}
        >
          <span className="drone-next-kicker">NEXT UP · {next.groupName}</span>
          <strong>{next.subtask.label}</strong>
          {next.subtask.how && <span className="drone-next-hint">{next.subtask.how}</span>}
          <span className="drone-next-go">Walk me there ›</span>
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
