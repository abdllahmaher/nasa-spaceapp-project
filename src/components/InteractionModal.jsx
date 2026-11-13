import { useEffect } from "react";
import { canAfford, formatCost } from "../logic/resources";

export default function InteractionModal({ content, resources, onChoose, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const resolved =
    content.chosenId && content.choices
      ? content.choices.find((choice) => choice.id === content.chosenId)
      : null;
  const resultText = content.result ?? resolved?.result ?? null;
  const showChoices = content.choices && !resultText;

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="interaction-title">
      <article className="modal-card interaction-card">
        <p className="modal-eyebrow">{content.eyebrow}</p>
        <h2 id="interaction-title" className="modal-title">
          {content.title}
        </h2>

        <div className="modal-body">
          {content.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {content.quote && <blockquote className="modal-quote">{content.quote}</blockquote>}

        {resultText && (
          <div className="result-box">
            <p className="section-label">RESULT</p>
            <p>{resultText}</p>
          </div>
        )}

        {showChoices && (
          <div className="choice-list">
            {content.choices.map((choice) => {
              const affordable = canAfford(resources, choice.cost);
              return (
                <button
                  type="button"
                  key={choice.id}
                  className="choice-button"
                  disabled={!affordable}
                  onClick={() => onChoose(choice)}
                >
                  <span className="choice-topline">
                    <span className="choice-label">{choice.label}</span>
                    {choice.cost && (
                      <span className="choice-cost">{formatCost(choice.cost)}</span>
                    )}
                  </span>
                  <span className="choice-detail">{choice.detail}</span>
                  {!affordable && (
                    <span className="choice-warning">Not enough resources</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {content.note && <p className="source-meta">{content.note}</p>}
        {content.source && <p className="source-meta">{content.source}</p>}

        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            {resultText ? "Back to EVA" : "Close"}
          </button>
        </div>
      </article>
    </div>
  );
}
