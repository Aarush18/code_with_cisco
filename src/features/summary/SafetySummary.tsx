import type { ReplaySnapshot } from '../../domain/replay.types'

interface SafetySummaryProps {
  snapshot: ReplaySnapshot
  isLoaded: boolean
}

function itemList(items: string[], emptyText: string) {
  return items.length > 0 ? items.join(', ') : emptyText
}

export function SafetySummary({ snapshot, isLoaded }: SafetySummaryProps) {
  return (
    <section className="card summary-card" aria-labelledby="summary-title">
      <div className="card-heading">
        <div>
          <p className="section-kicker">Safety result</p>
          <h2 id="summary-title">Critical items</h2>
        </div>
        <span className={`status-pill ${snapshot.analysisComplete ? 'complete' : ''}`}>
          {snapshot.analysisComplete ? 'Complete' : isLoaded ? 'In progress' : 'Not started'}
        </span>
      </div>
      <dl className="summary-grid">
        <div>
          <dt>Components</dt>
          <dd>{isLoaded ? snapshot.componentCount : '—'}</dd>
        </div>
        <div>
          <dt>Critical bridges</dt>
          <dd>{itemList(snapshot.bridgeIds, 'None identified yet')}</dd>
        </div>
        <div>
          <dt>Articulation islands</dt>
          <dd>{itemList(snapshot.articulationIds, 'None identified yet')}</dd>
        </div>
      </dl>
    </section>
  )
}
