import Link from 'next/link'

type Row = { id: string; name: string; pred1m: number; deltaMoM: number }

export default function ThresholdHighlights({ rows, threshold }: { rows: Row[]; threshold: number }) {
  const newAbove = rows
    .filter(r => r.pred1m > threshold && (r.pred1m - r.deltaMoM) <= threshold)
    .sort((a, b) => b.pred1m - a.pred1m)
    .slice(0, 6)

  const backBelow = rows
    .filter(r => r.pred1m <= threshold && (r.pred1m - r.deltaMoM) > threshold)
    .sort((a, b) => (b.deltaMoM) - (a.deltaMoM))
    .slice(0, 6)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
      <h3 className="text-lg font-light text-gray-900 mb-3">High‑risk threshold changes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Newly above {threshold}</div>
          {newAbove.length === 0 ? (
            <div className="text-sm text-gray-500">—</div>
          ) : (
            <ul className="space-y-1">
              {newAbove.map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-800 flex-1 min-w-0 truncate">{r.name}</span>
                  <span className="text-gray-700 font-mono tabular-nums w-20 text-left">{r.pred1m.toFixed(1)}</span>
                  <Link href={`/forecasts/${r.id}`} className="text-pace-red">Open →</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Back below {threshold}</div>
          {backBelow.length === 0 ? (
            <div className="text-sm text-gray-500">—</div>
          ) : (
            <ul className="space-y-1">
              {backBelow.map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-800 flex-1 min-w-0 truncate">{r.name}</span>
                  <span className="text-gray-700 font-mono tabular-nums w-20 text-left">{r.pred1m.toFixed(1)}</span>
                  <Link href={`/forecasts/${r.id}`} className="text-pace-red">Open →</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

