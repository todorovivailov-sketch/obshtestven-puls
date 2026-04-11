import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend, LabelList,
} from 'recharts'

const COLORS = [
  '#0369a1', // небесносин
  '#C0392B', // червено
  '#D4AC0D', // злато
  '#1A8754', // зелено
  '#7C3AED', // лилаво
  '#0891B2', // циан
  '#EA580C', // оранжево
  '#BE185D', // розово
]

function CustomTooltip({ active, payload, showVotes }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-gray-800 mb-1">{d.label}</p>
        <p className="text-navy-700"><span className="font-bold text-lg">{d.percent}%</span></p>
        {showVotes && <p className="text-gray-500">{d.votes} {d.votes === 1 ? 'глас' : 'гласа'}</p>}
      </div>
    )
  }
  return null
}

function CustomLegend({ data }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span className="inline-block w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
          <span>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function PollChart({ results, options, showVotes = false }) {
  if (!results?.length && !options?.length) {
    return <p className="text-gray-500 text-sm text-center py-6">Все още няма гласове.</p>
  }

  const data = results?.length
    ? results.map((r, i) => ({
        label: r.label,
        votes: Number(r.vote_count),
        percent: Number(r.percentage) || 0,
        color: COLORS[i % COLORS.length],
      }))
    : options?.map((o, i) => ({
        label: o.label,
        votes: 0,
        percent: 0,
        color: COLORS[i % COLORS.length],
      }))

  const total = data.reduce((s, d) => s + d.votes, 0)
  const winner = total > 0 ? data.reduce((a, b) => a.votes > b.votes ? a : b) : null

  return (
    <div className="space-y-5">
      {/* Заглавна статистика */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {showVotes
            ? <>Общо гласове: <span className="text-navy-700 font-bold text-base">{total}</span></>
            : <span className="text-navy-700 font-medium">Резултати</span>
          }
        </div>
        {winner && total > 0 && (
          <div className="text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-1">
            Водещ: <span className="font-semibold text-navy-700">{winner.label}</span> ({winner.percent}%)
          </div>
        )}
      </div>

      {/* Хоризонтални барове с анимация */}
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i}>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="font-medium text-gray-800">{d.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {showVotes && <span className="text-gray-400 text-xs">{d.votes} {d.votes === 1 ? 'глас' : 'гласа'}</span>}
                <span className="font-bold text-navy-700 w-12 text-right">{d.percent}%</span>
              </div>
            </div>
            <div className="h-7 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                style={{
                  width: `${Math.max(d.percent, d.votes > 0 ? 4 : 0)}%`,
                  backgroundColor: d.color,
                  opacity: 0.9,
                }}
              >
                {d.votes > 0 && d.percent >= 8 && (
                  <span className="text-white text-xs font-bold">{d.percent}%</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recharts колонна диаграма */}
      {total > 0 && (
        <div className="mt-6">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 15, right: 15, left: -15, bottom: 5 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => showVotes ? `${v}` : `${v}%`}
                />
                <Tooltip content={<CustomTooltip showVotes={showVotes} />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey={showVotes ? 'votes' : 'percent'} radius={[8, 8, 0, 0]} isAnimationActive animationDuration={800}>
                  {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                  <LabelList
                    dataKey="percent"
                    position="top"
                    formatter={v => v > 0 ? `${v}%` : ''}
                    style={{ fontSize: 11, fontWeight: 700, fill: '#374151' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <CustomLegend data={data} />
        </div>
      )}
    </div>
  )
}
