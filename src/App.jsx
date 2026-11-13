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
import { buildStatus } from "./logic/status";
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
  const [cinematic, setCinematic] = useState(null);
  const [walkTo, setWalkTo] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const taskToken = useRef(0);
  const walkToken = useRef(0);
  const pendingBubble = useRef(null);

  const day = getDay(state.day);
  const objectives = day.objectives.map((objective) => ({
    ...objective,
    done: objective.check(state),
    progress: objective.progress?.(state) ?? 0,
    progressMax: objective.progressMax ?? 0,
    // First place the child still has to visit for this task.
    nextTarget: (objective.targets ?? []).find(
      (target) => !objective.targetOpen || objective.targetOpen(target, state),
    ),
  }));
  const canEndDay = objectives.every((objective) => objective.done);
  const status = buildStatus(state);

  // Which places still need a visit? Drawn as bouncing pins in the world.
  const markers = {};
  for (const objective of objectives) {
    if (objective.done) continue;
    for (const target of objective.targets ?? []) {
      if (objective.targetOpen && !objective.targetOpen(target, state)) continue;
      markers[target] = true;
    }
  }

  const paused = !["intro", "playing", "cinematic"].includes(phase);
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

    if (result.scene) {
      // Hide the bubble, show the crew doing the job, then report back.
      pendingBubble.current = {
        ...active,
        chosenId: choice.id,
        result: result.result,
        toast: result.toast,
      };
      setActive(null);
      taskToken.current += 1;
      setCinematic({ token: taskToken.current, ...result.scene });
      setPhase("cinematic");
      return;
    }

    setActive((current) => ({
      ...current,
      chosenId: choice.id,
      result: result.result,
    }));
    showToast(result.toast);
  };

  const handleCinematicDone = useCallback(() => {
    setCinematic(null);
    const bubble = pendingBubble.current;
    pendingBubble.current = null;

    if (bubble) {
      setActive(bubble);
      setPhase("interaction");
      showToast(bubble.toast);
    } else {
      setPhase("playing");
    }
  }, [showToast]);

  const handleCloseInteraction = () => {
    setActive(null);
    setPhase("playing");
  };

  /** Walk Layla to a place from the quest list, the world, or a bubble. */
  const handleTrack = (targetId) => {
    if (!targetId) return;
    if (phase !== "playing") return;
    walkToken.current += 1;
    setWalkTo({ token: walkToken.current, targetId });
  };

  /** "Show me" inside an officer report: close the bubble and walk over. */
  const handleGoto = (goto) => {
    if (!goto?.targetId) return;
    setActive(null);
    setPhase("playing");
    walkToken.current += 1;
    setWalkTo({ token: walkToken.current, targetId: goto.targetId });
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
          <p className="app-kicker">Junior Astronaut Mission Trainer</p>
          <h1>Mars Outpost</h1>
        </div>
        <div className="app-header-right">
          <span className="app-tag">
            Sol {phase === "report" ? (report?.day ?? state.day) : state.day} · Jezero
          </span>
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
          status={status}
          markers={markers}
          cinematic={cinematic}
          walkTo={walkTo}
          onInteract={handleInteract}
          onIntroComplete={handleIntroComplete}
          onCinematicDone={handleCinematicDone}
        />

        {["playing", "interaction", "cinematic"].includes(phase) && (
          <HUD
            day={state.day}
            location={day.location}
            objectives={objectives}
            resources={state.resources}
            onEndDay={handleEndDay}
            onTrack={handleTrack}
            canEndDay={canEndDay}
          />
        )}

        {phase === "intro" && (
          <div className="intro-caption">
            <span className="status-dot" aria-hidden="true" />
            Touchdown · Sol 1
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
            onGoto={handleGoto}
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
          <kbd>E</kbd> talk / check · <kbd>Click</kbd> walk there
        </span>
        <span>Real space-weather data: NASA DONKI.</span>
      </footer>
    </div>
  );
}
