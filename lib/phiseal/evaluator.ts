import type { EvaluationResult } from "./types";

const DRIFT_PATTERNS: Array<[RegExp, string, number]> = [
  [/can't stop/i, "cant_stop", 0.45],
  [/cannot stop/i, "cannot_stop", 0.45],
  [/keep going back and forth/i, "back_and_forth", 0.45],
  [/going back and forth/i, "back_and_forth", 0.40],
  [/over and over/i, "over_and_over", 0.35],
  [/second guessing/i, "second_guessing", 0.35],
  [/overthink|overthinking/i, "overthinking", 0.30],
  [/ruminat|rumination/i, "rumination", 0.35],
  [/obsess|obsessing/i, "obsessing", 0.35]
];

const UNCERTAINTY_A: Array<[RegExp, string, number]> = [
  [/i'?m not sure/i, "im_not_sure", 0.35],
  [/i am not sure/i, "im_not_sure", 0.35],
  [/not sure what/i, "not_sure_what", 0.35],
  [/uncertain/i, "uncertain", 0.30],
  [/unclear/i, "unclear", 0.25]
];

const UNCERTAINTY_B: Array<[RegExp, string, number]> = [
  [/constraints?/i, "constraints", 0.35],
  [/factors?/i, "factors", 0.30],
  [/consider/i, "consider", 0.25],
  [/haven'?t identified/i, "havent_identified", 0.35],
  [/not identified/i, "not_identified", 0.30],
  [/haven'?t considered/i, "havent_considered", 0.35],
  [/additional/i, "additional", 0.20],
  [/what am i missing/i, "what_am_i_missing", 0.45]
];

const UNCERTAINTY_C: Array<[RegExp, string, number]> = [
  [/before deciding/i, "before_deciding", 0.20],
  [/before i decide/i, "before_i_decide", 0.20],
  [/prior to deciding/i, "prior_to_deciding", 0.20],
  [/before making a decision/i, "before_making_decision", 0.20]
];

function scoreMatches(text: string, rules: Array<[RegExp, string, number]>) {
  let score = 0;
  const signals: string[] = [];
  for (const [re, sig, w] of rules) {
    if (re.test(text)) {
      score += w;
      signals.push(sig);
    }
  }
  return { score, signals };
}

export function evaluateReasoningState(inputText: string): EvaluationResult {
  const text = (inputText || "").trim();
  if (!text) return { state: "OTHER", confidence: 0.0, signals: ["empty"] };

  const drift = scoreMatches(text, DRIFT_PATTERNS);
  if (drift.score >= 0.45) {
    return { state: "DRIFT", confidence: Math.min(1, drift.score), signals: drift.signals };
  }

  const ua = scoreMatches(text, UNCERTAINTY_A);
  const ub = scoreMatches(text, UNCERTAINTY_B);
  const uc = scoreMatches(text, UNCERTAINTY_C);

  if (ua.score > 0 && ub.score > 0) {
    const conf = Math.min(1, ua.score + ub.score + uc.score);
    return { state: "UNCERTAINTY", confidence: conf, signals: [...ua.signals, ...ub.signals, ...uc.signals] };
  }

  return { state: "OTHER", confidence: 0.2, signals: ["no_rule_match"] };
}
