import type { Metadata } from 'next'
import Image from 'next/image'
import MethodologyFlowchart from '@/components/MethodologyFlowchart'
import PrioGridAnimation from '@/components/PrioGridAnimation'
import DTWTrajShowcase from '@/components/DTWTrajShowcase'

export const metadata: Metadata = {
  title: 'Methodology (Draft) — PaCE',
  description: 'Detailed, transparent description of PaCE’s forecasting methodology with animations and Q&A.',
}

export default function MethodologyDraftPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-14 pb-10 md:pt-16 md:pb-12 hero-background-network-image">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 leading-tight">Methodology (Draft)</h1>
          <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed max-w-3xl">
            How we forecast geopolitical conflict, civil unrest, and migration.
          </p>
          <p className="text-xs text-gray-500 mt-2">This is a working page for internal review. Not linked site‑wide.</p>
          <div className="mt-3">
            <a href="#faq" className="text-sm text-pace-red hover:text-pace-red-dark">Jump to FAQ ↴</a>
          </div>
        </div>
      </section>

      {/* System overview */}
      <section className="pt-6 pb-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-light text-gray-900">End‑to‑End Overview</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mt-2">
              Our pipeline combines spatiotemporal event data, shape‑based pattern discovery, and analog forecasting.
              It is designed to be interpretable, fast, and robust — with strong performance using purely
              autoregressive information when covariates are sparse.
            </p>
          </div>
          <MethodologyFlowchart />
        </div>
      </section>

      {/* What we forecast */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-4">Targets and Horizons</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We forecast conflict fatalities and unrest intensity over short to medium horizons. Typical horizons are
            1–6 months ahead, but the same approach supports weekly or quarterly aggregation depending on data latency
            and use case. Forecasts are produced at two spatial levels:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li><span className="font-medium">Country:</span> National aggregates for cross‑country comparison and strategic planning.</li>
            <li><span className="font-medium">Subnational (PRIO‑GRID 0.5°):</span> Gridded forecasts that capture spatial diffusion, hotspots, and heterogeneity within countries.</li>
          </ul>
        </div>
      </section>

      {/* Pattern discovery / analog forecasting */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-light text-gray-900 mb-3">Shape‑Based Pattern Discovery</h3>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              We treat each evolving trajectory (country or grid cell) as a <em>shape in time</em> and search the historical
              record for similar shapes. Those closest historical analogs provide plausible futures that we aggregate
              into a forecast with uncertainty.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Concretely, given a recent window of outcomes, we use dynamic time warping (DTW) and related measures to
                align sequences at different speeds and identify nearest analogs in the archive. We then follow each analog
                forward in time to obtain a set of candidate futures.
              </p>
              <p>
                These futures are clustered and summarized (e.g., by the centroid or a similarity‑weighted average) to produce
                point forecasts and distributional uncertainty (quantiles and prediction intervals). This analog approach is
                fast, interpretable, and data‑efficient.
              </p>
            </div>
            <div className="w-full max-w-xl mx-auto">
              <Image src="/academicPapers/methods/Figs/method1.png" alt="Shape‑based forecasting step 1" width={1000} height={700} className="rounded-lg border border-gray-200 w-full h-auto" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 w-full max-w-xl mx-auto">
              <Image src="/academicPapers/methods/Figs/method2.png" alt="Shape‑based forecasting step 2" width={1000} height={700} className="rounded-lg border border-gray-200 w-full h-auto" />
            </div>
            <div className="order-1 md:order-2 space-y-4 text-gray-700 leading-relaxed">
              <p>
                When covariates are available (e.g., population, access, economics, climate), we can enrich the similarity
                search. But a key result across our studies is that <span className="font-medium">purely autoregressive</span>
                shape‑matching — using only past fatalities or event intensity — performs on par with richer feature sets for
                short‑horizon forecasts.
              </p>
              <p className="text-sm text-gray-600">See also our unrest and migration applications using the same pattern‑based strategy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive DTW intuition */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-4 text-center">How alignment works (DTW)</h3>
          <p className="text-gray-700 text-center max-w-3xl mx-auto mb-6">
            Similar dynamics can unfold at different speeds. DTW aligns sequences to reveal common structure even when
            one pattern accelerates or lags relative to another.
          </p>
          <DTWTrajShowcase />
        </div>
      </section>

      {/* Subnational dynamics and diffusion */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-light text-gray-900 mb-3">Subnational Dynamics and Diffusion</h3>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              We model how risk appears, persists, and spreads across adjacent PRIO‑GRID (0.5°) cells. The method combines
              local history with neighborhood exposure to recover waves of escalation and hotspot formation that national
              aggregates can hide.
            </p>
          </div>

          <div className="max-w-5xl mx-auto text-gray-700 leading-relaxed mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-2">How the diffusion mechanism is captured</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-medium">Units:</span> Each PRIO‑GRID cell has a monthly outcome (e.g., fatalities) and lagged local history.</li>
              <li><span className="font-medium">Neighborhood exposure:</span> For every month, we compute distance‑decayed exposure to nearby activity (e.g., within 1–3 cell radii) using
                rook/queen contiguity and optional road/travel‑time weights to reflect corridors.</li>
              <li><span className="font-medium">Front dynamics:</span> Features track the distance to the most recent events (“how far is the front?”) and whether the front is advancing or receding.</li>
              <li><span className="font-medium">Persistence vs. activation:</span> We separate the chance that an active cell stays active (persistence) from the chance that an inactive cell turns on (activation),
                given its neighborhood exposure and recent local history.</li>
              <li><span className="font-medium">Analog matching at grid level:</span> For a target cell/time window, we find historical cell‑windows with similar local+neighbor patterns and follow their
                realized futures to form a predictive mixture for the target cell.</li>
              <li><span className="font-medium">3D shapes:</span> We also embed trajectories as space–time shapes (lat, lon, t). Similar shapes correspond to comparable diffusion paths and hotspot evolution.</li>
            </ul>
          </div>

          <div className="mb-8"><PrioGridAnimation /></div>

          <div className="relative w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow">
            <Image src="/academicPapers/methods/Figs/3dShapes.jpg" alt="3D spatiotemporal shapes of conflict trajectories" width={1400} height={900} className="w-full h-auto" />
          </div>
          <p className="text-center text-sm text-gray-600 mt-3 max-w-3xl mx-auto">
            Space–time trajectories represented as 3D shapes (latitude, longitude, time). Similar shapes indicate comparable
            dynamics even when they occur in different countries or decades.
          </p>
        </div>
      </section>

      {/* Data sources & preprocessing */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-4">Data Sources and Preprocessing</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Core events data</h4>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>UCDP georeferenced conflict events, 1989–present; monthly aggregation</li>
                <li>Country and PRIO‑GRID 0.5° levels</li>
                <li>Consistent definitions of conflict types and fatalities</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Optional covariates</h4>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Demography, access, economy and prices, climate, governance</li>
                <li>Spatial lags and contagion features at grid level</li>
                <li>Used to enrich similarity search when available</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Validation & key findings */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-light text-gray-900 mb-3">Validation and Key Findings</h3>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              We backtest across countries, regions, and time to assess generalization and robustness. Results below
              synthesize our findings across conflict, unrest, and migration applications.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4 text-gray-700 leading-relaxed">
            <p>
              <span className="font-medium">Generalization across contexts:</span> Similar shapes recur across geographies and epochs. Training on one
              set of countries, regions, or decades retains accuracy when tested on others, indicating that patterns are not
              tied to a specific country or era.
            </p>
            <p>
              <span className="font-medium">Autoregressive strength:</span> Purely autoregressive, shape‑based forecasts (no covariates) perform comparably to
              covariate‑rich variants at short horizons, offering a simple, transparent baseline that travels well.
            </p>
            <p>
              <span className="font-medium">Explaining variation:</span> The approach excels at capturing the timing and magnitude of surges and lulls — explaining
              a large share of observed variation out of sample, with well‑calibrated uncertainty.
            </p>
            <p>
              <span className="font-medium">Subnational fidelity:</span> At grid level, diffusion and hotspot dynamics are recovered, improving early warnings and
              resource allocation compared to country‑only models.
            </p>
          </div>
        </div>
      </section>

      {/* Q&A */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 id="faq" className="text-2xl font-light text-gray-900 mb-6">Questions & Answers</h3>
          <div className="space-y-8">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Are the patterns specific to a country, region, or epoch?</h4>
              <p className="text-gray-700 mt-2">
                No. We explicitly test out‑of‑country, out‑of‑region, and out‑of‑period generalization and find that core
                shapes recur across contexts. Because alignment handles speed differences, the model recognizes the same
                dynamics when they unfold faster or slower, or in different decades. See our
                {' '}<a href="/academicPapers/working-papers/predictability-29.pdf" target="_blank" rel="noopener noreferrer" className="text-link">Predictability working paper</a>.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900">Do you make subnational predictions?</h4>
              <p className="text-gray-700 mt-2">
                Yes. We produce PRIO‑GRID (0.5°) forecasts alongside country‑level outputs. The grid approach captures
                local persistence and spillovers, and is visualized via 3D space–time shapes and diffusion animations.
                See the 3D shapes working paper in our{' '}
                <a href="/publications#working-papers" className="text-link">Working Papers</a>.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900">How does the autoregressive baseline compare?</h4>
              <p className="text-gray-700 mt-2">
                For short horizons, a purely autoregressive, shape‑matching approach performs on par with covariate‑augmented
                versions. This makes the baseline attractive when exogenous data are delayed or noisy, and provides a strong,
                transparent reference for practitioners. See
                {' '}<a href="https://doi.org/10.1140/epjds/s13688-025-00599-x" target="_blank" rel="noopener noreferrer" className="text-link">EPJ Data Science</a>
                {' '}and the
                {' '}<a href="https://journals.sagepub.com/doi/10.1177/00223433251330790" target="_blank" rel="noopener noreferrer" className="text-link">Journal of Peace Research paper on accounting for variability</a>.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900">What do we explain particularly well?</h4>
              <p className="text-gray-700 mt-2">
                Variation over time — especially the onset, escalation, and decay of episodes. By borrowing futures from
                the closest analogs, the model captures bursts and plateaus that standard linear baselines often smooth out.
                See our{' '}
                <a href="https://journals.sagepub.com/doi/10.1177/00223433251330790" target="_blank" rel="noopener noreferrer" className="text-link">Journal of Peace Research paper on accounting for variability</a>.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900">Is this causal or predictive?</h4>
              <p className="text-gray-700 mt-2">
                Predictive. We focus on anticipating outcomes given current trajectories and historical regularities.
                That said, the analog set provides interpretable <em>narratives</em> — “this looks like these past episodes” — that
                support diagnostic and scenario discussions.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900">How do you quantify uncertainty?</h4>
              <p className="text-gray-700 mt-2">
                We form a similarity‑weighted mixture of futures from the top historical analogs.
                Concretely: (1) select the K nearest analog windows by DTW (or related) distance; (2) assign
                weights w proportional to a decaying kernel of the distance or rank; (3) for each horizon h,
                collect the realized outcomes from those analogs and treat the predictive distribution as the
                empirical mixture <span className="font-mono">p<sub>h</sub>(y) = ∑<sub>k</sub> w<sub>k</sub> · δ(y − y<sub>k,h</sub>)</span>. From this distribution we compute point
                forecasts (mean/median), prediction intervals (50/80/95%), similarity‑weighted quantiles, and
                exceedance probabilities (e.g., P[y ≥ threshold]).
              </p>
              <p className="text-gray-700 mt-2">
                Calibration is checked with rolling backtests: coverage of nominal bands, sharpness vs. calibration,
                probability integral transform (PIT) diagnostics, and CRPS. When needed, we apply simple post‑hoc
                recalibration (e.g., quantile adjustment using rolling residuals) so reported 50/80/95% intervals
                achieve their intended coverage out‑of‑sample. For count outcomes, we keep distributions discrete
                (empirical mixture) and optionally report smoothed summaries. In maps and dashboards we also expose
                exceedance risk surfaces and scenario draws to communicate tail risk.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900">What horizons do you support?</h4>
              <p className="text-gray-700 mt-2">
                Commonly 1–6 months, but the same design extends to weekly or quarterly horizons. We choose horizons based on
                stakeholder needs and data refresh cycles.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900">Does this work beyond conflict fatalities?</h4>
              <p className="text-gray-700 mt-2">
                Yes. We use similar shape‑based methods for protest intensity and migration flows. The approach is generic to
                time‑series with recurring motifs and regime shifts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Practical notes */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-4">Operational Considerations</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><span className="font-medium">Speed and availability:</span> Minutes end‑to‑end; runs with or without covariates.</li>
            <li><span className="font-medium">Transparency:</span> Forecaster can cite the exact analog episodes behind each prediction.</li>
            <li><span className="font-medium">Monitoring:</span> Rolling backtests, calibration checks, and drift diagnostics.</li>
            <li><span className="font-medium">Ethics & safeguards:</span> Human review, clear uncertainty communication, and context‑aware use.</li>
          </ul>
        </div>
      </section>
    </>
  )
}
