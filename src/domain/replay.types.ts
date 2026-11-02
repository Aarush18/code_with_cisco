import type { NodeAnalysis, ReplayEvent } from './graph.types'

export type NodeReplayStatus = 'unvisited' | 'discovered' | 'completed'

export interface ReplayNode extends NodeAnalysis {
  status: NodeReplayStatus
}

export interface ReplaySnapshot {
  nodes: Record<string, ReplayNode>
  currentEvent: ReplayEvent | null
  currentNodeId: string | null
  currentEdgeId: string | null
  componentCount: number
  treeEdgeIds: string[]
  nonTreeEdgeIds: string[]
  bridgeIds: string[]
  articulationIds: string[]
  analysisComplete: boolean
}
