import { useEffect, useState } from 'react'
import PollCard from '../components/PollCard'
import { pollsApi } from '../lib/api'

export default function Polls() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pollsApi.getAll('active').then(data => {
      setPolls(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-700 mb-2">Активни анкети</h1>
        <p className="text-gray-500">Участвайте в текущите граждански анкети — гласуването е анонимно.</p>
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
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Няма активни анкети</h3>
          <p className="text-gray-500">Проверете отново скоро — нови анкети се публикуват редовно.</p>
        </div>
      )}
    </div>
  )
}
