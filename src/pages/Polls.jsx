import { useEffect, useState } from 'react'
import PollCard from '../components/PollCard'
import { pollsApi } from '../lib/api'

const CATEGORIES = ['Всички', 'Политика', 'Общество', 'Култура', 'Медии', 'Развлечения']

export default function Polls() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Всички')

  useEffect(() => {
    setLoading(true)
    pollsApi.getAll('active', false, category === 'Всички' ? '' : category).then(data => {
      setPolls(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [category])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-700 mb-2">Активни анкети</h1>
        <p className="text-gray-500">Участвайте в текущите граждански анкети — гласуването е анонимно.</p>
      </div>

      {/* Категории */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              category === cat
                ? 'bg-navy-700 text-white border-navy-700'
                : 'bg-white text-gray-600 border-gray-300 hover:border-navy-400 hover:text-navy-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="card h-64 animate-pulse bg-gray-100" />)}
        </div>
      ) : polls.length > 0 ? (
        <div className="space-y-6">
          {polls.map(p => <PollCard key={p.id} poll={p} />)}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Няма анкети в тази категория</h3>
          <p className="text-gray-500">Проверете отново скоро — нови анкети се публикуват редовно.</p>
        </div>
      )}
    </div>
  )
}
