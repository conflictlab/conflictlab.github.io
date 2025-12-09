import type { Metadata } from 'next'
import Image from 'next/image'
import MethodologyFlowchart from '@/components/MethodologyFlowchart'
import PrioGridAnimation from '@/components/PrioGridAnimation'
import DTWTrajShowcase from '@/components/DTWTrajShowcase'

export const metadata: Metadata = {
  title: 'Methodology — PaCE',
  description: 'Detailed, transparent description of PaCE’s forecasting methodology with animations and Q&A.',
}

export default function MethodologyPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-14 pb-10 md:pt-16 md:pb-12 hero-background-network-image">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 leading-tight">Methodology</h1>
          <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed max-w-3xl">
            How we forecast geopolitical conflict, civil unrest, and migration.
          </p>
          <div className="mt-3 text-sm text-gray-700 flex items-center gap-3">
            <a href="#faq" className="text-pace-red hover:text-pace-red-dark">Jump to FAQ ↴</a>
            <span className="text-gray-300">·</span>
            <a href="/faq" className="text-link">Full FAQ</a>
          </div>
        </div>
      </section>

      {/* Data */}
      <section id="data" className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-4">Data</h3>
          <div className="text-gray-700 leading-relaxed space-y-3 max-w-4xl">
            <p>
              Our primary outcome is the monthly number of conflict fatalities. We use the UCDP Georeferenced Event Dataset
              ("best" estimates), aggregated to country–month and PRIO‑GRID (0.5°) cell–month units, 1989–present.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><span className="font-medium">Processing:</span> standard cleaning, harmonization, and aggregation to consistent spatial units and monthly periods.</li>
              <li><span className="font-medium">Refresh cadence:</span> updated as source data refresh; forecasts regenerate on new snapshots.</li>
              <li><span className="font-medium">Optional covariates:</span> population and accessibility, climate anomalies, night‑lights, governance and economic indicators, and spatial lags.</li>
            </ul>
            <p className="text-sm text-gray-600">
              Country‑level and grid‑level datasets are available on the <a href="/downloads" className="text-link">Downloads</a> page.
            </p>
          </div>
        </div>
      </section>

      {/* Design principles */}
      <section id="principles" className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-4">Design Principles</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><span className="font-medium">Transparent by construction:</span> forecasts backed by explicit historical analogs you can inspect.</li>
            <li><span className="font-medium">Short‑horizon strength:</span> prioritize near‑term accuracy where policy relevance is highest.</li>
            <li><span className="font-medium">Data‑lean defaults:</span> equal‑weight analogs with purely autoregressive inputs; covariates optional.</li>
            <li><span className="font-medium">Spatiotemporal fidelity:</span> handle differing speeds (DTW) and subnational diffusion (PRIO‑GRID).</li>
            <li><span className="font-medium">Calibrated uncertainty:</span> empirical bands and exceedances derived from matched futures.</li>
          </ul>
        </div>
      </section>

      {/* Executive Summary + On‑page nav */}
      <section id="summary" className="pt-6 pb-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-2">Executive Summary</h2>
              <p className="text-gray-700 leading-relaxed">
                We forecast conflict fatalities (1–6 month horizons) using shape‑based analog forecasting: find recent
                trajectories that resemble the present (via DTW), borrow their realized futures, and aggregate those
                futures into point forecasts and calibrated intervals. The same approach extends to subnational PRIO‑GRID
                (0.5°) for diffusion and hotspots.
              </p>
              <div className="mt-3 text-sm text-gray-700">
                <span className="mr-2">Key results:</span>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Short‑horizon forecasts perform on par with covariate‑rich variants.</li>
                  <li>Patterns generalize across countries, regions, and epochs.</li>
                  <li>Subnational diffusion captured via PRIO‑GRID with neighborhood exposure.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core algorithm (moved up) */}
      <section id="algorithm" className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-light text-gray-900">Core Algorithm</h3>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">End‑to‑end flow and the analog forecast recipe.</p>
          </div>
          <div className="mb-8"><MethodologyFlowchart /></div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Window the recent trajectory (normalize as needed).</li>
                <li>Measure similarity with DTW; select the K nearest historical windows.</li>
                <li>Borrow futures: take the subsequent outcomes for each match at horizons 1–6 months.</li>
                <li>Aggregate: average (centroid) across matched futures for the point forecast.</li>
                <li>Uncertainty: the matched futures form an empirical distribution for intervals and exceedances.</li>
              </ol>
              <p>
                Predictive mixture (equal weights):
                <span className="font-mono"> p<sub>h</sub>(y) = (1/K) · ∑<sub>k=1..K</sub> δ(y − y<sub>k,h</sub>)</span>
              </p>
            </div>
            <div className="grid gap-4">
              <Image src="/academicPapers/methods/Figs/method1.png" alt="Analog matching step" width={1000} height={700} className="rounded-lg border border-gray-200 w-full h-auto" />
              <Image src="/academicPapers/methods/Figs/method2.png" alt="Forecast aggregation step" width={1000} height={700} className="rounded-lg border border-gray-200 w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Why shape‑based analog forecasting */}
      <section id="why-analog" className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h3 className="text-3xl font-light text-gray-900 mb-3">Why Shape‑Based Analog Forecasting</h3>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              We treat each evolving trajectory (country or grid cell) as a <em>shape in time</em> and search the historical
              record for similar shapes. Those closest historical analogs provide plausible futures that we aggregate
              into a forecast with uncertainty.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4 text-gray-700 leading-relaxed mb-8">
            <p>
              Concretely, given a recent window of outcomes, we use dynamic time warping (DTW) to align sequences at different
              speeds and identify nearest analogs in the archive. We then follow each analog forward to obtain a set of
              candidate futures. Averaging these futures yields a strong, transparent short‑horizon forecast; the spread gives
              intervals and exceedances.
            </p>
            <p className="text-sm text-gray-600">
              See <a href="https://doi.org/10.1140/epjds/s13688-025-00599-x" target="_blank" rel="noopener noreferrer" className="text-link">EPJ Data Science</a>
              {' '}and the{' '}
              <a href="https://journals.sagepub.com/doi/10.1177/00223433251330790" target="_blank" rel="noopener noreferrer" className="text-link">JPR paper on variability</a>.
            </p>
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
          <h3 className="text-2xl font-light text-gray-900 mb-4">How alignment works (DTW)</h3>
          <p className="text-gray-700 max-w-3xl mb-6">
            Similar dynamics can unfold at different speeds. DTW aligns sequences to reveal common structure even when
            one pattern accelerates or lags relative to another.
          </p>
          <DTWTrajShowcase />
        </div>
      </section>

      {/* Subnational dynamics and diffusion */}
      <section id="subnational" className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="text-3xl font-light text-gray-900 mb-3">Subnational Dynamics and Diffusion</h3>
            <p className="text-lg text-gray-600 font-light max-w-3xl">
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
          <p className="text-sm text-gray-600 mt-3 max-w-3xl">
            Space–time trajectories represented as 3D shapes (latitude, longitude, time). Similar shapes indicate comparable
            dynamics even when they occur in different countries or decades.
          </p>
        </div>
      </section>

      {/* Evidence & results */}
      <section id="evidence" className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="text-3xl font-light text-gray-900 mb-3">Evidence & Results</h3>
            <p className="text-lg text-gray-600 font-light max-w-3xl">Out‑of‑sample tests across space and time, plus cross‑domain applications.</p>
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
              variability that standard linear models often smooth.
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
                Following the papers, we take the <span className="font-medium">K</span> most similar historical windows (via DTW shape matching).
                For each forecast horizon <span className="font-mono">h</span>, we use the matched windows’ subsequent outcomes to form an
                empirical predictive distribution, and we take the <span className="font-medium">average (centroid)</span> of those futures as the
                point forecast. Equivalently, with equal weights <span className="font-mono">1/K</span>, the mixture is
                <span className="font-mono"> p<sub>h</sub>(y) = (1/K) · ∑<sub>k=1..K</sub> δ(y − y<sub>k,h</sub>)</span>.
                From this distribution we report prediction intervals (e.g., 50/80/95%) and exceedance probabilities.
              </p>
              <p className="text-gray-700 mt-2">
                We evaluate forecasts out‑of‑sample against baseline models and monitor interval coverage. In deployment,
                we may optionally apply similarity weighting and distributional diagnostics (e.g., PIT/CRPS) for ongoing
                calibration monitoring.
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

      {/* Limitations & responsible use */}
      <section id="limits" className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-4">Limitations & Responsible Use</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><span className="font-medium">Novelty risk:</span> Rare, unprecedented dynamics may lack close analogs, degrading accuracy.</li>
            <li><span className="font-medium">Data latency/quality:</span> Forecasts reflect input lags and reporting noise; intervals communicate uncertainty.</li>
            <li><span className="font-medium">Predictive, not causal:</span> Explanations are analog‑based narratives, not causal attributions.</li>
            <li><span className="font-medium">Safeguards:</span> Human review, uncertainty communication, and context‑aware application are required.</li>
          </ul>
        </div>
      </section>

      {/* How to use */}
      <section id="usage" className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-4">How To Use Our Forecasts</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Use median and 50/80/95% bands for planning; monitor exceedance risks for tail events.</li>
            <li>Combine country and PRIO‑GRID views to align strategic and operational decisions.</li>
            <li>Use analog matches to communicate context: “this resembles episodes X, Y, Z”.</li>
            <li>Download data for portfolio‑level analysis and integration.</li>
          </ul>
          <div className="mt-3 text-sm">
            <a href="/forecasts" className="text-link">Live forecasts</a>
            <span className="mx-1 text-gray-300">·</span>
            <a href="/downloads" className="text-link">Downloads</a>
          </div>
        </div>
      </section>

      {/* References & versioning */}
      <section id="refs" className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-4">References & Versioning</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><a href="https://doi.org/10.1140/epjds/s13688-025-00599-x" target="_blank" rel="noopener noreferrer" className="text-link">EPJ Data Science: Endogenous conflict and the limits of predictive optimization</a></li>
            <li><a href="https://journals.sagepub.com/doi/10.1177/00223433251330790" target="_blank" rel="noopener noreferrer" className="text-link">Journal of Peace Research: Accounting for variability in conflict dynamics</a></li>
            <li><a href="/academicPapers/working-papers/predictability-29.pdf" target="_blank" rel="noopener noreferrer" className="text-link">Working paper: Predictability of Conflict Patterns</a></li>
            <li><a href="/publications#working-papers" className="text-link">Working paper: 3D spatiotemporal shapes (subnational forecasting)</a></li>
            <li><a href="/publications" className="text-link">All publications</a></li>
          </ul>
        </div>
      </section>
    </>
  )
}

