import { mainArchipelago } from '../data/archipelago'
import { ReplayControls } from '../features/controls/ReplayControls'
import { IslandMap } from '../features/map/IslandMap'
import { EventPanel } from '../features/replay/EventPanel'
import { SafetySummary } from '../features/summary/SafetySummary'
import { NodeTable } from '../features/table/NodeTable'
import { useReplay } from '../hooks/useReplay'

export function App() {
  const replay = useReplay(mainArchipelago)

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Festival operations · low-link DFS</p>
          <h1>Treasure-Island Bridge Safety Map</h1>
          <p className="hero-copy">
            Replay the inspection and see the numerical proof behind every critical crossing.
          </p>
        </div>
        <div className="hero-badge" aria-label="Candidate-created graph size">
          <strong>8</strong> islands
          <span aria-hidden="true">·</span>
          <strong>9</strong> bridges
        </div>
      </header>

      <ReplayControls
        isLoaded={replay.isLoaded}
        canStep={replay.canStep}
        eventIndex={replay.eventIndex}
        eventCount={replay.eventCount}
        onLoad={() => replay.load()}
        onStep={replay.step}
        onRun={replay.runToEnd}
        onReset={replay.reset}
      />

      {replay.issues.length > 0 && (
        <section className="error-panel" role="alert">
          <strong>Graph validation failed</strong>
          <ul>
            {replay.issues.map((issue, index) => (
              <li key={`${issue.code}-${issue.subjectId ?? index}`}>{issue.message}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="dashboard" aria-label="Bridge safety analysis dashboard">
        <div className="map-column">
          <IslandMap graph={replay.graph} snapshot={replay.snapshot} />
          <EventPanel
            currentEvent={replay.snapshot.currentEvent}
            isLoaded={replay.isLoaded}
            eventIndex={replay.eventIndex}
            eventCount={replay.eventCount}
            visibleEvents={replay.visibleEvents}
          />
        </div>

        <aside className="analysis-column">
          <SafetySummary snapshot={replay.snapshot} isLoaded={replay.isLoaded} />
          <NodeTable graph={replay.graph} snapshot={replay.snapshot} />
        </aside>
      </section>
    </main>
  )
}
