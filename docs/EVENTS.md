# Replay Event Contract

The engine records this event list once during analysis. Step advances one array entry; Run to End moves to the final entry of that same array. Repeated analysis of the same valid graph produces a deep-equal event list.

## Event types

### `DISCOVER`

Fields: `node` containing `id`, `parent`, `discovery`, and initial `low`.

### `INSPECT`

Fields: `edgeId`, `fromId`, `toId`, and `kind` (`tree`, `parent`, or `visited`). Every undirected edge is inspected from both sorted adjacency entries.

### `LOW_UPDATE`

Fields: `nodeId`, `edgeId`, `relatedNodeId`, `reason` (`back-edge` or `child-return`), `oldLow`, and `newLow`.

For a back edge, `newLow = min(oldLow, discovery[relatedNodeId])`. For a returned child, `newLow = min(oldLow, low[relatedNodeId])`.

### `RETURN`

Fields: `parentId`, `childId`, `edgeId`, `oldLow`, `newLow`, and `childLow`.

### `BRIDGE_CHECK`

Fields: `edgeId`, `parentId`, `childId`, `parentDiscovery`, `childLow`, and `isBridge`. The answer is yes exactly when `childLow > parentDiscovery`.

### `ARTICULATION_CHECK`

Fields: `nodeId`, `childId`, `reason`, `leftValue`, `rightValue`, and `isArticulation`.

- `non-root-low-threshold`: compare `low[child] >= discovery[node]`.
- `root-child-count`: compare current DFS child count `>= 2`.

Both positive and negative checks are recorded.

### `NODE_DONE`

Fields: `nodeId` and final `low`.

### `COMPONENT_DONE`

Fields: `rootId`, `componentNumber`, and `isLast`. The final component event completes the analysis.

## Fixed emission order

1. `DISCOVER` a node.
2. For each neighbour in ascending ID order, emit `INSPECT`.
3. A visited non-parent neighbour is followed by `LOW_UPDATE` using its discovery value.
4. A tree child recursively completes.
5. After that child, emit exactly: `RETURN`, `LOW_UPDATE`, `BRIDGE_CHECK`, `ARTICULATION_CHECK`.
6. Emit `NODE_DONE` after all neighbours.
7. Emit `COMPONENT_DONE` after each component.

Roots are selected in ascending node-ID order. The event list therefore does not depend on input array order or map coordinates.
