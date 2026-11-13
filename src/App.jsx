import { useCallback, useEffect, useRef, useState } from "react";
import GameCanvas from "./game/GameCanvas";
import HUD from "./components/HUD";
import BriefingModal from "./components/BriefingModal";
import InteractionModal from "./components/InteractionModal";
import EndDayReport from "./components/EndDayReport";
import DayBreak from "./components/DayBreak";
import Toast from "./components/Toast";
import { createInitialState } from "./logic/initialState";
import { applyChoice, markSeen } from "./logic/choices";
import { endDay } from "./logic/dailyCycle";
import { clearGame, loadGame, saveGame } from "./logic/save";
import { getDay } from "./story/days";
import "./App.css";

const SAVED_MISSION = loadGame();

export default function App() {
  const [state, setState] = useState(() => SAVED_MISSION ?? createInitialState());
  const [phase, setPhase] = useState(() => {
    if (!SAVED_MISSION) return "intro";
    return SAVED_MISSION.day > 1 ? "daybreak" : "playing";
  });
  const [active, setActive] = useState(null);
  const [report, setReport] = useState(() => SAVED_MISSION?.lastReport ?? null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const day = getDay(state.day);
  const objectives = day.objectives.map((objective) => ({
    ...objective,
    done: objective.check(state),
    progress: objective.progress?.(state),
  }));
  const canEndDay = objectives.every((objective) => objective.done);

  const paused = phase !== "intro" && phase !== "playing";
  const inputEnabled = phase === "playing";

  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3200);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const handleInteract = useCallback(
    (request) => {
      const content = day.interactions[request.targetId];
      if (!content) return;

      const next = markSeen(state, request.targetId);
      if (next !== state) {
        setState(next);
        saveGame(next);
      }

      setActive({
        ...content,
        targetId: request.targetId,
        chosenId: state.decisions[request.targetId] ?? null,
      });
      setPhase("interaction");
    },
    [day, state],
  );

  const handleChoose = (choice) => {
    const result = applyChoice(state, active, choice);
    if (!result.ok) {
      showToast(result.message);
      return;
    }

    setState(result.state);
    saveGame(result.state);
    setActive((current) => ({
      ...current,
      chosenId: choice.id,
      result: result.result,
    }));
    showToast(result.toast);
  };

  const handleCloseInteraction = () => {
    setActive(null);
    setPhase("playing");
  };

  const handleEndDay = () => {
    if (!canEndDay) return;
    const { state: next, report: nextReport } = endDay(state);
    setState(next);
    saveGame(next);
    setActive(null);
    setReport(nextReport);
    setPhase("report");
  };

  const handleContinue = () => {
    setReport(null);
    setPhase("daybreak");
  };

  const handleReplay = () => {
    clearGame();
    window.location.reload();
  };

  const handleReset = () => {
    if (window.confirm("Reset the mission and replay Sol 1?")) {
      clearGame();
      window.location.reload();
    }
  };

  const handleIntroComplete = useCallback(() => {
    setPhase((current) => (current === "intro" ? "briefing" : current));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <p className="app-kicker">NASA Space Apps · Junior Astronaut Mission Trainer</p>
          <h1>Mars Outpost</h1>
        </div>
        <div className="app-header-right">
          <span className="app-tag">Sol {state.day} · Jezero</span>
          <button type="button" className="text-button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </header>

      <div className="game-shell">
        <GameCanvas
          paused={paused}
          inputEnabled={inputEnabled}
          startLanded={Boolean(SAVED_MISSION)}
          onInteract={handleInteract}
          onIntroComplete={handleIntroComplete}
        />

        {(phase === "playing" || phase === "interaction") && (
          <HUD
            day={state.day}
            location={day.location}
            coordinates={day.coordinates}
            objectives={objectives}
            resources={state.resources}
            onEndDay={handleEndDay}
            canEndDay={canEndDay}
          />
        )}

        {phase === "intro" && (
          <div className="intro-caption">
            <span className="status-dot" aria-hidden="true" />
            Touchdown sequence · Sol 1
          </div>
        )}

        {phase === "briefing" && (
          <BriefingModal day={day} onBegin={() => setPhase("playing")} />
        )}

        {phase === "interaction" && active && (
          <InteractionModal
            content={active}
            resources={state.resources}
            onChoose={handleChoose}
            onClose={handleCloseInteraction}
          />
        )}

        {phase === "report" && report && (
          <EndDayReport report={report} onContinue={handleContinue} />
        )}

        {phase === "daybreak" && <DayBreak report={report} onReplay={handleReplay} />}

        <Toast message={toast} />
      </div>

      <footer className="app-footer">
        <span>
          <kbd>WASD</kbd> move · <kbd>Shift</kbd> run · <kbd>Space</kbd> jump ·{" "}
          <kbd>E</kbd> inspect / talk · <kbd>F2</kbd> debug
        </span>
        <span>Snapshots: NASA DONKI · Mars Trek. Game values are illustrative.</span>
      </footer>
    </div>
  );
}
