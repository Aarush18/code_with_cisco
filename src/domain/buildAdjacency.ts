import type { AdjacencyList, Graph } from './graph.types'

function compareAscii(left: string, right: string): number {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

export function buildAdjacency(graph: Graph): AdjacencyList {
  const adjacency: AdjacencyList = new Map()

  for (const node of graph.nodes) {
    adjacency.set(node.id, [])
  }

  for (const edge of graph.edges) {
    adjacency.get(edge.source)!.push({ edgeId: edge.id, nodeId: edge.target })
    adjacency.get(edge.target)!.push({ edgeId: edge.id, nodeId: edge.source })
  }

  for (const entries of adjacency.values()) {
    entries.sort((left, right) =>
      compareAscii(left.nodeId, right.nodeId) || compareAscii(left.edgeId, right.edgeId),
    )
  }

  return adjacency
}
