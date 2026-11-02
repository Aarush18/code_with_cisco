import type { Graph, ValidationIssue } from './graph.types'

const ID_PATTERN = /^[A-Z][A-Z0-9_-]{0,15}$/

export function validateGraph(graph: Graph): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const nodeIds = new Set<string>()
  const edgeIds = new Set<string>()
  const connections = new Set<string>()

  if (graph.nodes.length < 1 || graph.nodes.length > 12) {
    issues.push({
      code: 'NODE_COUNT',
      message: `Graph must contain 1–12 nodes; received ${graph.nodes.length}.`,
    })
  }

  if (graph.edges.length > 20) {
    issues.push({
      code: 'EDGE_COUNT',
      message: `Graph must contain 0–20 edges; received ${graph.edges.length}.`,
    })
  }

  for (const node of graph.nodes) {
    if (!ID_PATTERN.test(node.id)) {
      issues.push({ code: 'INVALID_NODE_ID', message: `Node ID "${node.id}" is invalid.`, subjectId: node.id })
    }
    if (nodeIds.has(node.id)) {
      issues.push({ code: 'DUPLICATE_NODE_ID', message: `Node ID "${node.id}" is duplicated.`, subjectId: node.id })
    }
    nodeIds.add(node.id)

    if (typeof node.name !== 'string' || node.name.trim().length === 0) {
      issues.push({ code: 'EMPTY_NODE_NAME', message: `Node "${node.id}" needs a display name.`, subjectId: node.id })
    }

    for (const [axis, coordinate] of [['x', node.x], ['y', node.y]] as const) {
      if (!Number.isFinite(coordinate) || coordinate < 0 || coordinate > 100) {
        issues.push({
          code: 'INVALID_COORDINATE',
          message: `Node "${node.id}" has ${axis}=${coordinate}; coordinates must be finite and between 0 and 100.`,
          subjectId: node.id,
        })
      }
    }
  }

  for (const edge of graph.edges) {
    if (!ID_PATTERN.test(edge.id)) {
      issues.push({ code: 'INVALID_EDGE_ID', message: `Edge ID "${edge.id}" is invalid.`, subjectId: edge.id })
    }
    if (edgeIds.has(edge.id)) {
      issues.push({ code: 'DUPLICATE_EDGE_ID', message: `Edge ID "${edge.id}" is duplicated.`, subjectId: edge.id })
    }
    edgeIds.add(edge.id)

    const sourceExists = nodeIds.has(edge.source)
    const targetExists = nodeIds.has(edge.target)
    if (!sourceExists) {
      issues.push({
        code: 'UNKNOWN_ENDPOINT',
        message: `Edge "${edge.id}" references unknown endpoint "${edge.source}".`,
        subjectId: edge.id,
      })
    }
    if (!targetExists) {
      issues.push({
        code: 'UNKNOWN_ENDPOINT',
        message: `Edge "${edge.id}" references unknown endpoint "${edge.target}".`,
        subjectId: edge.id,
      })
    }
    if (edge.source === edge.target) {
      issues.push({ code: 'SELF_LOOP', message: `Edge "${edge.id}" is a self-loop.`, subjectId: edge.id })
    }

    const connectionKey = [edge.source, edge.target].sort().join('\u0000')
    if (connections.has(connectionKey)) {
      issues.push({
        code: 'DUPLICATE_CONNECTION',
        message: `Edge "${edge.id}" duplicates connection ${edge.source}–${edge.target}.`,
        subjectId: edge.id,
      })
    }
    connections.add(connectionKey)
  }

  return issues
}
