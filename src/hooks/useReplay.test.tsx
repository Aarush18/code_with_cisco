import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mainArchipelago } from '../data/archipelago'
import { useReplay } from './useReplay'

describe('useReplay', () => {
  it('steps once, runs to the same final history, and resets exactly', () => {
    const { result } = renderHook(() => useReplay(mainArchipelago))

    expect(result.current.isLoaded).toBe(false)
    act(() => result.current.load())
    expect(result.current.eventIndex).toBe(-1)

    act(() => result.current.step())
    expect(result.current.eventIndex).toBe(0)
    expect(result.current.snapshot.currentEvent?.type).toBe('DISCOVER')

    act(() => result.current.runToEnd())
    expect(result.current.eventIndex).toBe(result.current.eventCount - 1)
    expect(result.current.snapshot.analysisComplete).toBe(true)

    act(() => result.current.reset())
    expect(result.current.isLoaded).toBe(false)
    expect(result.current.eventIndex).toBe(-1)
    expect(result.current.snapshot.currentEvent).toBeNull()
    expect(result.current.graph).toEqual(mainArchipelago)
  })

  it('clears a previous replay when an invalid graph is loaded', () => {
    const { result } = renderHook(() => useReplay(mainArchipelago))
    act(() => result.current.load())
    act(() => result.current.runToEnd())

    act(() =>
      result.current.load({
        nodes: [{ id: 'A', name: 'Broken', x: 200, y: 0 }],
        edges: [],
      }),
    )

    expect(result.current.isLoaded).toBe(false)
    expect(result.current.eventCount).toBe(0)
    expect(result.current.snapshot.bridgeIds).toEqual([])
    expect(result.current.issues[0].code).toBe('INVALID_COORDINATE')
  })

  it('produces the same snapshot and visible history by stepping or running to end', () => {
    const stepped = renderHook(() => useReplay(mainArchipelago))
    const completed = renderHook(() => useReplay(mainArchipelago))
    act(() => stepped.result.current.load())
    act(() => completed.result.current.load())

    const eventCount = stepped.result.current.eventCount
    act(() => {
      for (let index = 0; index < eventCount; index += 1) stepped.result.current.step()
    })
    act(() => completed.result.current.runToEnd())

    expect(stepped.result.current.snapshot).toEqual(completed.result.current.snapshot)
    expect(stepped.result.current.visibleEvents).toEqual(completed.result.current.visibleEvents)
  })
})
