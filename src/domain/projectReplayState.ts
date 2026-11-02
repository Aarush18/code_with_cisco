import type { Graph, ReplayEvent } from './graph.types'
import type { ReplaySnapshot } from './replay.types'

function sorted(set: Set<string>): string[] {
  return [...set].sort()
}

export function projectReplayState(graph: Graph, events: ReplayEvent[]): ReplaySnapshot {
  const nodes: ReplaySnapshot['nodes'] = Object.fromEntries(
    graph.nodes.map((node) => [
      node.id,
      {
        id: node.id,
        parent: null,
        discovery: -1,
        low: -1,
        status: 'unvisited' as const,
      },
    ]),
  )
  const treeEdgeIds = new Set<string>()
  const nonTreeEdgeIds = new Set<string>()
  const bridgeIds = new Set<string>()
  const articulationIds = new Set<string>()
  let componentCount = 0
  let analysisComplete = false

  for (const event of events) {
    switch (event.type) {
      case 'DISCOVER':
        nodes[event.node.id] = { ...event.node, status: 'discovered' }
        if (event.node.parent === null) componentCount += 1
        break
      case 'INSPECT':
        if (event.kind === 'tree') {
          treeEdgeIds.add(event.edgeId)
        } else if (event.kind === 'visited') {
          nonTreeEdgeIds.add(event.edgeId)
        }
        break
      case 'LOW_UPDATE':
        nodes[event.nodeId].low = event.newLow
        break
      case 'RETURN':
        break
      case 'BRIDGE_CHECK':
        if (event.isBridge) {
          bridgeIds.add(event.edgeId)
        }
        break
      case 'ARTICULATION_CHECK':
        if (event.isArticulation) articulationIds.add(event.nodeId)
        break
      case 'NODE_DONE':
        nodes[event.nodeId].low = event.low
        nodes[event.nodeId].status = 'completed'
        break
      case 'COMPONENT_DONE':
        componentCount = event.componentNumber
        analysisComplete = event.isLast
        break
    }
  }

  const currentEvent = events.at(-1) ?? null
  let currentNodeId: string | null = null
  let currentEdgeId: string | null = null

  if (currentEvent) {
    switch (currentEvent.type) {
      case 'DISCOVER':
        currentNodeId = currentEvent.node.id
        break
      case 'INSPECT':
        currentNodeId = currentEvent.fromId
        currentEdgeId = currentEvent.edgeId
        break
      case 'LOW_UPDATE':
        currentNodeId = currentEvent.nodeId
        currentEdgeId = currentEvent.edgeId
        break
      case 'RETURN':
        currentNodeId = currentEvent.parentId
        currentEdgeId = currentEvent.edgeId
        break
      case 'BRIDGE_CHECK':
        currentNodeId = currentEvent.childId
        currentEdgeId = currentEvent.edgeId
        break
      case 'ARTICULATION_CHECK':
        currentNodeId = currentEvent.nodeId
        break
      case 'NODE_DONE':
        currentNodeId = currentEvent.nodeId
        break
      case 'COMPONENT_DONE':
        currentNodeId = currentEvent.rootId
        break
    }
  }

  return {
    nodes,
    currentEvent,
    currentNodeId,
    currentEdgeId,
    componentCount,
    treeEdgeIds: sorted(treeEdgeIds),
    nonTreeEdgeIds: sorted(nonTreeEdgeIds),
    bridgeIds: sorted(bridgeIds),
    articulationIds: sorted(articulationIds),
    analysisComplete,
  }
}
