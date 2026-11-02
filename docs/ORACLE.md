# Main Archipelago Oracle

This oracle was derived independently from the application. Runtime code receives only nodes and edges; the expected values below are documentation and test evidence.

## Sorted adjacency

```text
A: B, C
B: A, C
C: A, B, D
D: C, E, F
E: D, F
F: D, E, G, H
G: F
H: F
```

## Discovery order

```text
A, B, C, D, E, F, G, H
```

## Parent, discovery, and low

| ID | Parent | Discovery | Low |
|---|---|---:|---:|
| A | null | 0 | 0 |
| B | A | 1 | 0 |
| C | B | 2 | 0 |
| D | C | 3 | 3 |
| E | D | 4 | 3 |
| F | E | 5 | 3 |
| G | F | 6 | 6 |
| H | F | 7 | 7 |

- Component count: `1`
- Bridge IDs: `CD, FG, FH`
- Articulation IDs: `C, D, F`

## Manual trace

DFS starts at `A`, follows `A-B-C`, and the visited edge `C-A` lowers `low[C]` to `0`; this propagates to `B`. Edge `C-D` enters the second cycle. The visited edge `F-D` lowers `low[F]` to `3`, which propagates to `E`, so `DE`, `DF`, and `EF` are not bridges. Leaves `G` and `H` cannot reach an ancestor, making `FG` and `FH` bridges and `F` an articulation point. On return to `C`, `low[D]=3 > discovery[C]=2`, so `CD` is a bridge. The corresponding `>=` checks identify `C` and `D` as non-root articulation points.
