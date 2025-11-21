import fs from 'fs'
import path from 'path'

export interface EntityContext {
  summary: string
  url?: string
  source?: 'wikipedia' | 'crisiswatch' | 'other'
  updatedAt?: string
  updates?: Array<{ title: string; date: string; url: string; source?: string }>
}

let cache: Record<string, EntityContext> | null = null
let updatesCache: Record<string, { updates: Array<{ title: string; date: string; url: string; source?: string; excerpt?: string }>; updatedAt?: string }> | null = null

function loadContext(): Record<string, EntityContext> {
  if (cache) return cache
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'context.json')
    const raw = fs.readFileSync(p, 'utf-8')
    cache = JSON.parse(raw)
  } catch {
    cache = {}
  }
  return cache!
}

function loadUpdates(): Record<string, { updates: Array<{ title: string; date: string; url: string; source?: string; excerpt?: string }>; updatedAt?: string }> {
  if (updatesCache) return updatesCache
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'context-reliefweb.json')
    const raw = fs.readFileSync(p, 'utf-8')
    updatesCache = JSON.parse(raw)
  } catch {
    updatesCache = {}
  }
  return updatesCache!
}

export function getContextForEntity(name: string): EntityContext | null {
  const ctx = loadContext()
  const upd = loadUpdates()
  const base = ctx[name] || null
  const extra = upd[name]
  if (!base && !extra) return null
  const merged: EntityContext = {
    summary: base?.summary || '',
    url: base?.url,
    source: base?.source,
    updatedAt: base?.updatedAt || extra?.updatedAt,
    updates: [],
  }
  if (extra?.updates) merged.updates = merged.updates!.concat(extra.updates)
  return merged
}
