const fs = require('fs')

function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v) }

function show(label, obj) {
  if (!isObj(obj)) return
  const ks = Object.keys(obj)
  console.log(label, 'keys:', ks.slice(0, 10))
  if (ks.length) {
    const k = ks[0]
    const v = obj[k]
    const t = Array.isArray(v) ? 'array' : isObj(v) ? 'object' : typeof v
    const len = Array.isArray(v) ? `len=${v.length}` : ''
    console.log(label, 'sample entry:', k, '->', t, len)
    if (Array.isArray(v) && v.length) console.log(label, 'entry head:', v.slice(0, 6))
    if (isObj(v)) console.log(label, 'entry keys:', Object.keys(v).slice(0, 10))
  }
}

function main() {
  const p = 'public/data/scenarios.json'
  if (!fs.existsSync(p)) { console.error('Missing', p); process.exit(1) }
  const txt = fs.readFileSync(p, 'utf8')
  let d
  try { d = JSON.parse(txt) } catch (e) { console.error('JSON parse error:', e.message); process.exit(1) }
  const keys = isObj(d) ? Object.keys(d) : []
  console.log('ROOT type:', Array.isArray(d) ? 'array' : isObj(d) ? 'object' : typeof d, 'keys:', keys.length)
  if (isObj(d)) {
    show('ROOT', d)
    if (d.sce_dictionary) show('sce_dictionary', d.sce_dictionary)
    if (d.countries) show('countries', d.countries)
    const iso3 = keys.filter(k => /^[A-Z]{3}$/.test(k)).slice(0, 10)
    if (iso3.length) console.log('Likely ISO3 keys:', iso3)
    const nameKeys = keys.filter(k => /\s/.test(k)).slice(0, 5)
    if (nameKeys.length) console.log('Likely country name keys:', nameKeys)
  }
}

main()

