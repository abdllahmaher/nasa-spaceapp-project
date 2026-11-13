export default function BriefingModal({ day, onBegin }) {
  const { briefing } = day;

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="briefing-title">
      <article className="modal-card briefing-card">
        <p className="modal-eyebrow">{briefing.kicker}</p>
        <h2 id="briefing-title" className="modal-title">
          {briefing.title}
        </h2>
        <div className="modal-body">
          {briefing.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="briefing-grid">
          <section>
            <p className="section-label">TODAY</p>
            <ul className="briefing-list">
              {day.objectives.map((objective) => (
                <li key={objective.id}>
                  <span aria-hidden="true">□</span>
                  {objective.label}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="section-label">SITE</p>
            <p className="site-name">{briefing.site.name}</p>
            <p className="site-coords">{briefing.site.coordinates}</p>
            <p className="source-meta">{briefing.site.note}</p>
          </section>
        </div>

        <section className="weather-card">
          <div className="weather-head">
            <span className="live-badge">LIVE</span>
            <span className="weather-source">{briefing.source.name}</span>
            <span className="weather-time">Issued {briefing.weather.issuedAt}</span>
          </div>
          <h3>{briefing.weather.headline}</h3>
          <p>{briefing.weather.summary}</p>
          <p className="source-meta">
            CME start {briefing.weather.eventStart} · estimated speed {briefing.weather.speed} ·
            retrieved {briefing.source.retrievedAt}
          </p>
        </section>

        <div className="modal-actions">
          <button type="button" className="primary-button" onClick={onBegin}>
            {briefing.startLabel}
          </button>
        </div>
      </article>
    </div>
  );
}
