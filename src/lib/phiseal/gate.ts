import type { GateAction, ReasoningState } from "./types";

export function enforceGate(state: ReasoningState): GateAction {
  if (state === "DRIFT") return "INTERRUPT";
  return "NO_ACTION";
}
