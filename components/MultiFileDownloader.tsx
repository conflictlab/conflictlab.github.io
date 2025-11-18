'use client'

import React, { useMemo, useState } from 'react'

interface Item {
  path: string
  label?: string
  filename?: string
}

interface Props { items: Item[]; zipName?: string }

export default function MultiFileDownloader({ items, zipName }: Props) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<boolean>(false)

  const allKeys = useMemo(() => items.map(i => i.path), [items])

  const toggle = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }
  const selectAll = () => setSelected(new Set(allKeys))
  const clearAll = () => setSelected(new Set())

  function filenameFor(it: Item): string {
    if (it.filename) return it.filename
    try {
      const url = new URL(base + it.path, 'http://x')
      const last = url.pathname.split('/').filter(Boolean).pop() || 'file'
      return last
    } catch {
      const parts = (it.path || '').split('/')
      return parts[parts.length - 1] || 'file'
    }
  }

  // CRC32 + ZIP writer (store only), adapted from RawCsvDownloader
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

  async function buildZip(paths: string[]) {
    const files: { name: string; data: Uint8Array }[] = []
    for (const p of paths) {
      try {
        const it = items.find(i => i.path === p)
        if (!it) continue
        const res = await fetch(`${base}${it.path}`)
        if (!res.ok) continue
        const ab = await res.arrayBuffer()
        files.push({ name: filenameFor(it), data: new Uint8Array(ab) })
      } catch {}
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
    const paths = Array.from(selected)
    if (!paths.length) return
    setBusy(true)
    try {
      const blob = await buildZip(paths)
      const a = document.createElement('a')
      const dlUrl = URL.createObjectURL(blob)
      a.href = dlUrl
      const dateStr = new Date().toISOString().slice(0,10)
      a.download = `${zipName || 'Luscint-data'}-${dateStr}-selected.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(dlUrl)
    } finally {
      setBusy(false)
    }
  }

  const onDownloadAll = async () => {
    setBusy(true)
    try {
      const blob = await buildZip(allKeys)
      const a = document.createElement('a')
      const dlUrl = URL.createObjectURL(blob)
      a.href = dlUrl
      const dateStr = new Date().toISOString().slice(0,10)
      a.download = `${zipName || 'Luscint-data'}-${dateStr}-all.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(dlUrl)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
        <div className="space-x-3">
          <button className="text-link" onClick={selectAll} disabled={busy}>Select all</button>
          <button className="text-link" onClick={clearAll} disabled={busy}>Clear</button>
        </div>
        <div>
          {selected.size} selected
        </div>
      </div>
      <ul className="space-y-1 max-h-64 overflow-auto pr-1">
        {items.map((it) => (
          <li key={it.path} className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={selected.has(it.path)}
                onChange={() => toggle(it.path)}
                disabled={busy}
              />
              <span className="text-gray-700 text-sm">{it.label || it.path}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <button
          className={`inline-flex items-center px-3 py-1.5 rounded border ${busy ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'} border-gray-300 text-gray-700`}
          onClick={onDownloadSelected}
          disabled={busy || selected.size === 0}
        >
          {busy ? `Preparing…` : 'Download selected (zip)'}
        </button>
        <button
          className={`inline-flex items-center px-3 py-1.5 rounded border ${busy ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'} border-gray-200 text-gray-600`}
          onClick={onDownloadAll}
          disabled={busy || items.length === 0}
        >{busy ? 'Preparing…' : 'Download all (zip)'}</button>
      </div>
    </div>
  )
}
