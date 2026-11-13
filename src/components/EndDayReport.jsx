function humanizeFlag(flag) {
  return flag
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export default function EndDayReport({ report, onContinue }) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <article className="modal-card report-card">
        <p className="modal-eyebrow">SOL {report.day} COMPLETE</p>
        <h2 id="report-title" className="modal-title">
          {report.title}
        </h2>

        <section>
          <p className="section-label">RESOURCE CHANGES</p>
          <ul className="report-changes">
            {report.changes.map((change) => (
              <li key={change.key}>
                <span>{change.label}</span>
                <span className="report-values">
                  {change.before} <span aria-hidden="true">→</span> {change.after}
                  <span className={change.delta >= 0 ? "delta-up" : "delta-down"}>
                    {change.delta >= 0 ? "+" : ""}
                    {change.delta}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="section-label">OVERNIGHT NOTES</p>
          <ul className="report-notes">
            {report.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>

        {report.flagsAdded.length > 0 && (
          <section>
            <p className="section-label">MISSION FLAGS</p>
            <div className="flag-row">
              {report.flagsAdded.map((flag) => (
                <span className="flag-chip" key={flag}>
                  {humanizeFlag(flag)}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="next-day-card">
          <p className="modal-eyebrow">{report.nextDay.kicker}</p>
          <h3>{report.nextDay.title}</h3>
          <p>{report.nextDay.body}</p>
        </section>

        <section>
          <p className="section-label">SOURCES</p>
          <ul className="source-list">
            {report.sources.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
        </section>

        <div className="modal-actions">
          <button type="button" className="primary-button" onClick={onContinue}>
            Continue to Sol 2
          </button>
        </div>
      </article>
    </div>
  );
}
