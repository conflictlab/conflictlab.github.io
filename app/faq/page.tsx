import Breadcrumbs from '@/components/Breadcrumbs'
import Link from 'next/link'

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-10 pb-6 md:pt-12 md:pb-8 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 leading-tight">FAQ</h1>
          <p className="text-lg text-gray-600 font-light leading-relaxed max-w-3xl">
            Quick answers to common questions about our methods, forecasts, and data.
          </p>
          <div className="mt-3 text-sm text-gray-700 flex flex-wrap gap-3">
            <Link href="/methodology" className="text-link">Methodology</Link>
            <span className="text-gray-300">·</span>
            <Link href="/publications" className="text-link">Publications</Link>
            <span className="text-gray-300">·</span>
            <Link href="/downloads" className="text-link">Downloads</Link>
          </div>
        </div>
      </section>

      {/* FAQ body */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-medium text-gray-900">Are the patterns specific to a country, region, or epoch?</h2>
              <p className="text-gray-700 mt-2">
                No. We test out‑of‑country, out‑of‑region, and out‑of‑period generalization and find that core shapes recur across contexts.
                See our <a href="/academicPapers/working-papers/predictability-29.pdf" target="_blank" rel="noopener noreferrer" className="text-link">Predictability working paper</a>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-900">Do you make subnational predictions?</h2>
              <p className="text-gray-700 mt-2">
                Yes. We forecast at PRIO‑GRID (0.5°) and country levels. See the 3D shapes working paper in
                {' '}<Link href="/publications#working-papers" className="text-link">Working Papers</Link>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-900">How does the autoregressive baseline compare?</h2>
              <p className="text-gray-700 mt-2">
                At short horizons, purely autoregressive shape‑matching performs on par with covariate‑augmented versions.
                See <a href="https://doi.org/10.1140/epjds/s13688-025-00599-x" target="_blank" rel="noopener noreferrer" className="text-link">EPJ Data Science</a>
                {' '}and the{' '}
                <a href="https://journals.sagepub.com/doi/10.1177/00223433251330790" target="_blank" rel="noopener noreferrer" className="text-link">JPR paper on variability</a>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-900">What do you explain particularly well?</h2>
              <p className="text-gray-700 mt-2">
                Variation over time — especially the onset, escalation, and decay of episodes. By borrowing futures from the closest
                analogs, the model captures bursts and plateaus that standard linear baselines often smooth out. See our
                {' '}<a href="https://journals.sagepub.com/doi/10.1177/00223433251330790" target="_blank" rel="noopener noreferrer" className="text-link">Journal of Peace Research paper on accounting for variability</a>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-900">Is this causal or predictive?</h2>
              <p className="text-gray-700 mt-2">
                Predictive. We focus on anticipating outcomes given current trajectories and historical regularities. The analog set
                provides interpretable narratives — “this looks like these past episodes” — to support diagnostic and scenario discussions.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-900">How do you quantify uncertainty?</h2>
              <p className="text-gray-700 mt-2">
                We construct similarity‑weighted mixtures of analog futures to produce prediction intervals (50/80/95%),
                quantiles, and exceedance risks; calibration is monitored with rolling coverage, PIT, and CRPS.
                Details on the <Link href="/methodology#faq" className="text-link">Methodology</Link> page.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-900">What horizons do you support?</h2>
              <p className="text-gray-700 mt-2">Typically 1–6 months; weekly or quarterly on request.</p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-900">Does this work beyond conflict fatalities?</h2>
              <p className="text-gray-700 mt-2">
                Yes. We use similar shape‑based methods for protest intensity and migration flows. The approach is generic to
                time‑series with recurring motifs and regime shifts.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-900">Can I use the data and forecasts?</h2>
              <p className="text-gray-700 mt-2">
                Yes. See <Link href="/downloads" className="text-link">Downloads</Link> for datasets and formats, and
                {' '}<Link href="/publications" className="text-link">Publications</Link> for citation details.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
