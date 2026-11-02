# AI Interaction Log

## Entry 1 — Requirement research and plan

**Prompt summary:** Review the supplied Cisco interview problem and student guide, research the project, propose a minimal clean React structure, account for prior knowledge of Tarjan's algorithm, and create a workflow that preserves Codex usage while completing the required work.

**Constraints supplied to AI:**

- minimal local application;
- clean folder-based React structure;
- candidate must understand context throughout;
- optimize for live modification and explainability;
- finish required behavior before optional polish.

**AI recommendations accepted:**

- React + TypeScript + Vite;
- pure TypeScript graph engine separated from React;
- native SVG rather than a graph library;
- immutable deterministic event stream plus derived replay snapshots;
- fixed eight-node demonstration with two cycles and three bridges;
- checkpoint-driven implementation with tests before UI.

**Recommendations intentionally rejected or deferred:**

- graph editor;
- backend or persistence;
- map/animation libraries;
- global state library;
- optional printable report and polished animation until all required checks pass.

**Reasoning:** These exclusions reduce code volume, dependency risk, and interview surface area while preserving every required acceptance criterion.

## Next entries

For each implementation step, append:

1. the exact prompt used;
2. what the AI proposed;
3. what was accepted, changed, or rejected;
4. verification evidence;
5. what you can now explain without AI.

## Entry 2 — Contracts and deterministic engine

**Working instruction to AI:** Implement only the typed graph contracts, fixed candidate graph, independent oracle, complete validation, deterministic adjacency, and low-link DFS. Keep the engine independent from React and test all contracted inequalities and ordering rules before UI work.

**Accepted:** Recursive DFS, one global clock, sorted roots/neighbours, explicit result types, all-or-nothing validation, and event emission at the operation that changes a value.

**Reviewed/corrected:** The test configuration initially imported Vite's `defineConfig`, which does not type the Vitest `test` property. It was changed to `vitest/config`, then type-checking passed.

**Evidence:** 11 engine and validation tests passed before replay work began.

**Candidate understanding:** `low` is the earliest discovery index reachable from a subtree; bridges use strict `>`, while non-root articulation points use `>=`.

## Entry 3 — Replay model

**Working instruction to AI:** Add deterministic replay without rerunning or duplicating Tarjan logic in React. Step must apply exactly one recorded event, Run to End must use the same history, invalid input must clear stale output, and Reset must restore the original pre-traversal state.

**Accepted:** Immutable event array, event-index cursor, and pure projection from an event prefix.

**Rejected:** Timers, animation state, scrubber, state library, and storing a second mutable graph.

**Evidence:** 16 cumulative tests passed after replay tests were added.

## Entry 4 — Explanation UI

**Working instruction to AI:** Build a minimal responsive React interface that shows the complete SVG map, non-colour visual states, current numerical explanation, node table, component count, and critical summaries together. Keep each likely live-change area in a small feature component.

**Accepted:** Native SVG, semantic controls and table, text/symbol/line-style distinctions, event-specific proof statements, and plain CSS.

**Reviewed:** Desktop and 390-pixel mobile renders were inspected. The completed map and summaries matched the independent oracle, and the browser console had no errors.

**Evidence:** 17 total tests, TypeScript check, production build, and browser workflow passed.

## Entry 5 — Plan review

The original five stages were followed in order. No feature stage needed reordering. Two implementation adjustments were made:

- dependency installation switched from npm to pnpm after npm failed inside its dependency resolver;
- optional animation and printable output remained deferred so required deterministic behavior and interview evidence were completed first.

## Entry 6 — Contract audit and upgrade

**Working instruction to AI:** Audit the existing project before editing, preserve its architecture and UI, then close verified gaps in the event schema, tests, and required documentation.

**Accepted:** Existing graph, algorithm result shape, React feature structure, controls, and Cisco-styled layout. The event union was refined to the specified eight types, negative checks were added, and history became inspectable without rerunning analysis.

**Corrected:** Expected oracle values moved out of runtime data and into test/documentation files. Locale-sensitive adjacency comparison changed to explicit ASCII comparison. Test coverage added seeded shuffles, exact events, runtime validation types, source immutability, and a 120-graph brute-force oracle.

**Evidence:** 6 test files and 22 tests pass before final browser verification.
