interface ReplayControlsProps {
  isLoaded: boolean
  canStep: boolean
  eventIndex: number
  eventCount: number
  onLoad: () => void
  onStep: () => void
  onRun: () => void
  onReset: () => void
}

export function ReplayControls({
  isLoaded,
  canStep,
  eventIndex,
  eventCount,
  onLoad,
  onStep,
  onRun,
  onReset,
}: ReplayControlsProps) {
  const visibleEvent = eventIndex + 1

  return (
    <section className="toolbar" aria-label="Replay controls">
      <div className="button-group">
        <button className="button button-primary" type="button" onClick={onLoad}>
          Load My Archipelago
        </button>
        <button className="button" type="button" onClick={onStep} disabled={!canStep}>
          Step
        </button>
        <button className="button" type="button" onClick={onRun} disabled={!canStep}>
          Run to End
        </button>
        <button className="button button-quiet" type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      <p className="event-progress" aria-live="polite">
        {isLoaded ? `Event ${visibleEvent} of ${eventCount}` : 'Ready to inspect'}
      </p>
    </section>
  )
}
