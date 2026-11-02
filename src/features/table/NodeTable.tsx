import type { Graph } from '../../domain/graph.types'
import type { ReplaySnapshot } from '../../domain/replay.types'

interface NodeTableProps {
  graph: Graph
  snapshot: ReplaySnapshot
}

export function NodeTable({ graph, snapshot }: NodeTableProps) {
  return (
    <section className="card table-card" aria-labelledby="table-title">
      <div className="card-heading">
        <div>
          <p className="section-kicker">Numerical proof</p>
          <h2 id="table-title">Node values</h2>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Parent</th>
              <th scope="col">Discovery</th>
              <th scope="col">Low</th>
            </tr>
          </thead>
          <tbody>
            {[...graph.nodes].sort((left, right) => left.id.localeCompare(right.id)).map((node) => {
              const value = snapshot.nodes[node.id]
              const unvisited = value.status === 'unvisited'
              return (
                <tr key={node.id} className={snapshot.currentNodeId === node.id ? 'current-row' : ''}>
                  <th scope="row">{node.id}</th>
                  <td>{unvisited ? '—' : value.parent ?? 'root'}</td>
                  <td>{unvisited ? '—' : value.discovery}</td>
                  <td>{unvisited ? '—' : value.low}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
