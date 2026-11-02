import { describe, expect, it } from 'vitest'
import type { Graph } from './graph.types'
import { analyzeGraph } from './analyzeGraph'

function componentCount(graph: Graph): number {
  const adjacency = new Map(graph.nodes.map((node) => [node.id, [] as string[]]))
  for (const edge of graph.edges) {
    adjacency.get(edge.source)!.push(edge.target)
    adjacency.get(edge.target)!.push(edge.source)
  }
  const visited = new Set<string>()
  let count = 0
  for (const node of graph.nodes) {
    if (visited.has(node.id)) continue
    count += 1
    const pending = [node.id]
    while (pending.length > 0) {
      const current = pending.pop()!
      if (visited.has(current)) continue
      visited.add(current)
      for (const neighbour of adjacency.get(current)!) pending.push(neighbour)
    }
  }
  return count
}

function bruteForceCriticalItems(graph: Graph) {
  const baseline = componentCount(graph)
  const bridgeIds = graph.edges
    .filter((edge) => componentCount({ nodes: graph.nodes, edges: graph.edges.filter((candidate) => candidate.id !== edge.id) }) > baseline)
    .map((edge) => edge.id)
    .sort()
  const articulationIds = graph.nodes
    .filter((node) => {
      const nodes = graph.nodes.filter((candidate) => candidate.id !== node.id)
      const edges = graph.edges.filter((edge) => edge.source !== node.id && edge.target !== node.id)
      return componentCount({ nodes, edges }) > baseline
    })
    .map((node) => node.id)
    .sort()
  return { bridgeIds, articulationIds }
}

function seededGraphs(seed: number, count: number): Graph[] {
  let state = seed >>> 0
  function random() {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 2 ** 32
  }
  return Array.from({ length: count }, (_, graphIndex) => {
    const nodeCount = 1 + Math.floor(random() * 7)
    const nodes = Array.from({ length: nodeCount }, (_, index) => ({
      id: String.fromCharCode(65 + index),
      name: `Node ${index}`,
      x: (index * 17 + graphIndex) % 101,
      y: (index * 29 + graphIndex) % 101,
    }))
    const edges: Graph['edges'] = []
    for (let left = 0; left < nodeCount; left += 1) {
      for (let right = left + 1; right < nodeCount; right += 1) {
        if (random() < 0.35 && edges.length < 20) {
          edges.push({ id: `E${left}${right}`, source: nodes[left].id, target: nodes[right].id })
        }
      }
    }
    return { nodes, edges }
  })
}

describe('brute-force connectivity oracle', () => {
  it('matches Tarjan bridges and articulation points on seeded small graphs', () => {
    for (const graph of seededGraphs(20261102, 120)) {
      const outcome = analyzeGraph(graph)
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) continue
      expect({ bridgeIds: outcome.result.bridgeIds, articulationIds: outcome.result.articulationIds })
        .toEqual(bruteForceCriticalItems(graph))
    }
  })
})
