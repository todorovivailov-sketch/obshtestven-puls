import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PollCard from '../components/PollCard'
import { pollsApi } from '../lib/api'

export default function PollPage() {
  const { id } = useParams()
  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pollsApi.getOne(id).then(data => {
      setPoll(data.poll ? { ...data.poll, results: data.results } : null)
      setLoading(false)
    })
  }, [id])

  const siteUrl = 'https://obshtestven-puls.vercel.app'

  return (
    <>
      {poll && (
        <Helmet>
          <title>{poll.question} — Обществен пулс</title>
          <meta property="og:title" content={poll.question} />
          <meta property="og:description" content={poll.description || 'Участвайте в анкетата на Обществен пулс — Силистра и региона.'} />
          <meta property="og:image" content={poll.image_url || `${siteUrl}/logo.png`} />
          <meta property="og:url" content={`${siteUrl}/anketi/${id}`} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={poll.question} />
          <meta name="twitter:description" content={poll.description || 'Участвайте в анкетата на Обществен пулс.'} />
          <meta name="twitter:image" content={poll.image_url || `${siteUrl}/logo.png`} />
        </Helmet>
      )}

      <div className="max-w-2xl mx-auto px-4 py-10">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link to="/anketi" className="hover:text-navy-700 transition-colors">Анкети</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{poll?.question}</span>
        </nav>

        {loading ? (
          <div className="card h-64 animate-pulse bg-gray-100" />
        ) : poll ? (
          <PollCard poll={poll} />
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">Анкетата не е намерена.</p>
            <Link to="/anketi" className="text-crimson-600 hover:underline mt-2 inline-block">Назад към анкети</Link>
          </div>
        )}
      </div>
    </>
  )
}
