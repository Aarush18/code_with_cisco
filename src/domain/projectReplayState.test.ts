import { describe, expect, it } from 'vitest'
import { mainArchipelago } from '../data/archipelago'
import { analyzeGraph } from './analyzeGraph'
import { projectReplayState } from './projectReplayState'

function events() {
  const outcome = analyzeGraph(mainArchipelago)
  if (!outcome.ok) throw new Error('Fixture must be valid')
  return outcome.result.events
}

describe('replay projection', () => {
  it('starts with every node unvisited and no stale result', () => {
    const snapshot = projectReplayState(mainArchipelago, [])
    expect(Object.values(snapshot.nodes).every((node) => node.status === 'unvisited')).toBe(true)
    expect(snapshot.bridgeIds).toEqual([])
    expect(snapshot.articulationIds).toEqual([])
    expect(snapshot.currentEvent).toBeNull()
  })

  it('applies exactly one supplied event at a time', () => {
    const history = events()
    const before = projectReplayState(mainArchipelago, [])
    const afterDiscover = projectReplayState(mainArchipelago, history.slice(0, 1))
    expect(before.nodes.A.status).toBe('unvisited')
    expect(afterDiscover.nodes.A.status).toBe('discovered')
    expect(afterDiscover.nodes.A.discovery).toBe(0)
  })

  it('reaches the documented final visual state', () => {
    const snapshot = projectReplayState(mainArchipelago, events())
    expect(snapshot.analysisComplete).toBe(true)
    expect(snapshot.bridgeIds).toEqual(['CD', 'FG', 'FH'])
    expect(snapshot.articulationIds).toEqual(['C', 'D', 'F'])
    expect(Object.values(snapshot.nodes).every((node) => node.status === 'completed')).toBe(true)
  })
})
