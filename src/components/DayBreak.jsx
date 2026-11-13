export default function DayBreak({ report, onReplay }) {
  const nextDay = report?.nextDay ?? {
    kicker: "SOL 2 · NEXT BUILD",
    title: "The water recycler",
    body:
      "Nova's filter is due. Sol 2 will ask you to split water between the recycler, " +
      "the greenhouse, and the reserve.",
  };

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="daybreak-title">
      <article className="modal-card daybreak-card">
        <p className="modal-eyebrow">{nextDay.kicker}</p>
        <h2 id="daybreak-title" className="modal-title">
          {nextDay.title}
        </h2>
        <p className="daybreak-lede">
          Sol 1 is complete. The next slice splits water between the recycler, the
          greenhouse, and the reserve.
        </p>

        <div className="next-day-card">
          <p>{nextDay.body}</p>
          <p className="source-meta">
            Reference: Canadian Space Agency — Food production on the Moon and in
            remote areas.
          </p>
        </div>

        <div className="modal-actions split-actions">
          <button type="button" className="primary-button" onClick={onReplay}>
            Replay Sol 1
          </button>
        </div>
      </article>
    </div>
  );
}
