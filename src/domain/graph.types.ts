export interface GraphNode {
  id: string
  name: string
  x: number
  y: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface AdjacencyEntry {
  edgeId: string
  nodeId: string
}

export type AdjacencyList = Map<string, AdjacencyEntry[]>

export interface NodeAnalysis {
  id: string
  parent: string | null
  discovery: number
  low: number
}

export interface AnalysisResult {
  discoveryOrder: string[]
  nodes: Record<string, NodeAnalysis>
  componentCount: number
  bridgeIds: string[]
  articulationIds: string[]
  events: ReplayEvent[]
}

export interface ValidationIssue {
  code: string
  message: string
  subjectId?: string
}

export type AnalysisOutcome =
  | { ok: true; result: AnalysisResult }
  | { ok: false; issues: ValidationIssue[] }

export type EdgeInspectionKind = 'tree' | 'parent' | 'visited'

export type ReplayEvent =
  | { type: 'DISCOVER'; node: NodeAnalysis }
  | {
      type: 'INSPECT'
      edgeId: string
      fromId: string
      toId: string
      kind: EdgeInspectionKind
    }
  | {
      type: 'LOW_UPDATE'
      nodeId: string
      edgeId: string
      relatedNodeId: string
      reason: 'back-edge' | 'child-return'
      oldLow: number
      newLow: number
    }
  | {
      type: 'RETURN'
      parentId: string
      childId: string
      edgeId: string
      oldLow: number
      newLow: number
      childLow: number
    }
  | {
      type: 'BRIDGE_CHECK'
      edgeId: string
      parentId: string
      childId: string
      parentDiscovery: number
      childLow: number
      isBridge: boolean
    }
  | {
      type: 'ARTICULATION_CHECK'
      nodeId: string
      childId: string
      reason: 'non-root-low-threshold' | 'root-child-count'
      leftValue: number
      rightValue: number
      isArticulation: boolean
    }
  | { type: 'NODE_DONE'; nodeId: string; low: number }
  | { type: 'COMPONENT_DONE'; rootId: string; componentNumber: number; isLast: boolean }
