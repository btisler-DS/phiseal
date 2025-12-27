"use client";

import { useMemo, useState } from "react";
import { evaluateReasoningState } from "@/lib/phiseal/evaluator";
import { enforceGate } from "@/lib/phiseal/gate";
import { runSelfTest, type SelfTestResult } from "@/lib/phiseal/selftest";
import type { GateLogEntry, ReasoningState } from "@/lib/phiseal/types";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [currentState, setCurrentState] = useState<ReasoningState>("INITIAL");
  const [logs, setLogs] = useState<GateLogEntry[]>([]);
  const [selfTestResults, setSelfTestResults] = useState<SelfTestResult[] | null>(null);

  const metrics = useMemo(() => {
    const stateCounts: Record<string, number> = {};
    for (const l of logs) stateCounts[l.new_state] = (stateCounts[l.new_state] ?? 0) + 1;
    return { total: logs.length, stateCounts };
  }, [logs]);

  function handleEvaluateAndEnforce() {
    const evalResult = evaluateReasoningState(input);
    const action = enforceGate(evalResult.state);

    const entry: GateLogEntry = {
      timestamp: new Date().toISOString(),
      previous_state: currentState,
      new_state: evalResult.state,
      action,
      confidence: evalResult.confidence,
      signals: evalResult.signals,
      input_excerpt: input.slice(0, 140)
    };

    setCurrentState(evalResult.state);
    setLogs((prev) => [...prev, entry]);
  }

  function handleRunSelfTest() {
    const results = runSelfTest((text) => {
      const r = evaluateReasoningState(text);
      return { ...r, action: enforceGate(r.state) };
    });
    setSelfTestResults(results);
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">PhiSeal Runtime Gate v1.0</h1>

      <div className="mt-6 grid gap-3">
        <label className="text-sm font-semibold">INPUT REASONING STREAM</label>
        <textarea
          className="min-h-[140px] w-full rounded border p-3 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a thought, question, or AI output here..."
        />

        <div className="flex flex-wrap gap-2">
          <button onClick={handleEvaluateAndEnforce} className="rounded bg-black px-4 py-2 text-sm font-semibold text-white">
            EVALUATE_AND_ENFORCE
          </button>
          <button onClick={handleRunSelfTest} className="rounded border border-black px-4 py-2 text-sm font-semibold">
            Run Self-Test
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <div className="rounded border px-3 py-2">
            <span className="font-semibold">Current Node State:</span> {currentState}
          </div>
          <div className="rounded border px-3 py-2">
            <span className="font-semibold">Total Logs:</span> {metrics.total}
          </div>
        </div>

        {selfTestResults && (
          <section className="rounded border p-3">
            <h2 className="text-lg font-semibold">Self-Test Results</h2>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {selfTestResults.map((r) => (
                <li key={r.name} className="mb-1">
                  <span className="font-semibold">{r.pass ? "PASS" : "FAIL"}</span> — {r.name} | expected{" "}
                  {r.expected.state}/{r.expected.action} | actual {r.actual.state}/{r.actual.action}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded border p-3">
          <h2 className="text-lg font-semibold">STATE_TRANSITION_LOGS</h2>
          <div className="mt-2 grid gap-2 text-sm">
            {logs.length === 0 && <div className="opacity-70">No logs yet.</div>}
            {logs
              .slice()
              .reverse()
              .map((l, idx) => (
                <div key={`${l.timestamp}-${idx}`} className="rounded border p-3">
                  <div className="font-mono text-xs">
                    {l.timestamp} | {l.previous_state} → {l.new_state} | {l.action} | conf={l.confidence.toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs opacity-80">
                    signals: {l.signals.join(", ") || "(none)"} | input: “{l.input_excerpt}”
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
