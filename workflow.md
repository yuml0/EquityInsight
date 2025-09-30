# Portfolio Climate Risk Workflow (Canadian Equities)

## 1) Inputs and assumptions

- A holdings list for Canadian equities: identifier, name, sector, weight
  (summing to 1.0).
- Time horizons of interest (e.g., 2030, 2040, 2050) and hazards of interest
  (e.g., heat, fluvial/pluvial flood, wildfire, wind, drought, coastal).
- Target metrics (e.g., composite risk score, impact/damage rate, loss/VAR-like
  measure).

## 2) Portfolio ingest and normalization

- Load the portfolio, validate identifiers, and normalize weights.
- Enrich with sector/industry and country if available; default sector from a
  reference mapping if missing.
- Persist a run "as‑of" date and the chosen horizons/hazards/metric set for
  reproducibility.

## 3) Company resolution

- Resolve portfolio identifiers to canonical company entities.
- Build a holdings table with company ID, name, sector, and portfolio weight.
- Cache the mapping to avoid re-resolving on subsequent runs.

## 4) Asset discovery

- For each company, retrieve its physical asset inventory and basic attributes:
  asset type, country and province/state, and geolocation.
- Optionally retrieve cluster representations by zoom level for map rendering.
- Maintain a company→asset index for later joins and drilldowns.

## 5) Risk metrics retrieval

- Company‑level aggregates (fast readout): pull multifactor and single‑hazard
  summaries per company across selected horizons.
- Asset‑level detail (for drilldown and drivers): pull per‑asset risk metrics
  across the same hazards/horizons.
- Distribution views: pull binned distributions (histograms) of asset risk to
  support portfolio dispersion charts.
- Server‑side aggregations: request grouped summaries by country,
  province/state, and asset type to minimize client‑side compute.

## 6) Portfolio aggregation and breakdowns

- Join metrics back to holdings by company; where metrics are at asset level,
  aggregate to company then to portfolio.
- Compute portfolio metrics using portfolio weights (weighted averages/sums
  appropriate to the metric).
- Produce breakdowns by:
  - Sector: portfolio risk by sector and Top‑N sectors contributing to risk.
  - Geography: country and province/state contributions; identify hotspots.
  - Hazard: contribution of each hazard to total risk.
  - Horizon: risk term structure across selected years.

## 7) Scenario and what‑if analysis

- Define a base case (default scenario assumptions).
- Run alternative scenarios or parameter variations (e.g., higher heatwave
  frequency, intensified fluvial flood).
- Compute deltas vs base for portfolio totals, sector/geography breakdowns, and
  Top‑N contributors.
- Summarize sensitivity: which hazards, regions, and asset types move the most.

## 8) Top‑N drivers and actionable insights

- Rank assets and companies by contribution to the chosen risk metric for a
  specific hazard/horizon.
- Identify concentration: holdings and locations that dominate risk.
- Recommend actions:
  - Tilts: reduce exposure to specific high‑risk sectors/regions/asset types.
  - Diversification: supplier or site diversification where feasible.
  - Adaptation: prioritize facility‑level interventions for highest‑impact
    sites.

## 9) Visualizations and narratives

- Maps: clustered asset points with color/size scaled by risk; click‑through to
  asset detail.
- Charts:
  - Histograms of asset risk distribution.
  - Stacked bars for sector/geography/hazard breakdowns.
  - Lines/columns for horizon trends and scenario deltas.
- Narrative: a short, investor‑friendly storyline explaining current risk,
  concentrations, and recommended tilts/adaptations.

## 10) Reproducibility, caching, and performance

- Cache company resolution and per‑company/per‑horizon responses with TTL.
- Log run configuration (portfolio, horizons, hazards, metric definitions) and
  data timestamps.
- Export intermediate and final outputs (CSV/Parquet) for audit and downstream
  reporting.

## 11) Deliverables and demo path

- Reproducible notebook/script:
  - Portfolio ingest → company resolution → asset discovery → metrics retrieval
    → portfolio aggregation → scenario deltas → Top‑N drivers.
- Example portfolio: TSX‑based or fabricated Canadian equity sample with
  weights.
- 5‑minute demo flow:
  1. Base portfolio risk overview,
  2. Filter by hazard and horizon,
  3. Drill to Top‑N drivers and map view,
  4. Run a flood/heat what‑if and show deltas,
  5. Present actionable tilts and adaptation priorities.
