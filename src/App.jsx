import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameCanvas from "./game/GameCanvas";
import HUD from "./components/HUD";
import BriefingModal from "./components/BriefingModal";
import InteractionModal from "./components/InteractionModal";
import EndDayReport from "./components/EndDayReport";
import DayBreak from "./components/DayBreak";
import Toast from "./components/Toast";
import DroneCompanion from "./components/DroneCompanion";
import DronePanel from "./components/DronePanel";
import { createInitialState } from "./logic/initialState";
import { applyChoice, markSeen } from "./logic/choices";
import { endDay } from "./logic/dailyCycle";
import { buildStatus } from "./logic/status";
import { clearGame, loadGame, normalizeState, saveGame } from "./logic/save";
import { getDay, resolveDay } from "./story/days";
import {
  DRONE_BARS,
  DRONE_DAY_DONE,
  DRONE_GREET,
  DRONE_MEET,
  decisionNode,
  morningNode,
  warningNode,
} from "./data/drone/script";
import {
  applyDecision,
  dayComplete,
  droneAlerts,
  droneTasks,
  groupComplete,
  markAlertsSeen,
  newAlerts,
  pendingDecision,
  setTutorialStep,
  tutorialStep,
} from "./logic/drone";
import "./App.css";

const SAVED_MISSION = loadGame();
const MEET_GROUP = "Meet the crew";

export default function App() {
  const [state, setState] = useState(() => {
    if (!SAVED_MISSION) return createInitialState();
    // One-time migration for older saves: Sol 1 is now construction-only,
    // and every Sol starts with a fresh set of crew check-ins.
    const legacy = (SAVED_MISSION.version ?? 1) < 3;
    if (legacy) {
      return { ...normalizeState(SAVED_MISSION), version: 3, seen: [], decisions: {} };
    }
    return normalizeState(SAVED_MISSION);
  });
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  const [phase, setPhase] = useState(() => {
    if (!SAVED_MISSION) return "intro";
    return SAVED_MISSION.day > 1 ? "daybreak" : "playing";
  });
  const [active, setActive] = useState(null);
  const [report, setReport] = useState(() => SAVED_MISSION?.lastReport ?? null);
  const [cinematic, setCinematic] = useState(null);
  const [walkTo, setWalkTo] = useState(null);
  const [toast, setToast] = useState("");
  const [toastKind, setToastKind] = useState("success");
  const [crewCommand, setCrewCommand] = useState(null);
  const [droneOpen, setDroneOpen] = useState(false);
  const crewCommandStateRef = useRef(crewCommand);
  useEffect(() => { crewCommandStateRef.current = crewCommand; }, [crewCommand]);
  const crewCommandToken = useRef(0);
  const toastTimer = useRef(null);
  const taskToken = useRef(0);
  const walkToken = useRef(0);
  const pendingBubble = useRef(null);

  const day = getDay(state.day);
  // Story text can react to earlier decisions, so resolve it against the save.
  const story = resolveDay(day, state);
  const objectives = story.objectives.map((objective) => ({
    ...objective,
    done: objective.check(state),
    nextTarget: (objective.targets ?? []).find(
      (target) => !objective.targetOpen || objective.targetOpen(target, state),
    ),
  }));
  const tasksDone = dayComplete(state, story);
  const decision = pendingDecision(state, story);
  const canEndDay = tasksDone && !decision;
  const alerts = droneAlerts(state);
  const groups = droneTasks(state, story);
  const status = buildStatus(state);
  const weather = story.briefing?.weather ?? story.weather ?? {};
  const weatherLevel = weather.level ?? "clear";
  const droneSpeaking = active?.speaker === "drone";

  // Which places still need a visit? Drawn as bouncing pins in the world.
  const markers = {};
  for (const objective of objectives) {
    if (objective.done) continue;
    for (const target of objective.targets ?? []) {
      if (objective.targetOpen && !objective.targetOpen(target, state)) continue;
      markers[target] = true;
    }
  }

  const paused = !["intro", "playing", "cinematic", "sleeping", "waking"].includes(phase);
  const inputEnabled = phase === "playing";

  const showToast = useCallback((message, kind = "success") => {
    setToastKind(kind);
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

  const issueCrewCommand = (type) => {
    crewCommandToken.current += 1;
    setCrewCommand({ token: crewCommandToken.current, type });
  };

  const handleCrewCommandDone = useCallback((token) => {
    const current = crewCommandStateRef.current;
    if (!current || current.token !== token) return;
    crewCommandStateRef.current = null;
    setCrewCommand(null);
    if (current.type === "sleep") {
      const { state: next, report: nextReport } = endDay(stateRef.current);
      setState(next);
      saveGame(next);
      setReport(nextReport);
      setPhase("report");
    } else {
      setPhase("daybreak");
    }
  }, []);

  /** PIP takes over the bubble: same component, a different speaker. */
  const openDroneNode = useCallback((node) => {
    if (!node) return;
    setDroneOpen(false);
    setActive({ ...node, targetId: "drone", chosenId: null });
    setPhase("interaction");
  }, []);

  const commit = useCallback((next) => {
    setState(next);
    saveGame(next);
  }, []);

  /* ------------------------------------------------------- PIP's beats
   *
   * One effect decides who speaks next, in priority order: the tour, the
   * morning line, the day's decision, the "everything is done" nudge, then any
   * fresh warning. Every branch records progress in state first, so the same
   * bubble can never open twice.
   */
  useEffect(() => {
    if (phase !== "playing" || droneOpen) return;

    const step = tutorialStep(state);

    if (state.day === 1 && step === "greet") {
      openDroneNode(DRONE_GREET);
      return;
    }

    if (state.day === 1 && step === "meet") {
      // Second beat of the tour: PIP explains who the crew are.
      if (!state.drone?.meetIntroSeen) {
        commit({ ...state, drone: { ...state.drone, meetIntroSeen: true } });
        openDroneNode(DRONE_MEET);
        return;
      }
      if (groupComplete(state, story, MEET_GROUP)) {
        commit(setTutorialStep(state, "bars"));
        openDroneNode(DRONE_BARS);
      }
      return;
    }

    if (state.day > 1 && state.drone?.morningSeen !== state.day) {
      commit({ ...state, drone: { ...state.drone, morningSeen: state.day } });
      openDroneNode(morningNode(story, state.decisionsByDay?.[state.day - 1]));
      return;
    }

    if (decision) {
      openDroneNode(decisionNode(story));
      return;
    }

    if (tasksDone && state.drone?.nudgedDay !== state.day) {
      commit({ ...state, drone: { ...state.drone, nudgedDay: state.day } });
      openDroneNode(DRONE_DAY_DONE);
      return;
    }

    const fresh = newAlerts(state);
    if (fresh.length) {
      commit(markAlertsSeen(state, fresh));
      openDroneNode(warningNode(fresh));
    }
  }, [phase, droneOpen, state, story, decision, tasksDone, openDroneNode, commit]);

  const handleInteract = useCallback(
    (request) => {
      const content = story.interactions[request.targetId];
      if (!content) return;

      const next = markSeen(state, request.targetId);
      if (next !== state) commit(next);

      setActive({
        ...content,
        targetId: request.targetId,
        chosenId: state.decisions[request.targetId] ?? null,
      });
      setPhase("interaction");
    },
    [story, state, commit],
  );

  const handleChoose = (choice) => {
    // The drone's own buttons: sleep, and the day's decision.
    if (choice.action === "sleep") {
      setActive(null);
      setPhase("playing");
      if (canEndDay) {
        setPhase("sleeping");
        issueCrewCommand("sleep");
      }
      return;
    }

    if (choice.action === "decision") {
      const result = applyDecision(state, story, choice.optionId);
      if (!result.ok) {
        showToast(result.message);
        return;
      }
      commit(result.state);
      setActive((current) => ({ ...current, chosenId: choice.id, result: result.result }));
      showToast(result.toast);
      return;
    }

    const result = applyChoice(state, active, choice, { subtasks: story.subtasks });
    if (!result.ok) {
      showToast(result.message);
      return;
    }

    // The tour advances on the choice, not on the bubble closing.
    let nextState = result.state;
    if (choice.tutorial) nextState = setTutorialStep(nextState, choice.tutorial);
    commit(nextState);

    // Branching dialogue: the choice names the next node, the bubble stays put.
    if (result.next && story.interactions[result.next]) {
      setActive({ ...story.interactions[result.next], targetId: result.next, chosenId: null });
      showToast(result.toast);
      return;
    }

    // A branch node can hand its result back to the crew member's own bubble,
    // so the recap never appears under a "Why do we need this?" title.
    const resultBase =
      (choice.resultNode && story.interactions[choice.resultNode]) || active;

    if (result.scene) {
      // Hide the bubble, show the crew doing the job, then report back.
      pendingBubble.current = {
        ...resultBase,
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
      ...(choice.resultNode && story.interactions[choice.resultNode]
        ? story.interactions[choice.resultNode]
        : current),
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

  /** Walk Layla to a place from the drone panel, the world, or a bubble. */
  const handleTrack = (targetId) => {
    if (!targetId) return;
    if (phase !== "playing") return;
    setDroneOpen(false);
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
    if (!canEndDay) {
      showToast(decision ? "PIP needs your decision first." : "Finish today's tasks first.");
      return;
    }
    setActive(null);
    setDroneOpen(false);
    setPhase("sleeping");
    issueCrewCommand("sleep");
  };

  const handleContinue = () => {
    setPhase("waking");
    issueCrewCommand("wake");
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

  const toggleDrone = () => {
    if (phase !== "playing" && phase !== "interaction") return;
    setDroneOpen((open) => !open);
  };

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
          builds={state.builds}
          status={status}
          markers={markers}
          cinematic={cinematic}
          walkTo={walkTo}
          crewCommand={crewCommand}
          onCrewCommandDone={handleCrewCommandDone}
          onInteract={handleInteract}
          onIntroComplete={handleIntroComplete}
          onCinematicDone={handleCinematicDone}
        />

        {["playing", "interaction", "cinematic"].includes(phase) && (
          <HUD resources={state.resources} />
        )}

        {["playing", "interaction", "cinematic"].includes(phase) && (
          <>
            <DroneCompanion
              mode={droneSpeaking ? "talk" : "dock"}
              alert={alerts.some((alert) => alert.level === "critical")}
              open={droneOpen}
              onClick={toggleDrone}
            />
            <AnimatePresence>
              {droneOpen && (
                <DronePanel
                  key="pip-panel"
                  day={state.day}
                  mission={story.mission}
                  groups={groups}
                  alerts={alerts}
                  resources={state.resources}
                  canSleep={canEndDay}
                  decision={decision}
                  onTrack={handleTrack}
                  onAnswer={() => openDroneNode(decisionNode(story))}
                  onSleep={handleEndDay}
                  onClose={() => setDroneOpen(false)}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {phase === "intro" && (
          <div className="intro-caption">
            <span className="status-dot" aria-hidden="true" />
            Touchdown · Sol 1
          </div>
        )}

        {phase === "briefing" && (
          <BriefingModal day={story} onBegin={() => setPhase("playing")} />
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

        {phase === "daybreak" && <DayBreak report={report} onBegin={() => { setReport(null); setPhase("playing"); }} />}

        <AnimatePresence>
          {weatherLevel !== "clear" && ["playing", "interaction", "cinematic"].includes(phase) && (
            <motion.div
              className={`weather-fx weather-${weatherLevel}`}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: weatherLevel === "storm" ? 0.19 : weatherLevel === "dust" ? 0.12 : 0.07 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: weatherLevel === "storm" ? 13 : weatherLevel === "dust" ? 7 : 4 }, (_, index) => (
                <motion.span
                  key={index}
                  className={`weather-particle weather-particle-${weatherLevel}`}
                  style={{ left: `${7 + index * 14}%`, top: `${18 + (index * 13) % 55}%` }}
                  animate={{
                    x: weatherLevel === "storm" ? [0, -55, -115] : weatherLevel === "dust" ? [0, -30, -65] : [0, -8, -16],
                    y: weatherLevel === "storm" ? [0, 12, -6] : weatherLevel === "dust" ? [0, 8, -3] : [0, -5, -10],
                    opacity: [0, 0.55, 0],
                  }}
                  transition={{ duration: weatherLevel === "storm" ? 4.5 + index % 3 : weatherLevel === "dust" ? 7 + index % 3 : 10 + index, repeat: Infinity, delay: index * 0.35, ease: "linear" }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(phase === "sleeping" || phase === "waking") && (
            <motion.div className={`day-transition ${phase === "sleeping" ? "night-transition" : "morning-transition"}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }} transition={{ duration: 3.2, ease: "easeInOut" }}>
              <motion.div className="transition-text" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1, duration: 1.8, ease: "easeInOut" }}>
                <span>{phase === "sleeping" ? "END OF SOL" : "NEW SOL"}</span>
                <h2>{phase === "sleeping" ? "Time to Rest, Crew" : "Sunrise on Mars"}</h2>
                <p>{phase === "sleeping" ? "The crew is returning to the Airlock." : "The crew is heading back to their stations."}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Toast message={toast} kind={toastKind} />
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
