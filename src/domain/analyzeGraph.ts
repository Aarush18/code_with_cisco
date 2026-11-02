import { buildAdjacency } from './buildAdjacency'
import type {
  AnalysisOutcome,
  AnalysisResult,
  Graph,
  NodeAnalysis,
  ReplayEvent,
} from './graph.types'
import { validateGraph } from './validateGraph'

export function analyzeGraph(graph: Graph): AnalysisOutcome {
  const issues = validateGraph(graph)
  if (issues.length > 0) {
    return { ok: false, issues }
  }

  const adjacency = buildAdjacency(graph)
  const nodeIds = [...adjacency.keys()].sort()
  const nodes: Record<string, NodeAnalysis> = {}
  const discoveryOrder: string[] = []
  const bridgeIds = new Set<string>()
  const articulationIds = new Set<string>()
  const events: ReplayEvent[] = []
  let clock = 0
  let componentCount = 0

  function visit(nodeId: string, parent: string | null): void {
    const node: NodeAnalysis = {
      id: nodeId,
      parent,
      discovery: clock,
      low: clock,
    }
    clock += 1
    nodes[nodeId] = node
    discoveryOrder.push(nodeId)
    events.push({ type: 'DISCOVER', node: { ...node } })

    let childCount = 0

    for (const entry of adjacency.get(nodeId)!) {
      const neighbour = nodes[entry.nodeId]

      if (!neighbour) {
        childCount += 1
        events.push({
          type: 'INSPECT',
          edgeId: entry.edgeId,
          fromId: nodeId,
          toId: entry.nodeId,
          kind: 'tree',
        })
        visit(entry.nodeId, nodeId)

        const child = nodes[entry.nodeId]
        const oldLow = node.low
        node.low = Math.min(node.low, child.low)
        events.push({
          type: 'RETURN',
          parentId: nodeId,
          childId: entry.nodeId,
          edgeId: entry.edgeId,
          oldLow,
          newLow: node.low,
          childLow: child.low,
        })
        events.push({
          type: 'LOW_UPDATE',
          nodeId,
          edgeId: entry.edgeId,
          relatedNodeId: entry.nodeId,
          reason: 'child-return',
          oldLow,
          newLow: node.low,
        })

        const isBridge = child.low > node.discovery
        if (isBridge) {
          bridgeIds.add(entry.edgeId)
        }
        events.push({
          type: 'BRIDGE_CHECK',
          edgeId: entry.edgeId,
          parentId: nodeId,
          childId: entry.nodeId,
          parentDiscovery: node.discovery,
          childLow: child.low,
          isBridge,
        })

        const isArticulation = parent === null
          ? childCount >= 2
          : child.low >= node.discovery
        if (isArticulation) {
          articulationIds.add(nodeId)
        }
        events.push({
          type: 'ARTICULATION_CHECK',
          nodeId,
          childId: entry.nodeId,
          reason: parent === null ? 'root-child-count' : 'non-root-low-threshold',
          leftValue: parent === null ? childCount : child.low,
          rightValue: parent === null ? 2 : node.discovery,
          isArticulation,
        })
      } else if (entry.nodeId === parent) {
        events.push({
          type: 'INSPECT',
          edgeId: entry.edgeId,
          fromId: nodeId,
          toId: entry.nodeId,
          kind: 'parent',
        })
      } else {
        const oldLow = node.low
        node.low = Math.min(node.low, neighbour.discovery)
        events.push({
          type: 'INSPECT',
          edgeId: entry.edgeId,
          fromId: nodeId,
          toId: entry.nodeId,
          kind: 'visited',
        })
        events.push({
          type: 'LOW_UPDATE',
          nodeId,
          edgeId: entry.edgeId,
          relatedNodeId: entry.nodeId,
          reason: 'back-edge',
          oldLow,
          newLow: node.low,
        })
      }
    }

    events.push({ type: 'NODE_DONE', nodeId, low: node.low })
  }

  for (const nodeId of nodeIds) {
    if (nodes[nodeId]) {
      continue
    }
    componentCount += 1
    visit(nodeId, null)
    events.push({ type: 'COMPONENT_DONE', rootId: nodeId, componentNumber: componentCount, isLast: false })
  }

  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]
    if (event.type === 'COMPONENT_DONE') {
      event.isLast = true
      break
    }
  }

  const result: AnalysisResult = {
    discoveryOrder,
    nodes,
    componentCount,
    bridgeIds: [...bridgeIds].sort(),
    articulationIds: [...articulationIds].sort(),
    events,
  }

  return { ok: true, result }
}
