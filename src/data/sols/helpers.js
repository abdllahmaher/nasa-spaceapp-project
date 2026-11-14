/**
 * Small factories so five Sols of content stay readable and consistent.
 *
 * Every node produced here already matches the shape the existing chat bubble
 * renders: `speaker`, `eyebrow`, `title`, `body` lines and `choices`. Branching
 * is expressed with `next`, which the app resolves into another node — the
 * bubble component itself never had to change.
 */

const CONFIRM_ICON = "wrench";

/**
 * One crew member, one subtask.
 *
 * The first node is what the player hears on arrival. "Why do we need this?"
 * opens a second node that explains the science, and both nodes offer the same
 * confirm button, so a curious child is never forced to skip the explanation
 * and an impatient one is never forced to read it.
 */
export function crewTask({
  target,
  speaker,
  eyebrow,
  title,
  lines,
  why = null,
  subtaskId,
  confirmLabel,
  detail,
  cost = undefined,
  effects = undefined,
  scene = null,
  result,
  toast,
  setFlags = undefined,
  clears = undefined,
  extraChoices = [],
}) {
  const confirm = {
    id: `${subtaskId}_go`,
    icon: CONFIRM_ICON,
    label: confirmLabel,
    detail,
    cost,
    effects,
    scene,
    result,
    toast,
    setFlags,
    clears,
    complete: subtaskId,
  };

  const entry = {
    speaker,
    eyebrow,
    title,
    body: lines,
    choices: [
      confirm,
      ...(why
        ? [
            {
              id: `${subtaskId}_why`,
              icon: "search",
              label: "Why do we need this?",
              detail: "Hear the science behind it.",
              next: `${target}.why`,
            },
          ]
        : []),
      ...extraChoices,
    ],
  };

  if (!why) return { [target]: entry };

  return {
    [target]: entry,
    [`${target}.why`]: {
      speaker,
      eyebrow: "WHY IT MATTERS",
      title: "Good question",
      body: why,
      choices: [
        // Keep the same id as the main confirm: the choice is recorded under
        // both nodes, so reopening the crew member shows the result instead of
        // letting the player complete the task (and its effects) again.
        { ...confirm, resultNode: target },
        {
          id: `${subtaskId}_later`,
          icon: "moon",
          label: "I'll think about it",
          detail: "Close the link for now.",
          result: "Understood, Commander. I'll wait by the station.",
          toast: "Link closed",
        },
      ],
    },
  };
}

/** A flavour-only station or prop node: no choices, no state change. */
export function inspectNode({ speaker, eyebrow, title, lines, report = null }) {
  return { speaker, eyebrow, title, body: lines, report };
}

/** A station node that offers one real decision plus an explanation. */
export function decisionNode({ speaker, eyebrow, title, lines, choices }) {
  return { speaker, eyebrow, title, body: lines, choices };
}

/** Merges node maps from several crew tasks into one Sol dictionary. */
export function mergeNodes(...maps) {
  return maps.reduce((all, map) => ({ ...all, ...map }), {});
}
