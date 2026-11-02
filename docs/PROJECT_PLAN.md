# Treasure-Island Bridge Safety Map — Build Plan

## 1. Scope and success definition

Build a local React + TypeScript application that:

- validates an undirected graph before analysis;
- produces deterministic adjacency lists from IDs, regardless of array order;
- runs Tarjan-style low-link DFS across every component;
- records a deterministic, explanatory event stream;
- replays one event at a time or to completion;
- keeps an SVG map, event explanation, node table, and result summary synchronized;
- has focused unit tests for algorithm rules, validation, ordering, events, and reset.

Deliberately exclude a graph editor, backend, database, accounts, map service, animation framework, state library, and routing.

## 2. Technology and architecture

- **Vite + React + TypeScript:** quick startup, familiar debugging, strict domain types.
- **Native SVG:** enough for eight positioned islands and bridges; no graph-visualization dependency.
- **Vitest + React Testing Library:** fast engine tests plus a small number of UI behavior tests.
- **Plain CSS:** minimal dependency surface and easy live styling changes.
- **Pure analysis engine:** validation, adjacency construction, DFS, and event generation do not import React.
- **Replay hook/reducer:** UI state only selects how many immutable events have been applied.

Proposed structure:

```text
src/
  app/
    App.tsx
    App.css
  data/
    archipelago.ts
  domain/
    graph.types.ts
    validateGraph.ts
    buildAdjacency.ts
    analyzeGraph.ts
    replay.types.ts
    projectReplayState.ts
  features/
    controls/ReplayControls.tsx
    map/IslandMap.tsx
    replay/EventPanel.tsx
    summary/SafetySummary.tsx
    table/NodeTable.tsx
  hooks/
    useReplay.ts
  test/
    graphFixtures.ts
docs/
  PROJECT_PLAN.md
  AI_INTERACTION_LOG.md
  DESIGN.md
  ORACLE.md
  EVENTS.md
```

Tests live beside the files they verify as `*.test.ts` or `*.test.tsx`.

## 3. Candidate-created main archipelago

Use eight nodes `A` through `H` and nine edges:

```text
AB, AC, BC, CD, DE, DF, EF, FG, FH
```

This creates:

- cycle `A-B-C-A`;
- critical connector `C-D`;
- cycle `D-E-F-D`;
- exposed branches `F-G` and `F-H`;
- non-root articulation nodes `C`, `D`, and `F`.

Sorted adjacency oracle, documented independently from application input:

```text
A: B, C
B: A, C
C: A, B, D
D: C, E, F
E: D, F
F: D, E, G, H
G: F
H: F
```

Expected deterministic DFS table:

| ID | Parent | Discovery | Low |
|---|---|---:|---:|
| A | — | 0 | 0 |
| B | A | 1 | 0 |
| C | B | 2 | 0 |
| D | C | 3 | 3 |
| E | D | 4 | 3 |
| F | E | 5 | 3 |
| G | F | 6 | 6 |
| H | F | 7 | 7 |

- Discovery order: `A, B, C, D, E, F, G, H`
- Component count: `1`
- Bridge IDs: `CD, FG, FH`
- Articulation IDs: `C, D, F`

The oracle is test/documentation data only. The application receives nodes and edges, never expected answers.

## 4. Ordered implementation plan

### Step 1 — Scaffold and freeze contracts

- Create the Vite TypeScript project and the folders above.
- Define `Graph`, `Node`, `Edge`, validation error, analysis result, and replay event types.
- Add the main archipelago and independent oracle.

**Checkpoint:** Type-check passes; data satisfies the declared types; README starts the app in two commands.

### Step 2 — Build and prove the engine

- Validate all graph constraints before traversal.
- Build adjacency from IDs and sort roots/neighbours by ASCII ID.
- Implement low-link DFS with one global zero-based clock.
- Emit documented events in a fixed order.
- Add focused tests before UI work.

**Checkpoint:** engine tests pass for the oracle, shuffled input, cycle-only graph, disconnected/root/isolated graph, invalid inputs, low propagation, strict bridge `>`, articulation `>=`, root child count, component ordering, and event ordering.

### Step 3 — Build replay state and controls

- Keep the complete event list immutable.
- Derive the visible snapshot by applying events through the current index.
- Implement Load, Step, Run to End, and Reset.
- Ensure invalid loads clear stale events and results.

**Checkpoint:** repeated stepped and complete runs produce identical histories; Reset restores the original candidate graph exactly.

### Step 4 — Build the synchronized explanation UI

- Render the full graph with native SVG and non-colour visual states.
- Add event explanation, node table, component count, and sorted critical summaries.
- Keep layout responsive but intentionally simple.

**Checkpoint:** one bridge can be explained from the visible event and low/discovery values without logs or developer tools.

### Step 5 — Verify and prepare interview evidence

- Run tests, type-check, and production build.
- Manually exercise Load → Step → Run to End → Reset.
- Capture final screenshots and representative test output.
- Finish README, design summary, prompt log, and honest plan-deviation notes.

**Checkpoint:** fresh install/start instructions work and a small UI or rule change can be made and verified in under ten minutes.

## 5. Event contract to implement

Events should be explicit discriminated unions, not log strings. Proposed observable order:

1. component starts;
2. node is discovered;
3. each adjacency entry is inspected as tree, parent, or visited;
4. after a tree child completes, parent low is updated;
5. that tree edge is classified as bridge or non-bridge;
6. any articulation consequence is recorded;
7. node completes;
8. component completes;
9. analysis completes.

Both directed adjacency entries of an undirected edge are inspected. This makes parent and already-visited handling visible and keeps ordering easy to explain. Final bridge/articulation sets remain de-duplicated and sorted.

## 6. Token- and time-efficient collaboration

- Work one numbered step at a time; do not regenerate the whole app after each change.
- Before coding each step, review only the relevant files and state the exact acceptance check.
- Keep domain logic pure so algorithm discussions do not require reading UI files.
- Ask for explanations or diffs of changed code, not repeated full-file walkthroughs.
- Batch related tests in one run; use focused tests while iterating and the full suite only at checkpoints.
- Record decisions once in `docs/` and refer back to them instead of restating context in every prompt.
- Prefer small patches that you read and explain before moving on.
- Stop optional polish if any required acceptance criterion is unverified.

Recommended working cadence: one Codex turn for implementation and one for review/understanding per step. This keeps you involved while avoiding context-heavy rework.

## 7. Likely live modifications

Prepare for changes such as:

- add replay speed or a Pause control;
- add a legend/filter for bridges and articulation nodes;
- display the number of disconnected components;
- change event wording or map symbols;
- load a second fixed graph;
- add validation for a newly stated constraint;
- expose a printable summary.

The architecture localizes these changes to a feature component, one event type/projector, or one validator rule rather than `App.tsx`.

## 8. Completion review

All five steps were completed in the planned order. The upgraded verification produces 22 passing tests, including a brute-force seeded oracle, plus a passing TypeScript check and production build.

The scope remained intentionally minimal. Optional animation and printing were not added because all required acceptance criteria and interview documentation took priority. Dependency installation changed from npm to pnpm only because npm failed internally during dependency resolution; application architecture and behavior were unaffected.
