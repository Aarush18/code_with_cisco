import type { Graph } from '../domain/graph.types'

export const cycleOnlyGraph: Graph = {
  nodes: [
    { id: 'A', name: 'A', x: 10, y: 10 },
    { id: 'B', name: 'B', x: 50, y: 10 },
    { id: 'C', name: 'C', x: 30, y: 50 },
  ],
  edges: [
    { id: 'AB', source: 'A', target: 'B' },
    { id: 'BC', source: 'B', target: 'C' },
    { id: 'CA', source: 'C', target: 'A' },
  ],
}

export const mixedComponentsGraph: Graph = {
  nodes: [
    { id: 'G', name: 'Isolated', x: 90, y: 90 },
    { id: 'F', name: 'F', x: 60, y: 60 },
    { id: 'E', name: 'E', x: 50, y: 60 },
    { id: 'D', name: 'D', x: 55, y: 45 },
    { id: 'C', name: 'C', x: 30, y: 20 },
    { id: 'B', name: 'B', x: 10, y: 20 },
    { id: 'A', name: 'A', x: 20, y: 10 },
  ],
  edges: [
    { id: 'DF', source: 'D', target: 'F' },
    { id: 'EF', source: 'E', target: 'F' },
    { id: 'DE', source: 'D', target: 'E' },
    { id: 'AC', source: 'A', target: 'C' },
    { id: 'AB', source: 'A', target: 'B' },
  ],
}
