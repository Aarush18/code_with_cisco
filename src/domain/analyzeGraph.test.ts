import { describe, expect, it } from 'vitest'
import { mainArchipelago } from '../data/archipelago'
import type { Graph, NodeAnalysis } from './graph.types'
import { cycleOnlyGraph, mixedComponentsGraph } from '../test/graphFixtures'
import { analyzeGraph } from './analyzeGraph'
import { buildAdjacency } from './buildAdjacency'

const MAIN_ORACLE = {
  adjacency: {
    A: ['B', 'C'],
    B: ['A', 'C'],
    C: ['A', 'B', 'D'],
    D: ['C', 'E', 'F'],
    E: ['D', 'F'],
    F: ['D', 'E', 'G', 'H'],
    G: ['F'],
    H: ['F'],
  },
  discoveryOrder: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  nodes: {
    A: { id: 'A', parent: null, discovery: 0, low: 0 },
    B: { id: 'B', parent: 'A', discovery: 1, low: 0 },
    C: { id: 'C', parent: 'B', discovery: 2, low: 0 },
    D: { id: 'D', parent: 'C', discovery: 3, low: 3 },
    E: { id: 'E', parent: 'D', discovery: 4, low: 3 },
    F: { id: 'F', parent: 'E', discovery: 5, low: 3 },
    G: { id: 'G', parent: 'F', discovery: 6, low: 6 },
    H: { id: 'H', parent: 'F', discovery: 7, low: 7 },
  } satisfies Record<string, NodeAnalysis>,
  componentCount: 1,
  bridgeIds: ['CD', 'FG', 'FH'],
  articulationIds: ['C', 'D', 'F'],
} as const

function expectSuccessful(graph: Graph = mainArchipelago) {
  const outcome = analyzeGraph(graph)
  expect(outcome.ok).toBe(true)
  if (!outcome.ok) throw new Error('Expected successful analysis')
  return outcome.result
}

function seededShuffle<T>(values: T[], seed: number): T[] {
  const shuffled = [...values]
  let state = seed >>> 0
  function random() {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 2 ** 32
  }
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }
  return shuffled
}

const stemAndLoopGraph: Graph = {
  nodes: ['A', 'B', 'C', 'D'].map((id, index) => ({ id, name: id, x: index * 20, y: 20 })),
  edges: [
    { id: 'AB', source: 'A', target: 'B' },
    { id: 'BC', source: 'B', target: 'C' },
    { id: 'BD', source: 'B', target: 'D' },
    { id: 'CD', source: 'C', target: 'D' },
  ],
}

describe('deterministic low-link analysis', () => {
  it('matches hand-derived constants stored only in this test', () => {
    const result = expectSuccessful()
    expect(result.discoveryOrder).toEqual(MAIN_ORACLE.discoveryOrder)
    expect(result.nodes).toEqual(MAIN_ORACLE.nodes)
    expect(result.componentCount).toBe(MAIN_ORACLE.componentCount)
    expect(result.bridgeIds).toEqual(MAIN_ORACLE.bridgeIds)
    expect(result.articulationIds).toEqual(MAIN_ORACLE.articulationIds)

    const adjacency = buildAdjacency(mainArchipelago)
    expect(Object.fromEntries([...adjacency].map(([id, entries]) => [id, entries.map((entry) => entry.nodeId)])))
      .toEqual(MAIN_ORACLE.adjacency)
  })

  it('propagates low from a visited neighbour discovery value', () => {
    const result = expectSuccessful(cycleOnlyGraph)
    expect(result.nodes.C.low).toBe(0)
    expect(result.events).toContainEqual(expect.objectContaining({
      type: 'LOW_UPDATE', nodeId: 'C', relatedNodeId: 'A', reason: 'back-edge', oldLow: 2, newLow: 0,
    }))
  })

  it('uses strict bridge inequality and non-root >= articulation rule', () => {
    const result = expectSuccessful(stemAndLoopGraph)
    expect(result.bridgeIds).toEqual(['AB'])
    expect(result.articulationIds).toEqual(['B'])
    expect(result.nodes.C.low).toBe(result.nodes.B.discovery)
  })

  it('applies the root child-count rule but does not flag a triangle root', () => {
    const star: Graph = {
      nodes: ['A', 'B', 'C', 'D'].map((id, index) => ({ id, name: id, x: index * 20, y: 20 })),
      edges: [
        { id: 'AB', source: 'A', target: 'B' },
        { id: 'AC', source: 'A', target: 'C' },
        { id: 'AD', source: 'A', target: 'D' },
      ],
    }
    expect(expectSuccessful(star).articulationIds).toEqual(['A'])
    expect(expectSuccessful(cycleOnlyGraph).articulationIds).toEqual([])
  })

  it('finds no bridge or articulation point in a cycle-only graph', () => {
    const result = expectSuccessful(cycleOnlyGraph)
    expect(result.bridgeIds).toEqual([])
    expect(result.articulationIds).toEqual([])
  })

  it('orders roots and keeps one discovery clock across components', () => {
    const result = expectSuccessful(mixedComponentsGraph)
    expect(result.componentCount).toBe(3)
    expect(result.discoveryOrder).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
    expect(result.nodes.D.discovery).toBe(3)
    expect(result.nodes.G).toEqual({ id: 'G', parent: null, discovery: 6, low: 6 })
    expect(result.articulationIds).toEqual(['A'])
  })

  it('deep-equals results and events after reverse and seeded shuffles', () => {
    const original = expectSuccessful()
    const variants = [
      { nodes: [...mainArchipelago.nodes].reverse(), edges: [...mainArchipelago.edges].reverse() },
      { nodes: seededShuffle(mainArchipelago.nodes, 42), edges: seededShuffle(mainArchipelago.edges, 99) },
    ]
    for (const variant of variants) expect(expectSuccessful(variant)).toEqual(original)
  })

  it('does not mutate source node or edge arrays', () => {
    const graph = structuredClone(mainArchipelago)
    const before = structuredClone(graph)
    expectSuccessful(graph)
    expect(graph).toEqual(before)
  })

  it('emits the exact hand-written event list for one edge', () => {
    const graph: Graph = {
      nodes: [
        { id: 'A', name: 'A', x: 0, y: 0 },
        { id: 'B', name: 'B', x: 10, y: 10 },
      ],
      edges: [{ id: 'AB', source: 'A', target: 'B' }],
    }
    expect(expectSuccessful(graph).events).toEqual([
      { type: 'DISCOVER', node: { id: 'A', parent: null, discovery: 0, low: 0 } },
      { type: 'INSPECT', edgeId: 'AB', fromId: 'A', toId: 'B', kind: 'tree' },
      { type: 'DISCOVER', node: { id: 'B', parent: 'A', discovery: 1, low: 1 } },
      { type: 'INSPECT', edgeId: 'AB', fromId: 'B', toId: 'A', kind: 'parent' },
      { type: 'NODE_DONE', nodeId: 'B', low: 1 },
      { type: 'RETURN', parentId: 'A', childId: 'B', edgeId: 'AB', oldLow: 0, newLow: 0, childLow: 1 },
      { type: 'LOW_UPDATE', nodeId: 'A', edgeId: 'AB', relatedNodeId: 'B', reason: 'child-return', oldLow: 0, newLow: 0 },
      { type: 'BRIDGE_CHECK', edgeId: 'AB', parentId: 'A', childId: 'B', parentDiscovery: 0, childLow: 1, isBridge: true },
      { type: 'ARTICULATION_CHECK', nodeId: 'A', childId: 'B', reason: 'root-child-count', leftValue: 1, rightValue: 2, isArticulation: false },
      { type: 'NODE_DONE', nodeId: 'A', low: 0 },
      { type: 'COMPONENT_DONE', rootId: 'A', componentNumber: 1, isLast: true },
    ])
  })

  it('always emits RETURN, LOW_UPDATE, BRIDGE_CHECK, ARTICULATION_CHECK after a child', () => {
    const events = expectSuccessful().events
    const returnIndex = events.findIndex((event) => event.type === 'RETURN' && event.edgeId === 'CD')
    expect(events.slice(returnIndex, returnIndex + 4).map((event) => event.type)).toEqual([
      'RETURN', 'LOW_UPDATE', 'BRIDGE_CHECK', 'ARTICULATION_CHECK',
    ])
  })
})
