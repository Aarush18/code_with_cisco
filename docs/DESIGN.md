# Design

## Architecture

- **Pure domain engine:** `validateGraph`, `buildAdjacency`, `analyzeGraph`, and `projectReplayState` import no React or DOM APIs.
- **Thin React shell:** `useReplay` owns the immutable analysis and cursor; feature components only render the projected prefix.
- **Single event source:** Step and Run to End consume the same event array. No UI code reruns Tarjan's algorithm.
- **Native SVG map:** fixed layout coordinates provide a clear map without a graph-layout dependency.
- **Test-local oracle:** expected answers exist in tests and documentation, never in application runtime data.

## Key decisions

- Recursive DFS is easiest to explain and safe for the contracted maximum of 12 nodes.
- Both adjacency entries of every undirected edge emit `INSPECT`, making tree, parent, and visited handling visible.
- Every returned child emits `RETURN`, `LOW_UPDATE`, `BRIDGE_CHECK`, then `ARTICULATION_CHECK`, including negative checks.
- The replay snapshot is rebuilt from an event prefix. Map, table, summary, current event, and history therefore use the same cursor.
- ASCII comparison is explicit rather than locale-dependent.
- Validation completes before adjacency or traversal, so invalid input cannot produce partial analysis.

## Trade-offs

- Analysis is computed fully on Load and replayed afterward. This favors deterministic explanation over pausing a live recursive call stack.
- `LOW_UPDATE` is emitted even when old and new values are equal. The fixed event schema is easier to test and explain than conditionally omitting proof steps.
- The event-history panel is compact and scrollable to preserve the existing one-screen layout.
- Display names remain valid graph data but are intentionally hidden on the map per the requested minimalist UI.

## Deferred

- graph editing;
- backend, persistence, accounts, or external APIs;
- animation speed and Pause;
- printable summary;
- parallel-edge analysis.
