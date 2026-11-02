import type { ReplayEvent } from '../../domain/graph.types'

interface EventPanelProps {
  currentEvent: ReplayEvent | null
  isLoaded: boolean
  eventIndex: number
  eventCount: number
  visibleEvents: ReplayEvent[]
}

function eventDescription(event: ReplayEvent): { label: string; text: string; proof?: string } {
  switch (event.type) {
    case 'DISCOVER':
      return {
        label: 'Island discovered',
        text: `${event.node.id} enters the DFS tree with parent ${event.node.parent ?? 'none because it is a root'}.`,
        proof: `discovery[${event.node.id}] = low[${event.node.id}] = ${event.node.discovery}`,
      }
    case 'INSPECT': {
      const kindText = {
        tree: 'It reaches an unvisited island, so it becomes a DFS-tree edge.',
        parent: 'It returns to the DFS parent, so it does not change low.',
        visited: 'It reaches an already visited non-parent island, so its discovery value will be considered.',
      }[event.kind]
      return {
        label: `${event.kind === 'visited' ? 'Visited' : event.kind} edge inspected`,
        text: `${event.fromId} inspects ${event.edgeId} toward ${event.toId}. ${kindText}`,
      }
    }
    case 'LOW_UPDATE':
      return {
        label: 'Low-link value updated',
        text: event.reason === 'back-edge'
          ? `low[${event.nodeId}] changes from ${event.oldLow} to ${event.newLow} because of back edge ${event.nodeId}-${event.relatedNodeId}.`
          : `low[${event.nodeId}] changes from ${event.oldLow} to ${event.newLow} after child ${event.relatedNodeId} returns.`,
        proof: event.reason === 'back-edge'
          ? `low[${event.nodeId}] = min(${event.oldLow}, discovery[${event.relatedNodeId}]) = ${event.newLow}`
          : `low[${event.nodeId}] = min(${event.oldLow}, low[${event.relatedNodeId}]) = ${event.newLow}`,
      }
    case 'RETURN':
      return {
        label: 'Child returned',
        text: `${event.childId} returns to ${event.parentId} with low[${event.childId}] = ${event.childLow}.`,
        proof: `candidate low[${event.parentId}]: ${event.oldLow} → ${event.newLow}`,
      }
    case 'BRIDGE_CHECK':
      return {
        label: event.isBridge ? 'Critical bridge found' : 'Bridge check passed safely',
        text: event.isBridge
          ? `${event.edgeId} is a bridge because ${event.childLow} is greater than ${event.parentDiscovery}.`
          : `${event.edgeId} is not a bridge because ${event.childLow} is not greater than ${event.parentDiscovery}.`,
        proof: `low[${event.childId}]=${event.childLow} ${event.isBridge ? '>' : '≤'} discovery[${event.parentId}]=${event.parentDiscovery}`,
      }
    case 'ARTICULATION_CHECK': {
      const rootRule = event.reason === 'root-child-count'
      return {
        label: event.isArticulation ? 'Articulation island found' : 'Articulation check passed safely',
        text: rootRule
          ? `${event.nodeId} has ${event.leftValue} DFS-tree child${event.leftValue === 1 ? '' : 'ren'}; a root needs at least ${event.rightValue}.`
          : `Child ${event.childId} has low ${event.leftValue}; compare it with discovery[${event.nodeId}] = ${event.rightValue}.`,
        proof: rootRule
          ? `${event.leftValue} ${event.isArticulation ? '≥' : '<'} ${event.rightValue}`
          : `low[${event.childId}]=${event.leftValue} ${event.isArticulation ? '≥' : '<'} discovery[${event.nodeId}]=${event.rightValue}`,
      }
    }
    case 'NODE_DONE':
      return {
        label: 'Island completed',
        text: `${event.nodeId} has no remaining neighbours to inspect.`,
        proof: `final low[${event.nodeId}] = ${event.low}`,
      }
    case 'COMPONENT_DONE':
      return {
        label: event.isLast ? 'Safety inspection complete' : 'Component completed',
        text: event.isLast
          ? `All ${event.componentNumber} component${event.componentNumber === 1 ? '' : 's'} have been inspected.`
          : `Component ${event.componentNumber}, rooted at ${event.rootId}, is complete.`,
      }
  }
}

export function EventPanel({
  currentEvent,
  isLoaded,
  eventIndex,
  eventCount,
  visibleEvents,
}: EventPanelProps) {
  const content = currentEvent ? eventDescription(currentEvent) : null

  return (
    <section className="card event-card" aria-labelledby="event-title" aria-live="polite">
      <div className="event-current">
        <div className="event-marker" aria-hidden="true">{currentEvent ? eventIndex + 1 : '—'}</div>
        <div>
          <p className="section-kicker">Current replay event</p>
          <h2 id="event-title">
            {content?.label ?? (isLoaded ? 'Analysis loaded' : 'Awaiting inspection')}
          </h2>
          <p>
            {content?.text ?? (isLoaded
              ? `Press Step to reveal the first of ${eventCount} deterministic events.`
              : 'Load the candidate-created archipelago, then step through the low-link proof.')}
          </p>
          {content?.proof && <code className="proof">{content.proof}</code>}
        </div>
      </div>

      {visibleEvents.length > 0 && (
        <div className="event-history" aria-label="Visible event history">
          <strong>History</strong>
          <ol>
            {visibleEvents.map((event, index) => (
              <li key={index} aria-current={index === eventIndex ? 'step' : undefined}>
                <span>{index + 1}</span> {eventDescription(event).label}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
