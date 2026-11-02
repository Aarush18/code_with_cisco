# Test Evidence

## Commands

```bash
pnpm test
pnpm typecheck
pnpm build
```

## Latest automated result

```text
Test Files  6 passed (6)
Tests       22 passed (22)
TypeScript  passed
Vite build passed
```

Coverage includes:

- test-local hand-derived main oracle;
- back-edge propagation using neighbour discovery;
- strict bridge inequality on a stem plus loop;
- non-root `>=` articulation rule;
- root star and triangle rules;
- cycle-only graph;
- root with two children, disconnected component, and isolated node using one clock;
- ASCII root and neighbour ordering;
- reversed and seeded-shuffled arrays with deep-equal event lists;
- source-array immutability;
- complete validation categories and no partial result;
- exact hand-written tiny-graph event list;
- fixed `RETURN → LOW_UPDATE → BRIDGE_CHECK → ARTICULATION_CHECK` order;
- exact one-event replay projection;
- Step-to-end equality with Run to End;
- invalid-load stale-state clearing and exact Reset;
- brute-force edge/node removal oracle across 120 seeded small random graphs;
- complete React Load → Step → Run to End → Reset workflow.

## Browser verification

The app is checked with the candidate graph through Load, Step, Run to End, and Reset. The map, current-event explanation, scrollable visible history, node table, component count, and sorted critical summaries are displayed together. Final values are bridges `CD, FG, FH` and articulation nodes `C, D, F`. A fresh browser tab completed the replay with the history visible and no console errors.
