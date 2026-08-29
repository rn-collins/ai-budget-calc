# AI Build Cost Workbench

Turns an early idea into a reviewable cost scenario — labor, model usage, infrastructure,
vendors, operations, named risk, and the assumptions connecting them. Every output is a
function of visible, editable inputs. Nothing is inferred from a project label.

## What it now explains, not just computes

- **A reading of the scenario.** Plain-language interpretation generated from the actual
  numbers: how wide the range is and what that width means, what share is labor versus risk,
  whether the token bill is or is not the thing that costs money, and after how many months
  cumulative operating cost overtakes the one-time build.
- **The arithmetic, written out.** The same calculation the page performed, step by step on
  your figures, so a reader can reproduce it by hand.
- **Sensitivity as an exhaustive decomposition.** Each ranged assumption's width at year-one
  scale. The bars sum *exactly* to the width of the year-one range, so the longest bar is
  provably the assumption worth resolving first. Model workloads are point estimates, so they
  are stressed separately by a percentage you choose and labelled as outside that sum.
- **A rate desk.** Provenance and check date per model, a live staleness read
  (current / aging past 30 days / stale past 90), what actually moves a published rate, and a
  per-workload override so a negotiated or newer rate replaces the catalog and is marked as yours.
- **A scenario library.** Save named scenarios in this browser and compare them side by side
  with deltas against a baseline — including specification confidence, so two scenarios are not
  compared at different depths of specification.

## Where the data sits

Two local-storage keys, no runtime request to any provider or analytics endpoint, and share
links that encode the scenario in the URL fragment. See `/privacy`.

## Test

```sh
npm test
```
