import Portrait from "./Portrait";
import PixelIcon from "./PixelIcon";
import { COMMANDER } from "../logic/profile";

const FALLBACK = {
  icon: "drop",
  kicker: "SOL 2",
  title: "Water day",
  line: "Nova will clean the water filter. The greenhouse needs a drink too.",
};

export default function DayBreak({ report, onBegin }) {
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
            Morning, {COMMANDER}!
          </h2>

          <div className="vn-lines">
            <p>The sun is up. The crew is ready for another day.</p>
            <p>Let’s check the outpost and continue the mission.</p>
          </div>

          <div className="vn-weather">
            <PixelIcon name={nextDay.icon} size={11} />
            <span className="vn-weather-title">{nextDay.title}</span>
            <span className="vn-weather-line">{nextDay.line}</span>
            <span className="vn-weather-src">Teaching reference: Canadian Space Agency</span>
          </div>

          <div className="vn-actions">
            <span className="vn-hint">New Sol · Ready for duty</span>
            <button type="button" className="primary-button" onClick={onBegin}>
              Begin New Sol
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
