import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#C0392B', '#1B2A4A', '#2d4f9b', '#e03e3e', '#6787c3', '#88201f']

export default function PollChart({ results, options }) {
  if (!results?.length && !options?.length) {
    return <p className="text-gray-500 text-sm text-center py-6">Все още няма гласове.</p>
  }

  // Ако имаме results от view-a
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

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-500 font-medium">
        Общо гласове: <span className="text-navy-700 font-bold">{total}</span>
      </div>

      {/* Прости bar-ове */}
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-800">{d.label}</span>
              <span className="font-bold text-navy-700">{d.percent}%</span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-700 flex items-center px-3"
                style={{
                  width: `${d.percent}%`,
                  backgroundColor: d.color,
                  minWidth: d.votes > 0 ? '2rem' : 0,
                }}
              >
                {d.votes > 0 && (
                  <span className="text-white text-xs font-semibold">{d.votes}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recharts bar chart (опционален, по-визуален) */}
      {total > 0 && (
        <div className="mt-4 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v, n, p) => [`${p.payload.percent}% (${v} гласа)`, 'Резултат']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
