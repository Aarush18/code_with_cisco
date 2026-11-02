import { describe, expect, it } from 'vitest'
import { mainArchipelago } from '../data/archipelago'
import type { Graph } from './graph.types'
import { analyzeGraph } from './analyzeGraph'
import { validateGraph } from './validateGraph'

function issueCodes(graph: Graph): string[] {
  return validateGraph(graph).map((issue) => issue.code)
}

describe('graph validation', () => {
  it('rejects bad and duplicate node IDs, empty names, and invalid runtime coordinates', () => {
    const graph = {
      nodes: [
        { id: 'bad', name: 'Bad ID', x: 0, y: 0 },
        { id: 'A', name: '', x: 101, y: 0 },
        { id: 'A', name: 'Duplicate', x: Number.NaN, y: Number.POSITIVE_INFINITY },
        { id: 'B', name: 'Boolean coordinate', x: true, y: '20' },
      ],
      edges: [],
    } as unknown as Graph
    expect(issueCodes(graph)).toEqual(expect.arrayContaining([
      'INVALID_NODE_ID', 'DUPLICATE_NODE_ID', 'EMPTY_NODE_NAME', 'INVALID_COORDINATE',
    ]))
  })

  it('rejects bad and duplicate edge IDs, unknown endpoints, self-loops, and duplicate pairs', () => {
    const graph: Graph = {
      nodes: mainArchipelago.nodes,
      edges: [
        { id: 'bad', source: 'A', target: 'Z' },
        { id: 'LOOP', source: 'A', target: 'A' },
        { id: 'AB', source: 'A', target: 'B' },
        { id: 'AB', source: 'B', target: 'A' },
      ],
    }
    const issues = validateGraph(graph)
    expect(issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'INVALID_EDGE_ID', 'DUPLICATE_EDGE_ID', 'UNKNOWN_ENDPOINT', 'SELF_LOOP', 'DUPLICATE_CONNECTION',
    ]))
    expect(issues.some((issue) => issue.message.includes('Z'))).toBe(true)
    expect(issues.some((issue) => issue.message.includes('LOOP'))).toBe(true)
  })

  it('enforces 1–12 nodes and 0–20 edges', () => {
    expect(issueCodes({ nodes: [], edges: [] })).toContain('NODE_COUNT')

    const nodes = Array.from({ length: 13 }, (_, index) => ({
      id: String.fromCharCode(65 + index), name: `Node ${index}`, x: index, y: index,
    }))
    expect(issueCodes({ nodes, edges: [] })).toContain('NODE_COUNT')

    const sevenNodes = nodes.slice(0, 7)
    const edges = []
    for (let left = 0; left < sevenNodes.length; left += 1) {
      for (let right = left + 1; right < sevenNodes.length; right += 1) {
        edges.push({ id: `E${left}${right}`, source: sevenNodes[left].id, target: sevenNodes[right].id })
      }
    }
    expect(edges).toHaveLength(21)
    expect(issueCodes({ nodes: sevenNodes, edges })).toContain('EDGE_COUNT')
  })

  it('returns no partial result or events for invalid input', () => {
    const outcome = analyzeGraph({
      nodes: [{ id: 'A', name: 'A', x: Number.NaN, y: 0 }],
      edges: [],
    })
    expect(outcome.ok).toBe(false)
    expect(outcome).not.toHaveProperty('result')
    expect(outcome).not.toHaveProperty('events')
  })
})
