import { useMemo, useState } from 'react'
import { analyzeGraph } from '../domain/analyzeGraph'
import type { AnalysisResult, Graph, ValidationIssue } from '../domain/graph.types'
import { projectReplayState } from '../domain/projectReplayState'

export function useReplay(initialGraph: Graph) {
  const [graph, setGraph] = useState(initialGraph)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [issues, setIssues] = useState<ValidationIssue[]>([])
  const [eventIndex, setEventIndex] = useState(-1)

  const snapshot = useMemo(
    () => projectReplayState(graph, analysis ? analysis.events.slice(0, eventIndex + 1) : []),
    [analysis, eventIndex, graph],
  )
  const visibleEvents = analysis ? analysis.events.slice(0, eventIndex + 1) : []

  function load(nextGraph: Graph = initialGraph): boolean {
    const outcome = analyzeGraph(nextGraph)
    setGraph(nextGraph)
    setEventIndex(-1)

    if (!outcome.ok) {
      setAnalysis(null)
      setIssues(outcome.issues)
      return false
    }

    setIssues([])
    setAnalysis(outcome.result)
    return true
  }

  function step(): void {
    if (!analysis) {
      return
    }
    setEventIndex((current) => Math.min(current + 1, analysis.events.length - 1))
  }

  function runToEnd(): void {
    if (analysis) {
      setEventIndex(analysis.events.length - 1)
    }
  }

  function reset(): void {
    setGraph(initialGraph)
    setAnalysis(null)
    setIssues([])
    setEventIndex(-1)
  }

  return {
    graph,
    snapshot,
    issues,
    isLoaded: analysis !== null,
    eventIndex,
    eventCount: analysis?.events.length ?? 0,
    visibleEvents,
    canStep: analysis !== null && eventIndex < analysis.events.length - 1,
    load,
    step,
    runToEnd,
    reset,
  }
}
