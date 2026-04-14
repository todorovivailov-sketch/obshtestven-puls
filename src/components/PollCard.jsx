import { useState } from 'react'
import { Link } from 'react-router-dom'
import PollChart from './PollChart'
import { voteApi } from '../lib/api'

export default function PollCard({ poll, showResults = false }) {
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState(null)
  const [voted, setVoted] = useState(showResults)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isClosed = poll.status === 'closed'
  const showResultsPublic = showResults || (isClosed && poll.results_published)

  const currentResults = results || poll.results
  const totalVotes = currentResults?.reduce((sum, r) => sum + Number(r.vote_count || 0), 0) || 0

  async function handleVote() {
    if (!selected || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await voteApi.vote(poll.id, selected)
      if (res.error) {
        if (res.already_voted) {
          setError('Вече сте гласували по тази анкета.')
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
      {/* Снимка */}
      {poll.image_url && (
        <div className="h-48 overflow-hidden">
          <img src={poll.image_url} alt={poll.question} className="w-full h-full object-cover" />
        </div>
      )}

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
        {(poll.start_date || poll.end_date) && (
          <div className="flex items-center gap-3 mt-2 text-xs text-navy-300">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {poll.start_date && (
              <span>От: {new Date(poll.start_date).toLocaleDateString('bg-BG')}</span>
            )}
            {poll.start_date && poll.end_date && <span>—</span>}
            {poll.end_date && (
              <span>До: {new Date(poll.end_date).toLocaleDateString('bg-BG')}</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-2 text-xs text-navy-300">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{totalVotes} {totalVotes === 1 ? 'глас' : 'гласа'}</span>
        </div>
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
          <>
            <PollChart results={results || poll.results} options={poll.options} />
            {poll.result_summary && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-800 mb-1">Обобщение</p>
                <p className="text-sm text-blue-700">{poll.result_summary}</p>
              </div>
            )}
          </>
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

        {/* Сподели */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <Link
            to={`/anketi/${poll.id}`}
            className="text-xs text-navy-600 hover:underline font-medium"
          >
            Отвори страницата →
          </Link>
          <button
            onClick={() => {
              const url = `${window.location.origin}/anketi/${poll.id}`
              navigator.clipboard.writeText(url)
            }}
            className="text-xs text-gray-400 hover:text-navy-600 flex items-center gap-1 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Копирай линк
          </button>
        </div>
      </div>
    </div>
  )
}
