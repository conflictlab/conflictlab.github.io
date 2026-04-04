# Website Improvements for Systematic Data Access

## Current State Assessment

### ✅ What's Already Good
1. **Data API page** (`/data-api`) - Comprehensive with examples
2. **Stable URLs** - Predictable patterns for latest and archive
3. **Archive table** - Interactive access to historical forecasts
4. **Code examples** - Python, R, JavaScript, curl
5. **Grid downloads** - Bulk download options for spatial data
6. **Metadata JSON** - Programmatic period detection

### ⚠️ Gaps for Operational Users
1. No prominent "For Developers" or "API Documentation" link in navigation
2. Documentation files (DATA_API.md, QUICK_START.md) not exposed on website
3. No validation/health endpoint mentioned
4. No changelog/updates feed
5. Example scripts (Python/R) not downloadable from site
6. No quick "copy-paste" code snippets on homepage

---

## Recommended Improvements

### Priority 1: High-Impact, Low-Effort

#### 1.1 Add "API" or "Data Access" to Main Navigation
**Current:** Downloads → redirects to `/data-api#grid`
**Proposed:**
```typescript
{
  label: 'Forecasts',
  href: '/forecasts',
  sections: [
    { label: 'Dashboard', href: '/forecasts' },
    { label: 'Reports & Newsletters', href: '/reports' },
    { label: 'Data API', href: '/data-api' },  // ← Make this explicit
    { label: 'Downloads', href: '/data-api#grid-downloads' },
  ],
}
```

**Impact:** Makes programmatic access discoverable
**Effort:** 5 minutes (edit Navigation.tsx)

#### 1.2 Add Quick Start Banner on Homepage
Add a prominent call-to-action for API users:

```tsx
// Add to app/page.tsx after hero
<section className="py-12 bg-blue-50 border-y border-blue-100">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Need programmatic access?
        </h3>
        <p className="text-sm text-gray-600">
          Fetch forecasts and historical data via our API
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/data-api"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View API Docs
        </Link>
        <Link
          href="/data-api#examples"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          Code Examples
        </Link>
      </div>
    </div>
  </div>
</section>
```

**Impact:** Surfaces API to homepage visitors
**Effort:** 15 minutes

#### 1.3 Add Documentation Section to Data API Page
Add a new section linking to the docs:

```tsx
// Add to app/data-api/page.tsx after the hero
<div id="documentation" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
  <h2 className="text-2xl font-light text-gray-900 mb-4">Documentation</h2>
  <p className="text-sm text-gray-600 mb-4">
    Comprehensive guides for integrating PACE data into your systems.
  </p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <a
      href="https://github.com/conflictlab/conflictlab.github.io/blob/main/docs/DATA_API.md"
      target="_blank"
      className="border border-gray-200 rounded p-4 hover:bg-gray-50"
    >
      <h3 className="font-medium text-gray-900 mb-1">Complete API Reference</h3>
      <p className="text-sm text-gray-600 mb-2">
        Full specification with URL patterns, formats, and integration patterns
      </p>
      <span className="text-xs text-blue-600">View on GitHub →</span>
    </a>
    <a
      href="https://github.com/conflictlab/conflictlab.github.io/blob/main/docs/QUICK_START.md"
      target="_blank"
      className="border border-gray-200 rounded p-4 hover:bg-gray-50"
    >
      <h3 className="font-medium text-gray-900 mb-1">Quick Start Guide</h3>
      <p className="text-sm text-gray-600 mb-2">
        5-minute introduction with simple Python and R examples
      </p>
      <span className="text-xs text-blue-600">View on GitHub →</span>
    </a>
  </div>

  <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-4">
    <h4 className="text-sm font-medium text-gray-900 mb-2">Example Scripts</h4>
    <div className="flex gap-3">
      <a
        href="https://github.com/conflictlab/conflictlab.github.io/blob/main/examples/fetch-forecasts.py"
        target="_blank"
        className="text-sm text-blue-600 hover:underline"
      >
        Python Client →
      </a>
      <a
        href="https://github.com/conflictlab/conflictlab.github.io/blob/main/examples/fetch-forecasts.R"
        target="_blank"
        className="text-sm text-blue-600 hover:underline"
      >
        R Client →
      </a>
    </div>
  </div>
</div>
```

**Impact:** Users discover comprehensive docs
**Effort:** 20 minutes

#### 1.4 Add "Copy" Buttons to Code Examples
Make code snippets easily copyable:

```tsx
// Create components/CodeBlock.tsx
'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CodeBlock({ code, language }: { code: string, language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300"
        title="Copy to clipboard"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  )
}
```

**Impact:** Reduces friction for copy-paste usage
**Effort:** 30 minutes (component + integration)

---

### Priority 2: Medium-Impact Improvements

#### 2.1 Add Data Status/Health Endpoint Page
Create `/app/api-status/page.tsx`:

```tsx
// Show real-time data health
export default async function ApiStatusPage() {
  const status = await fetch('https://forecastlab.org/status.json').then(r => r.json())

  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-light mb-6">API Status</h1>

        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            {status.ok ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="font-medium text-gray-900">All Systems Operational</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="font-medium text-gray-900">Degraded Service</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Latest Period</div>
              <div className="font-mono font-medium">{status.summary.latestPeriod}</div>
            </div>
            <div>
              <div className="text-gray-600">Last Update</div>
              <div className="font-mono font-medium">{status.summary.snapshotGeneratedAt}</div>
            </div>
            <div>
              <div className="text-gray-600">Countries</div>
              <div className="font-mono font-medium">{status.summary.minmaxCountries}</div>
            </div>
            <div>
              <div className="text-gray-600">Data Age</div>
              <div className="font-mono font-medium">{status.summary.snapshotAgeDays} days</div>
            </div>
          </div>
        </div>

        {status.warnings.length > 0 && (
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Warnings</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {status.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
```

**Impact:** Shows data freshness and quality
**Effort:** 1 hour

#### 2.2 Add Changelog/Updates Page
Create `/app/changelog/page.tsx` to show:
- Monthly forecast updates
- Data quality improvements
- API changes
- New features

Source from:
- Git commits with specific tags
- `/public/status.json` historical changes
- Manual changelog file

**Impact:** Users know when to refetch data
**Effort:** 2 hours

#### 2.3 Add RSS Feed for Updates
Create `/public/rss.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>PACE Forecast Updates</title>
    <link>https://forecastlab.org</link>
    <description>Monthly conflict fatality forecast updates</description>
    <item>
      <title>March 2026 Forecasts Released</title>
      <link>https://forecastlab.org/data/forecasts/archive/2026-03</link>
      <pubDate>Wed, 01 Mar 2026 03:00:00 GMT</pubDate>
      <description>6-month and 12-month forecasts for 132 countries</description>
    </item>
  </channel>
</rss>
```

**Impact:** Automated monitoring for partners
**Effort:** 2 hours (+ automation)

#### 2.4 Improve Metadata Exposure
Add `/api/v1/catalog.json`:

```json
{
  "version": "1.0",
  "latest_period": "2026-03",
  "available_periods": ["2023-12", "2024-01", ..., "2026-03"],
  "endpoints": {
    "latest_forecasts": "/data/forecasts/latest/forecasts_h12.csv",
    "latest_historical": "/data/forecasts/latest/Hist.csv",
    "latest_metadata": "/data/forecasts/latest/metadata.json",
    "archive": "/data/forecasts/archive/{period}/",
    "grid": "/api/v1/grid/{period}/points-m{month}.json",
    "status": "/status.json"
  },
  "update_schedule": "Monthly on 1st at 01:00 UTC",
  "documentation": {
    "api_reference": "https://github.com/conflictlab/conflictlab.github.io/blob/main/docs/DATA_API.md",
    "quick_start": "https://github.com/conflictlab/conflictlab.github.io/blob/main/docs/QUICK_START.md"
  }
}
```

**Impact:** Machine-readable service discovery
**Effort:** 1 hour

---

### Priority 3: Future Expansion

#### 3.1 Expose Scenario Forecasts
Currently computed but not exposed (`dict_sce.pkl`):

```
/data/scenarios/{period}/
  ├── escalation.json     # High-intensity scenarios
  ├── status_quo.json     # Mid-range scenarios
  └── de_escalation.json  # Low-intensity scenarios
```

**Impact:** Enables risk assessment use cases
**Effort:** 4 hours (extraction + API)

#### 3.2 Country-Specific Endpoints
Create cleaner per-country access:

```
/api/v1/countries/Ukraine.json
/api/v1/countries/Syria.json
```

Returns:
```json
{
  "country": "Ukraine",
  "latest_period": "2026-03",
  "forecasts_h12": [5944, 11590, 9723, ...],
  "forecasts_h12_min": [2315, 5123, ...],
  "forecasts_h12_max": [9573, 18057, ...],
  "historical": {
    "last_12_months": [7436, 8463, 10117, ...],
    "all_time": "/data/forecasts/latest/Hist.csv"
  },
  "metadata": {...}
}
```

**Impact:** Simplified single-country access
**Effort:** 3 hours

#### 3.3 Webhook/Notification System
Allow users to register for updates:

```tsx
// /app/subscribe/page.tsx
<form>
  <input type="email" placeholder="your@email.com" />
  <select>
    <option>New forecasts released</option>
    <option>Data quality issues</option>
    <option>API changes</option>
  </select>
  <button>Subscribe</button>
</form>
```

**Impact:** Proactive notifications
**Effort:** 6 hours (+ backend)

#### 3.4 Interactive API Explorer
Add a playground to test API calls:

```tsx
// /app/api-explorer/page.tsx
<div>
  <select>
    <option>GET /data/forecasts/latest/forecasts_h12.csv</option>
    <option>GET /api/v1/grid/2026-03/points-m1.json</option>
  </select>
  <button>Try it</button>
  <pre>{/* Response preview */}</pre>
  <button>Copy as Python</button>
  <button>Copy as R</button>
  <button>Copy as curl</button>
</div>
```

**Impact:** Interactive learning
**Effort:** 8 hours

---

## Implementation Roadmap

### Week 1: Quick Wins
- [ ] Add "Data API" to navigation (5 min)
- [ ] Add API banner to homepage (15 min)
- [ ] Add copy buttons to code examples (30 min)
- [ ] Add documentation section to /data-api (20 min)
- [ ] Test all changes

**Total effort:** ~2 hours
**Impact:** High visibility, low effort

### Week 2: Status & Monitoring
- [ ] Create API status page (1 hour)
- [ ] Add catalog.json endpoint (1 hour)
- [ ] Create changelog page (2 hours)
- [ ] Add RSS feed (2 hours)

**Total effort:** ~6 hours
**Impact:** Better monitoring for partners

### Month 2: Advanced Features
- [ ] Expose scenario forecasts (4 hours)
- [ ] Create country-specific endpoints (3 hours)
- [ ] Build interactive API explorer (8 hours)

**Total effort:** ~15 hours
**Impact:** Richer functionality

### Future: Notifications
- [ ] Webhook system (6 hours)
- [ ] Email notifications (4 hours)

**Total effort:** ~10 hours
**Impact:** Automated integrations

---

## Specific Code Changes

### 1. Update Navigation (components/Navigation.tsx)
```diff
  {
    label: 'Forecasts',
    href: '/forecasts',
    sections: [
      { label: 'Dashboard', href: '/forecasts' },
      { label: 'Reports & Newsletters', href: '/reports' },
+     { label: 'Data API', href: '/data-api' },
-     { label: 'Downloads', href: '/downloads' },
+     { label: 'Downloads', href: '/data-api#grid-downloads' },
    ],
  },
```

### 2. Add API Banner to Homepage (app/page.tsx)
After the hero section, add:
```tsx
<ApiAccessBanner />
```

### 3. Create Reusable Components
- `components/CodeBlock.tsx` - Copyable code snippets
- `components/ApiAccessBanner.tsx` - Homepage CTA
- `components/ApiStatus.tsx` - Real-time status widget

---

## Success Metrics

### Adoption
- Track downloads of example scripts
- Monitor traffic to /data-api page
- Count unique IPs accessing CSV endpoints

### Usability
- Measure time-to-first-successful-fetch
- Track code example copy-button clicks
- Survey partner satisfaction

### Reliability
- Monitor status.json health checks
- Track API uptime (should be >99.9%)
- Measure data freshness (should update within 3 hours of 1st)

---

## Summary

**Immediate Actions (this week):**
1. ✅ Add "Data API" to main navigation
2. ✅ Add homepage API banner
3. ✅ Add documentation links to /data-api page
4. ✅ Add copy buttons to code examples

**High Priority (next 2 weeks):**
1. Create API status page
2. Add catalog.json endpoint
3. Create changelog page
4. Generate RSS feed

**Medium Priority (next month):**
1. Expose scenario forecasts
2. Add country-specific endpoints
3. Build API explorer

**Future Enhancements:**
1. Webhook notifications
2. Email subscriptions
3. Expanded metadata

This plan makes the existing excellent infrastructure much more discoverable and usable for operational partners.
