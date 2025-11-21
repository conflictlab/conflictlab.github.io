'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface Scenario {
  index: number
  region: string
  decade: string
  scale: string
}

interface Cluster {
  scenarios: Scenario[]
  count: number
  weight: number
}

interface ScenarioData {
  clusters: Record<string, Cluster>
  temporal: Record<string, Record<string, number>>
}

interface ScenariosChartProps {
  data: ScenarioData
  countryName: string
}

export default function ScenariosChart({ data, countryName }: ScenariosChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [pastSeries, setPastSeries] = useState<Array<{ date: Date; value: number }>>([])
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null)

  // Load historical raw fatalities for the country from hist.csv (wide format)
  useEffect(() => {
    let cancelled = false
    async function loadHist() {
      try {
        const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const res = await fetch(`${base}/data/hist.csv`)
        if (!res.ok) return
        const text = await res.text()
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
        if (!lines.length) return
        const parseDate = d3.utcParse('%Y-%m-%d')
        const split = (line: string) => {
          const out: string[] = []
          let cur = ''
          let inQ = false
          for (let i = 0; i < line.length; i++) {
            const ch = line[i]
            if (inQ) {
              if (ch === '"') {
                if (line[i + 1] === '"') { cur += '"'; i++ } else { inQ = false }
              } else cur += ch
            } else {
              if (ch === ',') { out.push(cur); cur = '' }
              else if (ch === '"') inQ = true
              else cur += ch
            }
          }
          out.push(cur)
          return out
        }
        const header = split(lines[0])
        // First column is date; find country by exact or normalized match
        const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z\s\-']/g,'').trim()
        let colIdx = header.findIndex(h => h === countryName)
        if (colIdx < 0) {
          const target = norm(countryName)
          colIdx = header.findIndex(h => norm(h) === target)
        }
        if (colIdx < 0) return
        const series: Array<{ date: Date; value: number }> = []
        for (let i = 1; i < lines.length; i++) {
          const parts = split(lines[i])
          const dstr = parts[0]
          const v = Number(parts[colIdx])
          if (!dstr) continue
          const dt = parseDate(dstr) || new Date(Date.UTC(Number(dstr.slice(0,4)), Number(dstr.slice(5,7)) - 1, Number(dstr.slice(8,10))))
          if (!Number.isFinite(v)) continue
          series.push({ date: dt, value: v })
        }
        if (!cancelled) setPastSeries(series)
      } catch {}
    }
    loadHist()
    return () => { cancelled = true }
  }, [countryName])

  useEffect(() => {
    if (!svgRef.current || !data.clusters || !data.temporal) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    const margin = { top: 40, right: 250, bottom: 80, left: 80 }
    const width = 900 - margin.left - margin.right
    const height = 500 - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Parse temporal data using UTC to avoid TZ shifts
    const parseDT = d3.utcParse('%Y-%m-%d %H:%M:%S')
    const parseD = d3.utcParse('%Y-%m-%d')
    const dates = Object.keys(data.temporal).sort()
    const parsedDates = dates.map(d => parseDT(d) || parseD(d) || new Date(d))

    // Get all cluster IDs and prepare lines for each
    const clusterIds = Object.keys(data.clusters).sort((a, b) => Number(a) - Number(b))

    // Prepare data for each cluster
    const clusterLines: {
      clusterId: string
      values: { date: Date; value: number }[]
      scenarios: Scenario[]
      weight: number
    }[] = []

    clusterIds.forEach(clusterId => {
      const cluster = data.clusters[clusterId]

      // Skip clusters with less than 5% probability
      if (cluster.weight < 0.05) {
        return
      }

      // Find the temporal data for this cluster
      // The temporal index might be different from cluster ID (e.g., 0.89, 0.11)
      // We need to find which temporal index corresponds to this cluster
      const temporalIndices = Object.keys(data.temporal[dates[0]])

      // For now, map by order (cluster 1 -> first temporal, cluster 2 -> second, etc.)
      const temporalIdx = temporalIndices[clusterIds.indexOf(clusterId)]

      if (temporalIdx) {
        const values = dates.map((date, idx) => ({
          date: parsedDates[idx],
          value: data.temporal[date]?.[temporalIdx] || 0
        }))

        clusterLines.push({
          clusterId,
          values,
          scenarios: cluster.scenarios,
          weight: cluster.weight  // Use the weight from cluster data (probability)
        })
      }
    })

    // Values should already be denormalized at build-time (scenarios.denorm.json).
    // Clamp negatives to 0 for linear scale.
    for (const cl of clusterLines) {
      cl.values = cl.values.map(({ date, value }) => ({ date, value: Math.max(0, Number(value) || 0) }))
    }

    // Determine past values up to and including first future date (for domain and rendering)
    const firstFuture = parsedDates[0]
    const pastVals = pastSeries.filter(p => p.date <= firstFuture)

    // Create scales (include past range on x-axis)
    const xMinDate = pastVals.length ? pastVals[0].date : parsedDates[0]
    const xMaxDate = parsedDates[parsedDates.length - 1]
    const xScale = d3.scaleUtc()
      .domain([xMinDate, xMaxDate])
      .range([0, width])

    // Include past series values in extents
    const allValues = [
      ...clusterLines.flatMap(c => c.values.map(v => v.value)),
      ...pastSeries.map(p => p.value),
    ]
    let maxValue = Math.max(...allValues)
    if (!Number.isFinite(maxValue) || maxValue < 0) maxValue = 1

    // Compute nice upper bound (1, 2, 5 × 10^k) to round up the top axis value
    const niceUpperBound = (x: number) => {
      if (!Number.isFinite(x) || x <= 0) return 1
      const exp = Math.floor(Math.log10(x))
      const base = Math.pow(10, exp)
      const mant = x / base
      const m = mant <= 1 ? 1 : mant <= 2 ? 2 : mant <= 5 ? 5 : 10
      return m * base
    }

    const yMinRaw = 0
    const yMaxRaw = niceUpperBound(maxValue)

    // Linear y-scale with rounded-up max domain
    const yScale = d3.scaleLinear()
      .domain([yMinRaw, yMaxRaw])
      .range([height, 0])
      // do not call .nice() to keep the exact rounded-up max

    // Find the cluster with highest weight
    const maxWeight = Math.max(...clusterLines.map(c => c.weight))
    const maxWeightClusterId = clusterLines.find(c => c.weight === maxWeight)?.clusterId
    const activeSelected = selectedClusterId || maxWeightClusterId || null

    // Color function: red for highest probability, dark grey for others
    const getColor = (clusterId: string) => {
      if (clusterId === maxWeightClusterId) {
        return '#dc2626' // red-600
      }
      return '#4B5563' // gray-600 - consistent dark grey for all non-max clusters
    }

    // Tufte-style: minimize non-data ink — no background gridlines
    // (Keep axes with subtle domain and ticks only.)

    // Add X axis with monthly ticks across full domain (past + future)
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale)
          .tickValues((() => {
            const months = d3.utcMonth.range(d3.utcMonth.floor(xMinDate), d3.utcMonth.ceil(xMaxDate))
            // Convert to end-of-month for labeling/position to match EOM data points
            return months.map(m => d3.utcDay.offset(d3.utcMonth.offset(m, 1), -1))
          })())
          .tickFormat(d => d3.utcFormat('%b %Y')(d as Date))
      )
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', '#6b7280')

    // Section labels: Past (left) and Future (right) — larger, in boxes
    const pastMid = (xScale(xMinDate) + xScale(firstFuture)) / 2
    const futureMid = (xScale(firstFuture) + xScale(xMaxDate)) / 2
    function drawSectionLabel(x: number, text: string) {
      const g = svg.append('g').attr('transform', `translate(${x}, -14)`)
      const t = g.append('text')
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', '700')
        .style('fill', '#ffffff')
        .attr('dy', '0.35em')
        .text(text)
      const bb = (t.node() as SVGTextElement).getBBox()
      g.insert('rect', 'text')
        .attr('x', -bb.width / 2 - 10)
        .attr('y', -bb.height / 2 - 6)
        .attr('width', bb.width + 20)
        .attr('height', bb.height + 12)
        .attr('rx', 6)
        .attr('ry', 6)
        .attr('fill', '#374151')
        .attr('stroke', 'none')
    }
    drawSectionLabel(pastMid, 'Past')
    drawSectionLabel(futureMid, 'Future')

    // Add Y axis (linear)
    const range = yMaxRaw - yMinRaw
    const tickLabelFmt = (v: number) => range < 10 ? d3.format('.1f')(v) : d3.format(',.0f')(v)
    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(0).tickFormat(d => tickLabelFmt(d as number)))
      .selectAll('text')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', '#6b7280')

    // Subtle axis domain and light tick marks (Tufte-inspired)
    svg.selectAll('path.domain')
      .attr('stroke', '#9ca3af')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1)
    svg.selectAll('g.tick line')
      .attr('stroke', '#d1d5db')
      .attr('stroke-opacity', 0.3)
      .attr('x2', 0)

    // Y axis label (pushed further left from axis)
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left - 24)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', '700')
      .style('fill', '#4b5563')
      .text('Predicted Fatalities')

    // Visual defs: gradient for highest-weight cluster
    // No gradient needed; use solid brand color for the main cluster

    // Line generator (no smoothing / straight segments)
    const line = d3.line<{ date: Date; value: number }>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))

    // Tooltip (SVG group)
    const tooltip = svg.append('g')
      .style('display', 'none')

    // Pretty tooltip style with small shadow
    const defs = svg.append('defs')
    const tShadow = defs.append('filter').attr('id', 'tooltip-shadow')
    tShadow.append('feDropShadow')
      .attr('dx', 0.5)
      .attr('dy', 1)
      .attr('stdDeviation', 1)
      .attr('flood-color', '#000')
      .attr('flood-opacity', 0.2)

    const tooltipBg = tooltip.append('rect')
      .attr('fill', 'white')
      .attr('stroke', '#d1d5db')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('filter', 'url(#tooltip-shadow)')

    const tooltipText = tooltip.append('text')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .style('fill', '#111827')

    function showTooltip(x: number, y: number, text: string) {
      tooltip.style('display', null)
      tooltipText.text(text)
      // Measure text to size background
      const bbox = (tooltipText.node() as SVGTextElement).getBBox()
      tooltipBg
        .attr('width', bbox.width + 8)
        .attr('height', bbox.height + 6)
      tooltip
        .attr('transform', `translate(${x + 12}, ${y - 12})`)
      tooltipBg
        .attr('x', -4)
        .attr('y', -bbox.height)
      tooltipText
        .attr('x', 0)
        .attr('y', -4)
    }

    function hideTooltip() {
      tooltip.style('display', 'none')
    }

    // Draw past (actual) series up to and including the first scenario date
    if (pastVals.length) {
      const pastLine = d3.line<{ date: Date; value: number }>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
      svg.append('path')
        .datum(pastVals)
        .attr('fill', 'none')
        .attr('stroke', '#374151')
        .attr('stroke-width', 4)
        .attr('d', pastLine)

      // Add circles for past values with tooltip
      const pastCircles = svg.selectAll('.past-circle')
        .data(pastVals)
        .enter()
        .append('circle')
        .attr('class', 'past-circle')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 4)
        .attr('fill', '#374151')
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .on('mouseover', function(event, d: any) {
          d3.select(this as SVGCircleElement).attr('r', 6)
          const dateFmt = d3.utcFormat('%b %Y')
          const valFmt = (v: number) => (v >= 1000 ? d3.format(',.0f')(v) : d3.format('.2f')(v))
          showTooltip(xScale(d.date), yScale(d.value), `${dateFmt(d.date)} — ${valFmt(d.value)}`)
        })
        .on('mousemove', function(event, d: any) {
          const dateFmt = d3.utcFormat('%b %Y')
          const valFmt = (v: number) => (v >= 1000 ? d3.format(',.0f')(v) : d3.format('.2f')(v))
          showTooltip(xScale(d.date), yScale(d.value), `${dateFmt(d.date)} — ${valFmt(d.value)}`)
        })
        .on('mouseout', function() {
          d3.select(this as SVGCircleElement).attr('r', 4)
          hideTooltip()
        })
    }

    // Add a connector between last past value and first future value (main scenario)
    if (pastVals.length && clusterLines.length) {
      const lastPast = pastVals[pastVals.length - 1]
      const main = clusterLines.find(c => c.clusterId === maxWeightClusterId) || clusterLines[0]
      const firstFuturePt = main.values.find(v => +v.date === +firstFuture) || main.values[0]
      if (firstFuturePt) {
        svg.append('path')
          .attr('d', `M ${xScale(lastPast.date)},${yScale(lastPast.value)} L ${xScale(firstFuture)},${yScale(firstFuturePt.value)}`)
          .attr('fill', 'none')
          .attr('stroke', '#374151')
          .attr('stroke-width', 3)
      }
    }

    // Add lines and circles for each cluster
    clusterLines.forEach((cluster, i) => {
      const isHighest = cluster.clusterId === maxWeightClusterId
      const isSelected = cluster.clusterId === activeSelected
      const color = '#B91C1C' // pace-red for all future lines
      const op = Math.max(0.25, Math.min(1, cluster.weight))

      const path = svg.append('path')
        .datum(cluster.values)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', isHighest ? 6 : 5)
        .attr('stroke-opacity', op)
        .attr('stroke-dasharray', '5,4')
        .attr('d', line)
        .on('mouseover', function() {
          d3.select(this as SVGPathElement).attr('stroke-width', isHighest ? 7 : 6).attr('stroke-opacity', 1)
        })
        .on('mouseout', function() {
          d3.select(this as SVGPathElement).attr('stroke-width', isHighest ? 6 : 5).attr('stroke-opacity', op)
        })
        .on('click', () => setSelectedClusterId(cluster.clusterId))

      // Add circles at data points
      const circles = svg.selectAll(`.circle-${i}`)
        .data(cluster.values)
        .enter()
        .append('circle')
        .attr('class', `circle-${i}`)
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', isHighest ? 6 : 5)
        .attr('fill', '#B91C1C')
        .attr('fill-opacity', Math.min(1, op + 0.15))
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', isHighest ? 1 : 0.8)
        .on('mouseover', function(event, d: any) {
          d3.select(this as SVGCircleElement).attr('r', isHighest ? 7 : 6).attr('fill-opacity', 1).attr('stroke-opacity', 1)
          const dateFmt = d3.utcFormat('%b %Y')
          const valFmt = (v: number) => (v >= 1000 ? d3.format(',.0f')(v) : d3.format('.2f')(v))
          showTooltip(xScale(d.date), yScale(d.value), `${dateFmt(d.date)} — ${valFmt(d.value)}`)
        })
        .on('mousemove', function(event, d: any) {
          const dateFmt = d3.utcFormat('%b %Y')
          const valFmt = (v: number) => (v >= 1000 ? d3.format(',.0f')(v) : d3.format('.2f')(v))
          showTooltip(xScale(d.date), yScale(d.value), `${dateFmt(d.date)} — ${valFmt(d.value)}`)
        })
        .on('mouseout', function() {
          d3.select(this as SVGCircleElement).attr('r', isHighest ? 6 : 5).attr('fill-opacity', isHighest ? 1 : 0.65).attr('stroke-opacity', isHighest ? 1 : 0.8)
          hideTooltip()
        })
        .on('click', () => setSelectedClusterId(cluster.clusterId))

      // Inline end labels aligned to last value
      const last = cluster.values[cluster.values.length - 1]
      const labelG = svg.append('g')
        .attr('transform', `translate(${xScale(last.date) + 18}, ${yScale(last.value) + 4})`)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          path.attr('stroke-opacity', 1).attr('stroke-width', 6)
          svg.selectAll(`.circle-${i}`).attr('fill-opacity', 1).attr('stroke-opacity', 1).attr('r', 7)
        })
        .on('mouseout', function() {
          path.attr('stroke-opacity', op).attr('stroke-width', isHighest ? 6 : 5)
          svg.selectAll(`.circle-${i}`).attr('fill-opacity', Math.min(1, op + 0.15)).attr('stroke-opacity', isHighest ? 1 : 0.8).attr('r', isHighest ? 6 : 5)
        })
        .on('click', () => setSelectedClusterId(cluster.clusterId))

      const label = labelG.append('text')
        .style('font-size', '16px')
        .style('fill', '#B91C1C')
        .style('font-weight', isHighest ? 'bold' : 'normal')
        .text(`Scenario ${cluster.clusterId}: ${(cluster.weight * 100).toFixed(0)}% probability`)

      if (isSelected) {
        const bb = (label.node() as SVGTextElement).getBBox()
        labelG.insert('rect', 'text')
          .attr('x', bb.x - 8)
          .attr('y', bb.y - 4)
          .attr('width', bb.width + 16)
          .attr('height', bb.height + 8)
          .attr('rx', 6)
          .attr('ry', 6)
          .attr('fill', '#ffffff')
          .attr('stroke', '#374151')
          .attr('stroke-width', 1.5)
          .attr('filter', 'url(#tooltip-shadow)')
      }
    })


    // Vertical separator between past and future
    const sepX = xScale(firstFuture)
    svg.append('line')
      .attr('x1', sepX)
      .attr('y1', 0)
      .attr('x2', sepX)
      .attr('y2', height)
      .attr('stroke', '#9ca3af')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', '4,4')
    // "Now" label on the separator
    svg.append('text')
      .attr('x', sepX)
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Now')

  }, [data, countryName, pastSeries, selectedClusterId])

  if (!data.clusters || !data.temporal || Object.keys(data.clusters).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No scenario data available for {countryName}
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="mx-auto"></svg>
    </div>
  )
}
