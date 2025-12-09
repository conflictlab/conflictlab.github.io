import type { Metadata } from 'next'
import Image from 'next/image'
import MethodologyFlowchart from '@/components/MethodologyFlowchart'
import PrioGridAnimation from '@/components/PrioGridAnimation'
import DTWTrajShowcase from '@/components/DTWTrajShowcase'

export const metadata: Metadata = {
  title: 'Methodology (Structured Draft) — PaCE',
  description: 'Concise, academic-style presentation of PaCE’s methodology with figures and references.',
}

export default function MethodologyStructuredDraftPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-14 pb-8 md:pt-16 md:pb-10 hero-background-network-image">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2 leading-tight">Methodology (Structured Draft)</h1>
          <p className="text-gray-600 md:text-lg font-light max-w-3xl">A compact, academically structured overview of data, methods, uncertainty, subnational modeling, validation, and limitations.</p>
        </div>
      </section>

      {/* Body with ToC */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1fr_280px] gap-8">
          {/* Main content */}
          <article className="space-y-10 text-gray-800 leading-relaxed">
            {/* Overview */}
            <section id="overview">
              <h2 className="text-2xl font-light text-gray-900 mb-2">Overview</h2>
              <p>
                We forecast conflict fatalities at 1–6 month horizons using shape‑based analog forecasting: we identify historical
                trajectories that resemble the present (via dynamic time warping, DTW), propagate them forward to retrieve their
                realized futures, and average those futures to produce point forecasts with calibrated uncertainty. The same design
                extends to subnational PRIO‑GRID (0.5°) for diffusion and hotspots.
              </p>
            </section>

            {/* Data */}
            <section id="data">
              <h2 className="text-2xl font-light text-gray-900 mb-2">Data</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><span className="font-medium">Outcome:</span> Monthly conflict fatalities from UCDP GED ("best" estimates), aggregated to country‑month and PRIO‑GRID cell‑month, 1989–present.</li>
                <li><span className="font-medium">Processing:</span> Cleaning, harmonization, and aggregation to consistent spatial units and monthly periods.</li>
                <li><span className="font-medium">Refresh:</span> Forecasts update when source data refresh.</li>
                <li><span className="font-medium">Optional covariates:</span> Population & access, climate anomalies, night‑lights, governance, economy, and spatial lags.</li>
              </ul>
            </section>

            {/* Methods */}
            <section id="methods">
              <h2 className="text-2xl font-light text-gray-900 mb-2">Methods</h2>
              <p className="mb-3">
                Given a recent window of outcomes for a country or grid cell, we measure similarity to all historical windows using
                dynamic time warping (DTW), which aligns sequences that evolve at different speeds. We then select the K nearest
                analog windows and follow each one forward in time to obtain its realized outcomes at horizons h = 1…6 months.
                These horizon‑specific sets of analog outcomes constitute an empirical predictive distribution from which we derive
                point forecasts (centroids) and uncertainty summaries (medians, 50/80/95% intervals, exceedance risks).
              </p>
              <p className="mb-4">
                When covariates are available (e.g., demography, access, climate, economy), they can be incorporated into the
                similarity search, but purely autoregressive matching performs competitively at short horizons. Calibration is
                monitored via coverage, PIT histograms, and CRPS, with optional similarity weighting as a deployment refinement.
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Window the recent trajectory (normalize as appropriate).</li>
                <li>Measure similarity with DTW; select the K nearest historical windows.</li>
                <li>Propagate each matched window forward to collect outcomes for horizons h = 1..6 months.</li>
                <li>Aggregate across matched futures (centroid) for the point forecast.</li>
                <li>Use the set of matched futures as an empirical distribution for uncertainty.</li>
              </ol>
              <div className="my-6">
                <figure className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="mb-4"><MethodologyFlowchart /></div>
                  <figcaption className="text-sm text-gray-600">Figure 1. Workflow: (i) similarity search via DTW; (ii) collect analog futures; (iii) aggregate and derive uncertainty.</figcaption>
                </figure>
              </div>

              <div className="my-6">
                <h3 className="text-xl font-light text-gray-900 mb-2">Alignment Intuition</h3>
                <p className="mb-4">DTW aligns sequences unfolding at different speeds to expose common structure.</p>
                <DTWTrajShowcase />
              </div>
            </section>

            {/* Uncertainty */}
            <section id="uncertainty">
              <h2 className="text-2xl font-light text-gray-900 mb-2">Uncertainty</h2>
              <p>
                For each horizon h, the matched futures define an empirical predictive mixture. With equal weights 1/K,
                we report medians, 50/80/95% intervals, and exceedance probabilities. Calibration is monitored via coverage,
                PIT, and CRPS.
              </p>
            </section>

            {/* Subnational */}
            <section id="subnational">
              <h2 className="text-2xl font-light text-gray-900 mb-2">Subnational Modeling</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><span className="font-medium">Units:</span> PRIO‑GRID 0.5° cell‑months with local lag history.</li>
                <li><span className="font-medium">Neighborhood exposure:</span> Distance‑decayed activity within 1–3 cells, optionally weighted by roads/travel time.</li>
                <li><span className="font-medium">Front dynamics:</span> Distance to most recent events; advancing vs receding fronts.</li>
                <li><span className="font-medium">Grid‑level analogs:</span> Match cell‑windows on local+neighbor patterns; use their subsequent outcomes to form a predictive mixture.</li>
              </ul>
              <div className="my-6">
                <figure className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="mb-4"><PrioGridAnimation /></div>
                  <figcaption className="text-sm text-gray-600">Figure 2. Diffusion and hotspot formation across PRIO‑GRID cells.</figcaption>
                </figure>
              </div>
              <div className="relative w-full max-w-4xl">
                <figure>
                  <Image src="/academicPapers/methods/Figs/3dShapes.jpg" alt="3D space–time shapes" width={1400} height={900} className="rounded-lg border border-gray-200 w-full h-auto" />
                  <figcaption className="text-sm text-gray-600 mt-2">Figure 3. Space–time trajectories as 3D shapes; similar shapes indicate comparable diffusion paths.</figcaption>
                </figure>
              </div>
            </section>

            {/* Validation */}
            <section id="validation">
              <h2 className="text-2xl font-light text-gray-900 mb-2">Validation</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><span className="font-medium">Generalization:</span> Patterns recur across geographies and epochs; models retain accuracy out‑of‑country/region/period.</li>
                <li><span className="font-medium">Short‑horizon strength:</span> Purely autoregressive shape‑matching performs on par with covariate‑rich variants.</li>
                <li><span className="font-medium">Explaining variation:</span> Captures timing/magnitude of surges and lulls that linear baselines smooth.</li>
              </ul>
            </section>

            {/* Limitations */}
            <section id="limitations">
              <h2 className="text-2xl font-light text-gray-900 mb-2">Limitations</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Novelty risk when dynamics lack historical analogs.</li>
                <li>Data latency/quality effects propagate into forecasts.</li>
                <li>Predictive, not causal; analog narratives support interpretation but not attribution.</li>
              </ul>
            </section>

            {/* References */}
            <section id="references">
              <h2 className="text-2xl font-light text-gray-900 mb-2">References</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><a href="https://doi.org/10.1140/epjds/s13688-025-00599-x" target="_blank" rel="noopener noreferrer" className="text-link">EPJ Data Science</a></li>
                <li><a href="https://journals.sagepub.com/doi/10.1177/00223433251330790" target="_blank" rel="noopener noreferrer" className="text-link">Journal of Peace Research</a></li>
                <li><a href="/academicPapers/working-papers/predictability-29.pdf" target="_blank" rel="noopener noreferrer" className="text-link">Predictability working paper</a></li>
              </ul>
            </section>

            {/* Appendix / Links */}
            <section id="appendix">
              <h2 className="text-2xl font-light text-gray-900 mb-2">Appendix</h2>
              <p className="text-sm text-gray-700">For additional Q&A, see the <a href="/faq" className="text-link">FAQ</a>.</p>
            </section>
          </article>

          {/* ToC */}
          <aside className="hidden md:block">
            <nav className="sticky top-20 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <div className="text-gray-900 font-medium mb-2">Contents</div>
              <ul className="space-y-2 text-gray-700">
                <li><a className="text-link" href="#overview">Overview</a></li>
                <li><a className="text-link" href="#data">Data</a></li>
                <li><a className="text-link" href="#methods">Methods</a></li>
                <li><a className="text-link" href="#uncertainty">Uncertainty</a></li>
                <li><a className="text-link" href="#subnational">Subnational</a></li>
                <li><a className="text-link" href="#validation">Validation</a></li>
                <li><a className="text-link" href="#limitations">Limitations</a></li>
                <li><a className="text-link" href="#references">References</a></li>
                <li><a className="text-link" href="#appendix">Appendix</a></li>
              </ul>
            </nav>
          </aside>
        </div>
      </section>
    </>
  )
}
