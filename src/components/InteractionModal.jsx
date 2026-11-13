import { useEffect } from "react";
import Portrait from "./Portrait";
import PixelIcon from "./PixelIcon";
import { PORTRAITS } from "../data/portraits";
import { canAfford } from "../logic/resources";

const COST_ICONS = {
  spareParts: "wrench",
  storedPower: "bolt",
  powerCondition: "bolt",
  water: "drop",
  food: "leaf",
  lifeSupportCondition: "drop",
  habitatSafety: "home",
};

function CostPips({ cost }) {
  if (!cost) return null;

  return (
    <span className="cost-pips">
      {Object.entries(cost).flatMap(([key, amount]) =>
        Array.from({ length: Math.min(4, amount) }, (_, i) => (
          <PixelIcon key={`${key}-${i}`} name={COST_ICONS[key] ?? "wrench"} size={10} />
        )),
      )}
    </span>
  );
}

export default function InteractionModal({ content, resources, onChoose, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const speaker = PORTRAITS[content.speaker] ?? PORTRAITS.layla;
  const resolved =
    content.chosenId && content.choices
      ? content.choices.find((choice) => choice.id === content.chosenId)
      : null;
  const resultText = content.result ?? resolved?.result ?? null;
  const showChoices = content.choices && !resultText;

  return (
    <div
      className="vn-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interaction-title"
    >
      <div className="vn-stage">
        <div className="vn-portrait-wrap">
          <Portrait id={content.speaker} size={142} />
        </div>

        <article className="vn-panel">
          <p className="vn-speaker">
            {speaker.name} <span>{speaker.role}</span>
          </p>
          <h2 id="interaction-title" className="vn-title">
            {content.title}
          </h2>

          {!resultText && (
            <div className="vn-lines">
              {content.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          )}

          {resultText && (
            <div className="vn-result">
              <PixelIcon name="star" size={16} />
              <p>{resultText}</p>
            </div>
          )}

          {showChoices && (
            <div className="vn-choices">
              {content.choices.map((choice) => {
                const affordable = canAfford(resources, choice.cost);
                return (
                  <button
                    type="button"
                    key={choice.id}
                    className="vn-choice"
                    disabled={!affordable}
                    onClick={() => onChoose(choice)}
                  >
                    <span className="vn-choice-icon">
                      <PixelIcon name={choice.icon ?? "wrench"} size={14} />
                    </span>
                    <span className="vn-choice-text">
                      <span className="vn-choice-label">{choice.label}</span>
                      <span className="vn-choice-detail">{choice.detail}</span>
                    </span>
                    <CostPips cost={choice.cost} />
                  </button>
                );
              })}
            </div>
          )}

          <div className="vn-actions">
            <span className="vn-hint">
              {showChoices ? "Pick one!" : resultText ? "Nice work, Commander." : "What a view!"}
            </span>
            <button type="button" className="ghost-button" onClick={onClose}>
              {resultText ? "Yay!" : "Okay!"}
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
