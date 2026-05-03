import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend, LabelList,
} from 'recharts'

const NAVY   = '#1B3A6B'
const CRIMSON = '#C0392B'

function CustomTooltip({ active, payload, showVotes }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-gray-800 mb-1">{d.label}</p>
        <p style={{ color: d.color }}><span className="font-bold text-lg">{d.percent}%</span></p>
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
          <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
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

  // Изграждаме данните без цветове
  const rawData = results?.length
    ? results.map(r => ({
        label: r.label,
        votes: Number(r.vote_count),
        percent: Number(r.percentage) || 0,
      }))
    : options?.map(o => ({
        label: o.label,
        votes: 0,
        percent: 0,
      }))

  const total = rawData.reduce((s, d) => s + d.votes, 0)

  // Намираме индекса на водещия
  const winnerIdx = total > 0
    ? rawData.reduce((best, d, i, arr) => d.votes > arr[best].votes ? i : best, 0)
    : -1

  // Водещ → crimson, останалите → navy
  const data = rawData.map((d, i) => ({
    ...d,
    color: i === winnerIdx ? CRIMSON : NAVY,
  }))

  const winner = winnerIdx >= 0 ? data[winnerIdx] : null

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
          <div className="inline-flex items-center gap-1.5 text-xs bg-crimson-50 text-crimson-800 border border-crimson-200 rounded-lg px-3 py-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-crimson-500 flex-shrink-0" />
            Водещ: <span className="font-bold">{winner.label}</span>
            <span className="text-crimson-500 font-semibold">({winner.percent}%)</span>
          </div>
        )}
      </div>

      {/* Хоризонтални барове */}
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i}>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="font-medium text-gray-800">{d.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {showVotes && <span className="text-gray-400 text-xs">{d.votes} {d.votes === 1 ? 'глас' : 'гласа'}</span>}
                <span className="font-bold w-12 text-right" style={{ color: d.color }}>{d.percent}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.max(d.percent, d.votes > 0 ? 2 : 0)}%`,
                  backgroundColor: d.color,
                }}
              />
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
                <Bar dataKey={showVotes ? 'votes' : 'percent'} radius={[6, 6, 0, 0]} isAnimationActive animationDuration={800}>
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
