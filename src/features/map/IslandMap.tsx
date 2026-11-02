import type { Graph } from '../../domain/graph.types'
import type { ReplaySnapshot } from '../../domain/replay.types'

interface IslandMapProps {
  graph: Graph
  snapshot: ReplaySnapshot
}

function edgeState(edgeId: string, snapshot: ReplaySnapshot): string {
  if (snapshot.currentEdgeId === edgeId) return 'current'
  if (snapshot.bridgeIds.includes(edgeId)) return 'bridge'
  if (snapshot.treeEdgeIds.includes(edgeId)) return 'tree'
  if (snapshot.nonTreeEdgeIds.includes(edgeId)) return 'non-tree'
  return 'unvisited'
}

export function IslandMap({ graph, snapshot }: IslandMapProps) {
  const nodesById = Object.fromEntries(graph.nodes.map((node) => [node.id, node]))

  return (
    <section className="card map-card" aria-labelledby="map-title">
      <div className="card-heading">
        <div>
          <p className="section-kicker">Live inspection</p>
          <h2 id="map-title">Festival archipelago</h2>
        </div>
        <div className="legend" aria-label="Map legend">
          <span><i className="legend-node-state unvisited" /> unvisited</span>
          <span><i className="legend-node-state current" /> current</span>
          <span><i className="legend-line tree" /> DFS tree</span>
          <span><i className="legend-line non-tree" /> alternate route</span>
          <span><i className="legend-line bridge" /> critical bridge</span>
          <span><i className="legend-node" /> ! articulation</span>
        </div>
      </div>

      <svg className="island-map" viewBox="0 0 100 88" role="img" aria-labelledby="map-title map-description">
        <desc id="map-description">
          Eight festival islands connected by nine footbridges. Line styles and symbols update during replay.
        </desc>
        <defs>
          <pattern id="water-grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 0 8 Q 2 6 4 8 T 8 8" fill="none" stroke="currentColor" strokeWidth="0.25" />
          </pattern>
          <filter id="current-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width="100" height="88" rx="3" className="map-water" />
        <rect width="100" height="88" rx="3" fill="url(#water-grid)" className="water-pattern" />

        <g aria-label="Footbridges">
          {graph.edges.map((edge) => {
            const source = nodesById[edge.source]
            const target = nodesById[edge.target]
            const state = edgeState(edge.id, snapshot)
            return (
              <g key={edge.id} className={`map-edge map-edge-${state}`}>
                <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} />
                <text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2 - 1.5}>
                  {state === 'bridge' ? `⚠ ${edge.id}` : edge.id}
                </text>
              </g>
            )
          })}
        </g>

        <g aria-label="Islands">
          {graph.nodes.map((node) => {
            const replayNode = snapshot.nodes[node.id]
            const isCurrent = snapshot.currentNodeId === node.id
            const isArticulation = snapshot.articulationIds.includes(node.id)
            return (
              <g
                key={node.id}
                className={`map-node map-node-${replayNode.status}${isCurrent ? ' is-current' : ''}${isArticulation ? ' is-articulation' : ''}`}
                transform={`translate(${node.x} ${node.y})`}
              >
                <circle r="6.2" className="island-shadow" />
                <circle r="5.4" className="island-shape" />
                {isArticulation && <circle r="7.1" className="articulation-ring" />}
                <text className="node-id" y="1.6">{isArticulation ? `! ${node.id}` : node.id}</text>
              </g>
            )
          })}
        </g>
      </svg>
    </section>
  )
}
