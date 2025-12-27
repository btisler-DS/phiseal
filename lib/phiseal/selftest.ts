import type { GateAction, ReasoningState } from "./types";

export type SelfTestResult = {
  name: string;
  expected: { state: ReasoningState; action: GateAction };
  actual: { state: ReasoningState; action: GateAction };
  pass: boolean;
};

type EvalFn = (text: string) => { state: ReasoningState; action: GateAction };

const FIXTURES = [
  {
    name: "DRIFT should INTERRUPT",
    input:
      "I’ve already gone over the options multiple times, but I keep going back and forth and can’t stop thinking about whether I’m making the wrong choice.",
    expected: { state: "DRIFT" as const, action: "INTERRUPT" as const }
  },
  {
    name: "UNCERTAINTY declarative should NO ACTION",
    input:
      "I think this approach could work, but I’m not sure what constraints I haven’t identified yet or what additional factors I should consider before deciding.",
    expected: { state: "UNCERTAINTY" as const, action: "NO_ACTION" as const }
  },
  {
    name: "DRIFT overrides UNCERTAINTY",
    input:
      "I’m not sure what constraints I haven’t identified yet, but I can’t stop thinking about this and I keep going back and forth.",
    expected: { state: "DRIFT" as const, action: "INTERRUPT" as const }
  },
  {
    name: "OTHER background narrative should NO ACTION",
    input: "I had coffee, answered some emails, and I’m thinking about what to do later today.",
    expected: { state: "OTHER" as const, action: "NO_ACTION" as const }
  }
];

export function runSelfTest(evalFn: EvalFn): SelfTestResult[] {
  return FIXTURES.map((t) => {
    const r = evalFn(t.input);
    const pass = r.state === t.expected.state && r.action === t.expected.action;
    return { name: t.name, expected: t.expected, actual: { state: r.state, action: r.action }, pass };
  });
}
