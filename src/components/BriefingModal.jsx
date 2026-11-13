import Portrait from "./Portrait";
import PixelIcon from "./PixelIcon";
import { PORTRAITS } from "../data/portraits";

export default function BriefingModal({ day, onBegin }) {
  const { briefing } = day;
  const speaker = PORTRAITS[briefing.speaker] ?? PORTRAITS.layla;

  return (
    <div className="vn-layer" role="dialog" aria-modal="true" aria-labelledby="briefing-title">
      <div className="vn-stage">
        <div className="vn-portrait-wrap">
          <Portrait id={briefing.speaker} size={148} />
        </div>

        <article className="vn-panel">
          <p className="vn-speaker">
            {speaker.name} <span>{speaker.role}</span>
          </p>
          <h2 id="briefing-title" className="vn-title">
            {briefing.title}
          </h2>

          <div className="vn-lines">
            {briefing.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <div className="vn-chips">
            <span className="chip">
              <PixelIcon name="bolt" size={11} /> Power
            </span>
            <span className="chip">
              <PixelIcon name="drop" size={11} /> Air
            </span>
            <span className="chip">
              <PixelIcon name="crew" size={11} /> Crew
            </span>
            <span className="chip">
              <PixelIcon name="wrench" size={11} /> Power box
            </span>
          </div>

          {briefing.hint && <p className="vn-hint">{briefing.hint}</p>}

          <div className="vn-weather">
            <PixelIcon name="star" size={11} />
            <span className="vn-weather-title">{briefing.weather.headline}</span>
            <span className="vn-weather-line">{briefing.weather.line}</span>
            <span className="vn-weather-src">{briefing.weather.source}</span>
          </div>

          <div className="vn-actions">
            <span className="vn-site">
              <PixelIcon name="home" size={11} /> {briefing.site.name}
            </span>
            <button type="button" className="primary-button" onClick={onBegin}>
              {briefing.startLabel}
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
