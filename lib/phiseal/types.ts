export type ReasoningState = "INITIAL" | "DRIFT" | "UNCERTAINTY" | "OTHER";
export type GateAction = "INTERRUPT" | "NO_ACTION";

export type EvaluationResult = {
  state: ReasoningState;
  confidence: number;
  signals: string[];
};

export type GateLogEntry = {
  timestamp: string;
  previous_state: ReasoningState;
  new_state: ReasoningState;
  action: GateAction;
  confidence: number;
  signals: string[];
  input_excerpt: string;
};
