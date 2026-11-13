import Portrait from "./Portrait";
import PixelIcon from "./PixelIcon";

const FALLBACK = {
  icon: "drop",
  kicker: "SOL 2",
  title: "Water day",
  line: "Nova will clean the water filter. The greenhouse needs a drink too.",
};

export default function DayBreak({ report, onReplay }) {
  const nextDay = report?.nextDay ?? FALLBACK;

  return (
    <div className="vn-layer" role="dialog" aria-modal="true" aria-labelledby="daybreak-title">
      <div className="vn-stage">
        <div className="vn-portrait-wrap">
          <Portrait id="nova" size={190} />
        </div>

        <article className="vn-panel">
          <p className="vn-speaker">
            Nova <span>Air &amp; Water</span>
          </p>
          <h2 id="daybreak-title" className="vn-title">
            Morning, Commander!
          </h2>

          <div className="vn-lines">
            <p>The sun is up. Sol 1 was a big success.</p>
            <p>Today we make the water clean again.</p>
          </div>

          <div className="vn-weather">
            <PixelIcon name={nextDay.icon} size={11} />
            <span className="vn-weather-title">{nextDay.title}</span>
            <span className="vn-weather-line">{nextDay.line}</span>
            <span className="vn-weather-src">Teaching reference: Canadian Space Agency</span>
          </div>

          <div className="vn-actions">
            <span className="vn-hint">Sol 2 is coming next.</span>
            <button type="button" className="primary-button" onClick={onReplay}>
              Replay Sol 1
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
