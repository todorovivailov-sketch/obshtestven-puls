
// Vintage/muted палитра — земни тонове, не неонови
const PALETTE = [
  '#1B4072', // тъмно синьо
  '#922B21', // бургундско червено
  '#7A6200', // матово злато
  '#1A5C38', // горска зеленина
  '#5C341A', // изгоряла керемида
  '#1A5068', // тъмен теал
  '#52284C', // тъмна слива
  '#3D5A00', // маслина
]

export default function PollChart({ results, options, showVotes = false }) {
  if (!results?.length && !options?.length) {
    return <p className="text-gray-500 text-sm text-center py-6">Все още няма гласове.</p>
  }

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

  const winnerIdx = total > 0
    ? rawData.reduce((best, d, i, arr) => d.votes > arr[best].votes ? i : best, 0)
    : -1

  // Всеки отговор получава свой vintage цвят
  const data = rawData.map((d, i) => ({
    ...d,
    color: PALETTE[i % PALETTE.length],
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

      {/* Хоризонтални барове — 2 колони при 4+ отговора */}
      <div className={data.length >= 4 ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4' : 'space-y-4'}>
        {data.map((d, i) => (
          <div key={i}>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="font-medium text-gray-800 truncate">{d.label}</span>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                {showVotes && <span className="text-gray-400 text-xs">{d.votes} {d.votes === 1 ? 'глас' : 'гласа'}</span>}
                <span className="font-bold w-10 text-right" style={{ color: d.color }}>{d.percent}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
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
    </div>
  )
}
