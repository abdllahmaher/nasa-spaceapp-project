import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [state, setState] = useState(() => {
    if (!SAVED_MISSION) return createInitialState();
    // One-time migration for older saves: Sol 1 is now construction-only,
    // and every Sol starts with a fresh set of crew check-ins.
    if ((SAVED_MISSION.version ?? 1) < 2) {
      return { ...SAVED_MISSION, version: 2, seen: [], decisions: {} };
    }
    if (SAVED_MISSION.day === 2 && SAVED_MISSION.completedEvents?.includes("day01")) {
      return { ...SAVED_MISSION, seen: [], decisions: {} };
    }
    return SAVED_MISSION;
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
  const crewCommandStateRef = useRef(crewCommand);
  useEffect(() => { crewCommandStateRef.current = crewCommand; }, [crewCommand]);
  const [showSleepPrompt, setShowSleepPrompt] = useState(false);
  const crewCommandToken = useRef(0);
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
  const hazards = useMemo(() => {
    const alerts = [];
    if (state.resources.lifeSupportCondition <= 35) alerts.push({ level: "critical", title: "OXYGEN SYSTEM CRITICAL", detail: "Life-support condition is dangerously low." });
    else if (state.resources.lifeSupportCondition <= 55) alerts.push({ level: "warning", title: "LIFE-SUPPORT WARNING", detail: "Check the oxygen system soon." });
    if (state.resources.powerCondition <= 30 || state.resources.storedPower <= 20) alerts.push({ level: "critical", title: "POWER FAILURE RISK", detail: "Power reserves or generator condition are critical." });
    else if (state.resources.powerCondition <= 50 || state.resources.storedPower <= 35) alerts.push({ level: "warning", title: "LOW POWER", detail: "Reduce consumption and inspect the power junction." });
    if (state.resources.habitatSafety <= 45) alerts.push({ level: "critical", title: "HABITAT SAFETY ALERT", detail: "The habitat needs immediate inspection." });
    if (state.resources.food <= 20) alerts.push({ level: "warning", title: "FOOD RESERVES LOW", detail: "Food supplies are running low." });
    return alerts;
  }, [state.resources]);
  const status = buildStatus(state);
  const weather = day.briefing?.weather ?? day.weather ?? {};
  const weatherLevel = weather.level ?? "clear";

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

  useEffect(() => {
    setShowSleepPrompt(false);
    if (!canEndDay || phase !== "playing") return undefined;
    const timer = window.setTimeout(() => setShowSleepPrompt(true), 7000);
    return () => window.clearTimeout(timer);
  }, [canEndDay, phase, state.day]);

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
    setActive(null);
    setShowSleepPrompt(false);
    setPhase("sleeping");
    issueCrewCommand("sleep");
  };

  const handleContinue = () => {
    setPhase("waking");
    issueCrewCommand("wake");
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
          crewCommand={crewCommand}
          onCrewCommandDone={handleCrewCommandDone}
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
            showSleepPrompt={showSleepPrompt}
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
          {hazards.length > 0 && ["playing", "interaction", "cinematic"].includes(phase) && (
            <motion.aside className="hazard-stack" aria-label="Outpost hazard warnings" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
              {hazards.map((hazard) => (
                <motion.div key={hazard.title} className={`hazard-card hazard-${hazard.level}`} animate={{ scale: [1, 1.012, 1] }} transition={{ duration: 2.2, repeat: Infinity }}>
                  <span className="hazard-symbol">!</span>
                  <div><strong>{hazard.title}</strong><p>{hazard.detail}</p></div>
                </motion.div>
              ))}
            </motion.aside>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(phase === "sleeping" || phase === "waking") && (
            <motion.div className={`day-transition ${phase === "sleeping" ? "night-transition" : "morning-transition"}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 3.2, ease: "easeInOut" }}>
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
