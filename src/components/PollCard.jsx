import { useState } from 'react'
import PollChart from './PollChart'
import { voteApi } from '../lib/api'

export default function PollCard({ poll, showResults = false }) {
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState(null)
  const [voted, setVoted] = useState(showResults)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isClosed = poll.status === 'closed'
  const showResultsPublic = isClosed && poll.results_published

  async function handleVote() {
    if (!selected || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await voteApi.vote(poll.id, selected)
      if (res.error) {
        if (res.already_voted) {
          setError('Вече сте гласували по тази анкета.')
          setVoted(true)
        } else {
          setError(res.error)
        }
      } else {
        setResults(res.results)
        setVoted(true)
      }
    } catch {
      setError('Грешка при гласуване. Опитайте отново.')
    }
    setLoading(false)
  }

  return (
    <div className="card">
      {/* Хедър */}
      <div className="bg-gradient-to-r from-navy-700 to-navy-600 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-white font-semibold text-lg leading-snug">{poll.question}</h2>
          {isClosed
            ? <span className="badge-closed shrink-0">Приключила</span>
            : <span className="badge-active shrink-0"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Активна</span>
          }
        </div>
        {poll.description && (
          <p className="text-navy-200 text-sm mt-2">{poll.description}</p>
        )}
      </div>

      <div className="p-5">
        {/* Гласуване */}
        {!voted && !isClosed && (
          <div className="space-y-3">
            {poll.options?.map(opt => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                  selected === opt.id
                    ? 'border-crimson-500 bg-crimson-50'
                    : 'border-gray-200 hover:border-navy-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`poll-${poll.id}`}
                  value={opt.id}
                  checked={selected === opt.id}
                  onChange={() => setSelected(opt.id)}
                  className="accent-crimson-600 w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-800">{opt.label}</span>
              </label>
            ))}

            {error && <p className="text-crimson-600 text-sm">{error}</p>}

            <button
              onClick={handleVote}
              disabled={!selected || loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? 'Гласуване...' : 'Гласувай'}
            </button>
          </div>
        )}

        {/* Резултати — показват се само ако анкетата е приключила И резултатите са публикувани */}
        {showResultsPublic && (
          <PollChart results={results || poll.results} options={poll.options} />
        )}

        {/* Приключила анкета, но резултатите още не са публикувани */}
        {isClosed && !showResultsPublic && !voted && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-gray-600 font-medium text-sm">Анкетата е приключила.</p>
            <p className="text-gray-400 text-xs mt-1">Резултатите ще бъдат публикувани скоро.</p>
          </div>
        )}

        {/* След гласуване — благодарствено съобщение (когато резултатите не са публикувани) */}
        {voted && !showResultsPublic && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-green-600 mb-1">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-green-800 font-semibold text-sm">Благодарим за вашия глас!</p>
            <p className="text-green-600 text-xs mt-1">Резултатите ще бъдат публикувани след приключване на анкетата.</p>
          </div>
        )}

        {error && voted && <p className="text-crimson-600 text-sm mt-2">{error}</p>}

        {/* Дата */}
        {poll.ends_at && (
          <p className="text-xs text-gray-400 mt-4">
            {isClosed ? 'Приключи на: ' : 'Приключва на: '}
            {new Date(poll.ends_at).toLocaleDateString('bg-BG')}
          </p>
        )}
      </div>
    </div>
  )
}
