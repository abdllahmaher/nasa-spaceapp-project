import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import DroneCompanion from "./DroneCompanion";
import PixelIcon from "./PixelIcon";

/**
 * PIP's spotlight / character guide.
 *
 * Instead of covering the whole screen with the normal dialogue bubble, PIP
 * flies to the thing he is explaining and leaves a bright cut-out around it.
 * UI targets are found through `data-pip-target`; world targets are measured by
 * GameCanvas and handed back as a viewport rectangle.
 */

const CARD_WIDTH = 320;
const CARD_GAP = 22;
const SPOTLIGHT_PAD = 9;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function GuideTour({ node, worldRect, onRequestWorld, onFinish }) {
  const steps = node.guide?.steps ?? [];
  const [index, setIndex] = useState(0);
  const step = steps[index] ?? steps[0];
  const last = index >= steps.length - 1;
  const rootRef = useRef(null);
  const cardRef = useRef(null);
  const [box, setBox] = useState(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [cardHeight, setCardHeight] = useState(178);
  const [panelBottom, setPanelBottom] = useState(null);

  const target = step?.target;

  // Ask the world renderer to focus and measure a character.
  useEffect(() => {
    if (target?.kind !== "world") return undefined;
    onRequestWorld?.(target.id);
    return () => onRequestWorld?.(null);
  }, [onRequestWorld, target]);

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root || !step) return;

    const rootRect = root.getBoundingClientRect();
    setViewport({ w: rootRect.width, h: rootRect.height });

    let raw = null;
    let panel = null;
    if (target?.kind === "ui") {
      const element = root.parentElement?.querySelector(
        `[data-pip-target="${target.id}"]`,
      );
      if (element) {
        raw = element.getBoundingClientRect();
        // Keep PIP clear of the whole card, not just the highlighted row.
        const panelElement = element.closest(".hud-card");
        if (panelElement && panelElement !== element) {
          panel = panelElement.getBoundingClientRect();
        }
      }
    } else if (
      target?.kind === "world" &&
      worldRect &&
      worldRect.entityId === target.id
    ) {
      raw = worldRect;
    }

    if (!raw) {
      setBox(null);
      setPanelBottom(null);
      return;
    }

    setPanelBottom(panel ? panel.bottom - rootRect.top : null);

    setBox({
      x: raw.left - rootRect.left - SPOTLIGHT_PAD,
      y: raw.top - rootRect.top - SPOTLIGHT_PAD,
      w: raw.width + SPOTLIGHT_PAD * 2,
      h: raw.height + SPOTLIGHT_PAD * 2,
    });
  }, [step, target, worldRect]);

  useLayoutEffect(() => {
    measure();
  }, [measure, index]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    // The HUD can settle a frame after the dialogue layer appears.
    const timer = window.setTimeout(measure, 120);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
    };
  }, [measure]);

  useLayoutEffect(() => {
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  }, [index, step, viewport.w, viewport.h]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === "Escape") onFinish?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onFinish]);

  const next = () => {
    if (last) onFinish?.();
    else setIndex((current) => current + 1);
  };

  const width = viewport.w || 900;
  const height = viewport.h || 560;
  const cardWidth = Math.min(CARD_WIDTH, Math.max(232, width - 24));
  const PIP_W = 78;
  const PIP_H = 88;
  const wideSpotlight = box ? box.w > width * 0.55 : false;

  let cardX = 12;
  let cardY = 12;
  let pipX = 12;
  let pipY = height - PIP_H - 12;

  if (box) {
    const centerX = box.x + box.w / 2;
    const centerY = box.y + box.h / 2;
    const onRight = centerX > width / 2;

    if (wideSpotlight) {
      cardX = clamp(centerX - cardWidth / 2, 12, width - cardWidth - 12);
      cardY = box.y + box.h + PIP_H + 14;
      if (cardY + cardHeight > height - 12) {
        cardY = Math.max(12, box.y - cardHeight - PIP_H - 14);
      }
    } else {
      cardX = onRight
        ? box.x - cardWidth - CARD_GAP
        : box.x + box.w + CARD_GAP;
      cardX = clamp(cardX, 12, Math.max(12, width - cardWidth - 12));
      cardY = clamp(centerY - cardHeight / 2, 12, Math.max(12, height - cardHeight - 12));
    }

    if (wideSpotlight) {
      pipX = clamp(box.x - PIP_W - 8, 10, Math.max(10, width - PIP_W - 10));
      pipY = clamp(box.y + box.h - PIP_H - 8, 8, Math.max(8, height - PIP_H - 8));
    } else {
      const preferAbove = box.y > height * 0.58;
      const below = box.y + box.h + 4;
      const clearOfPanel =
        panelBottom === null ? below : Math.max(below, panelBottom + 8);
      pipY = preferAbove ? box.y - PIP_H - 6 : clearOfPanel;
      pipY = clamp(pipY, 8, Math.max(8, height - PIP_H - 8));
      pipX = clamp(centerX - PIP_W / 2, 10, Math.max(10, width - PIP_W - 10));
    }
  }

  return (
    <div
      className="pip-tour"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pip-tour-title"
    >
      {!box && <div className="pip-tour-shade" aria-hidden="true" />}

      {box ? (
        <motion.div
          className="pip-spotlight"
          initial={false}
          animate={{ left: box.x, top: box.y, width: box.w, height: box.h }}
          transition={{ type: "spring", stiffness: 210, damping: 26, mass: 0.7 }}
        >
          <span className="pip-spotlight-corner pip-spotlight-corner-nw" />
          <span className="pip-spotlight-corner pip-spotlight-corner-ne" />
          <span className="pip-spotlight-corner pip-spotlight-corner-sw" />
          <span className="pip-spotlight-corner pip-spotlight-corner-se" />
        </motion.div>
      ) : null}

      <DroneCompanion mode="talk" spot={{ x: pipX, y: pipY }} onClick={next} />

      <motion.article
        key={`${index}-${step?.title ?? "step"}`}
        ref={cardRef}
        className="pip-tour-card"
        style={{ left: cardX, top: cardY, width: cardWidth }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <header className="pip-tour-head">
          {step?.icon ? (
            <span className="pip-tour-icon">
              <PixelIcon name={step.icon} size={16} />
            </span>
          ) : null}
          <p className="pip-tour-kicker">{step?.kicker ?? node.eyebrow}</p>
          <span className="pip-tour-count">
            {index + 1}/{steps.length}
          </span>
        </header>

        <h2 id="pip-tour-title" className="pip-tour-title">
          {step?.title ?? node.title}
        </h2>
        <p className="pip-tour-body">{step?.body ?? node.body?.[0]}</p>

        <div className="pip-tour-progress" aria-hidden="true">
          {steps.map((item, dot) => (
            <i key={item.title} className={dot <= index ? "is-on" : ""} />
          ))}
        </div>

        <footer className="pip-tour-actions">
          <button type="button" className="pip-tour-skip" onClick={onFinish}>
            Skip
          </button>
          <button type="button" className="primary-button" onClick={next}>
            {last
              ? node.guide?.doneLabel ?? node.choices?.[0]?.label ?? "Got it"
              : "Next"}
          </button>
        </footer>
      </motion.article>
    </div>
  );
}
