import type { Graph } from '../domain/graph.types'

export const mainArchipelago: Graph = {
  nodes: [
    { id: 'A', name: 'Anchor Cay', x: 14, y: 28 },
    { id: 'B', name: 'Buccaneer Bay', x: 27, y: 12 },
    { id: 'C', name: 'Coral Key', x: 34, y: 38 },
    { id: 'D', name: 'Driftwood Isle', x: 52, y: 48 },
    { id: 'E', name: 'Emerald Atoll', x: 65, y: 27 },
    { id: 'F', name: 'Festival Point', x: 72, y: 56 },
    { id: 'G', name: 'Gull Rock', x: 88, y: 39 },
    { id: 'H', name: 'Harbor Haven', x: 86, y: 76 },
  ],
  edges: [
    { id: 'AB', source: 'A', target: 'B' },
    { id: 'AC', source: 'A', target: 'C' },
    { id: 'BC', source: 'B', target: 'C' },
    { id: 'CD', source: 'C', target: 'D' },
    { id: 'DE', source: 'D', target: 'E' },
    { id: 'DF', source: 'D', target: 'F' },
    { id: 'EF', source: 'E', target: 'F' },
    { id: 'FG', source: 'F', target: 'G' },
    { id: 'FH', source: 'F', target: 'H' },
  ],
}
