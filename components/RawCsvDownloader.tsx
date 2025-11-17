'use client'

import React, { useMemo, useState } from 'react'

interface Item { period: string }
interface Props { items: Item[] }

export default function RawCsvDownloader({ items }: Props) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<null | { total: number; done: number }>(null)

  const allPeriods = useMemo(() => items.map(i => i.period), [items])

  const toggle = (p: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(allPeriods))
  const clearAll = () => setSelected(new Set())

  async function downloadOne(period: string) {
    try {
      const res = await fetch(`${base}/data/csv/${period}.csv`)
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `forecasts-${period}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {}
  }

  // Build a simple store-only ZIP in the browser
  function crc32buf(buf: Uint8Array): number {
    const table = (crc32buf as any)._t || ((crc32buf as any)._t = (() => {
      const t = new Uint32Array(256)
      for (let n = 0; n < 256; n++) {
        let c = n
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
        t[n] = c >>> 0
      }
      return t
    })())
    let c = 0 ^ (-1)
    for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xFF]
    return (c ^ (-1)) >>> 0
  }

  function writeLocalHeaderDV(dv: DataView, nameBytes: Uint8Array, crc: number, size: number) {
    let o = 0
    dv.setUint32(o, 0x04034b50, true); o += 4
    dv.setUint16(o, 20, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint32(o, crc >>> 0, true); o += 4
    dv.setUint32(o, size >>> 0, true); o += 4
    dv.setUint32(o, size >>> 0, true); o += 4
    dv.setUint16(o, nameBytes.length, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    return o
  }

  function writeCentralHeaderDV(dv: DataView, nameBytes: Uint8Array, crc: number, size: number, offset: number) {
    let o = 0
    dv.setUint32(o, 0x02014b50, true); o += 4
    dv.setUint16(o, 20, true); o += 2
    dv.setUint16(o, 20, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint32(o, crc >>> 0, true); o += 4
    dv.setUint32(o, size >>> 0, true); o += 4
    dv.setUint32(o, size >>> 0, true); o += 4
    dv.setUint16(o, nameBytes.length, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint32(o, 0, true); o += 4
    dv.setUint32(o, offset >>> 0, true); o += 4
    return o
  }

  function writeEndCentralDV(dv: DataView, dirSize: number, dirOffset: number, count: number) {
    let o = 0
    dv.setUint32(o, 0x06054b50, true); o += 4
    dv.setUint16(o, 0, true); o += 2
    dv.setUint16(o, 0, true); o += 2
    dv.setUint16(o, count, true); o += 2
    dv.setUint16(o, count, true); o += 2
    dv.setUint32(o, dirSize >>> 0, true); o += 4
    dv.setUint32(o, dirOffset >>> 0, true); o += 4
    dv.setUint16(o, 0, true); o += 2
    return o
  }

  function concatUint8(chunks: Uint8Array[]) {
    const total = chunks.reduce((s, c) => s + c.length, 0)
    const out = new Uint8Array(total)
    let o = 0
    for (const c of chunks) { out.set(c, o); o += c.length }
    return out
  }

  async function buildZip(periods: string[]) {
    const files: { name: string; data: Uint8Array }[] = []
    for (const p of periods) {
      const res = await fetch(`${base}/data/csv/${p}.csv`)
      if (!res.ok) continue
      const ab = await res.arrayBuffer()
      files.push({ name: `forecasts-${p}.csv`, data: new Uint8Array(ab) })
    }
    const parts: Uint8Array[] = []
    const central: Uint8Array[] = []
    let offset = 0
    for (const f of files) {
      const crc = crc32buf(f.data)
      const nameBytes = new TextEncoder().encode(f.name)
      const lh = new Uint8Array(30 + nameBytes.length)
      const lhdv = new DataView(lh.buffer)
      const headerLen = writeLocalHeaderDV(lhdv, nameBytes, crc, f.data.length)
      lh.set(nameBytes, headerLen)
      parts.push(lh)
      parts.push(f.data)
      const ch = new Uint8Array(46 + nameBytes.length)
      const chdv = new DataView(ch.buffer)
      const chLen = writeCentralHeaderDV(chdv, nameBytes, crc, f.data.length, offset)
      ch.set(nameBytes, chLen)
      central.push(ch)
      offset += lh.length + f.data.length
    }
    const dirSize = central.reduce((s, b) => s + b.length, 0)
    const dirOffset = offset
    const end = new Uint8Array(22)
    const edv = new DataView(end.buffer)
    writeEndCentralDV(edv, dirSize, dirOffset, files.length)
    const zip = concatUint8([...parts, ...central, end])
    return new Blob([zip], { type: 'application/zip' })
  }

  const onDownloadSelected = async () => {
    const periods = Array.from(selected)
    if (!periods.length) return
    setBusy({ total: periods.length, done: 0 })
    try {
      const blob = await buildZip(periods)
      const a = document.createElement('a')
      const dlUrl = URL.createObjectURL(blob)
      a.href = dlUrl
      const dateStr = new Date().toISOString().slice(0,10)
      a.download = `Luscint-forecasts-${dateStr}-selected.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(dlUrl)
    } finally {
      setBusy(null)
    }
  }
  const onDownloadAll = async () => {
    setBusy({ total: allPeriods.length, done: 0 })
    try {
      const blob = await buildZip(allPeriods)
      const a = document.createElement('a')
      const dlUrl = URL.createObjectURL(blob)
      a.href = dlUrl
      const dateStr = new Date().toISOString().slice(0,10)
      a.download = `Luscint-forecasts-${dateStr}-all.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(dlUrl)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
        <div className="space-x-3">
          <button className="text-link" onClick={selectAll} disabled={busy !== null}>Select all</button>
          <button className="text-link" onClick={clearAll} disabled={busy !== null}>Clear</button>
        </div>
        <div>
          {selected.size} selected
        </div>
      </div>
      <ul className="space-y-1 max-h-64 overflow-auto pr-1">
        {items.map(({ period }) => (
          <li key={period} className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={selected.has(period)}
                onChange={() => toggle(period)}
                disabled={busy !== null}
              />
              <span className="text-gray-700 text-sm">{period}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <button
          className={`inline-flex items-center px-3 py-1.5 rounded border ${busy ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'} border-gray-300 text-gray-700`}
          onClick={onDownloadSelected}
          disabled={busy !== null || selected.size === 0}
        >
          {busy ? `Preparing…` : 'Download selected (zip)'}
        </button>
        <button
          className={`inline-flex items-center px-3 py-1.5 rounded border ${busy ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'} border-gray-200 text-gray-600`}
          onClick={onDownloadAll}
          disabled={busy !== null || items.length === 0}
        >{busy ? 'Preparing…' : 'Download all (zip)'}</button>
      </div>
    </div>
  )
}
