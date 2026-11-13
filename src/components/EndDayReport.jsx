import PixelIcon from "./PixelIcon";

const COLORS = {
  bolt: "#ffd166",
  drop: "#7ee0ff",
  leaf: "#9df5a8",
};

const BLOCKS = 8;

function Blocks({ value, color, dim = false }) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * BLOCKS);
  return (
    <span
      className={`recap-blocks ${dim ? "is-dim" : ""}`}
      style={{ "--block-color": color }}
      aria-hidden="true"
    >
      {Array.from({ length: BLOCKS }, (_, i) => (
        <span key={i} className={i < filled ? "is-filled" : ""} />
      ))}
    </span>
  );
}

export default function EndDayReport({ report, onContinue }) {
  return (
    <div className="vn-layer" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <article className="recap-card">
        <p className="recap-kicker">SOL {report.day} · NIGHT</p>
        <h2 id="report-title" className="vn-title">
          {report.title}
        </h2>
        <p className="recap-headline">{report.headline}</p>

        <div className="recap-meters">
          {report.changes.map((change) => {
            const color = COLORS[change.icon] ?? "#ffd166";
            return (
              <div className="recap-row" key={change.key}>
                <span className="recap-label">
                  <PixelIcon name={change.icon} size={11} />
                  {change.label}
                </span>
                <Blocks value={change.before} color={color} dim />
                <span className="recap-arrow" aria-hidden="true">
                  →
                </span>
                <Blocks value={change.after} color={color} />
              </div>
            );
          })}
        </div>

        <p className="recap-note">
          <PixelIcon name="heart" size={12} /> {report.note}
        </p>

        <section className="next-day" style={{ "--accent": "#8ff0d0" }}>
          <span className="next-day-icon">
            <PixelIcon name={report.nextDay.icon} size={18} />
          </span>
          <div>
            <p className="recap-kicker">{report.nextDay.kicker}</p>
            <h3>{report.nextDay.title}</h3>
            <p>{report.nextDay.line}</p>
          </div>
        </section>

        <p className="recap-source">{report.source}</p>

        <div className="vn-actions">
          <span className="vn-hint">Lights out, crew.</span>
          <button type="button" className="primary-button" onClick={onContinue}>
            <PixelIcon name="moon" size={12} /> Sleep · Sol 2
          </button>
        </div>
      </article>
    </div>
  );
}
