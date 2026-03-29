import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pollsApi, articlesApi, contactApi } from '../../lib/api'

const CATEGORY_LABELS = { analysis: 'Анализ', comment: 'Коментар', news: 'Новина' }

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activePolls: 0,
    closedPolls: 0,
    publishedArticles: 0,
    hiddenArticles: 0,
    messages: 0,
    publishedResults: 0,
  })
  const [recentPolls, setRecentPolls] = useState([])
  const [recentArticles, setRecentArticles] = useState([])
  const [messages, setMessages] = useState([])

  useEffect(() => {
    Promise.all([
      pollsApi.getAll('active'),
      pollsApi.getAll('closed'),
      articlesApi.getAllAdmin(),
      contactApi.getAll(),
    ]).then(([active, closed, arts, msgs]) => {
      const activeArr = Array.isArray(active) ? active : []
      const closedArr = Array.isArray(closed) ? closed : []
      const artsArr = Array.isArray(arts) ? arts : []
      const msgsArr = Array.isArray(msgs) ? msgs : []

      setStats({
        activePolls: activeArr.length,
        closedPolls: closedArr.length,
        publishedArticles: artsArr.filter(a => a.published).length,
        hiddenArticles: artsArr.filter(a => !a.published).length,
        messages: msgsArr.length,
        publishedResults: closedArr.filter(p => p.results_published).length,
      })

      setRecentPolls([...activeArr, ...closedArr].slice(0, 4))
      setRecentArticles(artsArr.slice(0, 4))
      setMessages(msgsArr.slice(0, 3))
      setLoading(false)
    })
  }, [])

  const statCards = [
    {
      label: 'Активни анкети',
      value: stats.activePolls,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bg: 'bg-green-50', iconBg: 'bg-green-500', text: 'text-green-700',
      link: '/admin/anketi',
    },
    {
      label: 'Публ. резултати',
      value: stats.publishedResults,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-blue-50', iconBg: 'bg-blue-500', text: 'text-blue-700',
      link: '/admin/anketi',
    },
    {
      label: 'Статии',
      value: stats.publishedArticles,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      bg: 'bg-crimson-50', iconBg: 'bg-crimson-600', text: 'text-crimson-700',
      link: '/admin/statii',
    },
    {
      label: 'Съобщения',
      value: stats.messages,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      bg: 'bg-amber-50', iconBg: 'bg-amber-500', text: 'text-amber-700',
      link: '/admin/saobshteniya',
    },
  ]

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">Контролен панел</h1>
          <p className="text-sm text-gray-400 mt-1">Обществен пулс — Силистра</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm text-navy-600 border border-navy-200 px-4 py-2 rounded-lg hover:bg-navy-50 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Виж сайта
        </a>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(c => (
          <Link key={c.label} to={c.link} className={`card p-5 hover:shadow-md transition-all ${c.bg} border-0`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${c.iconBg} rounded-lg flex items-center justify-center text-white`}>
                {c.icon}
              </div>
            </div>
            <div className={`text-3xl font-bold ${c.text}`}>
              {loading ? <span className="inline-block w-8 h-8 bg-white/50 rounded animate-pulse" /> : c.value}
            </div>
            <div className="text-sm text-gray-600 mt-1 font-medium">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Последни анкети */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-700">Последни анкети</h3>
            <Link to="/admin/anketi" className="text-xs text-navy-600 hover:underline">Всички →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : recentPolls.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Няма анкети</p>
          ) : (
            <div className="space-y-2">
              {recentPolls.map(poll => (
                <div key={poll.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${poll.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug line-clamp-2">{poll.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {poll.category && <span className="text-xs text-gray-400">{poll.category}</span>}
                      {poll.results_published && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Резултатите публ.</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/admin/anketi" className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-navy-700 border border-navy-200 rounded-lg hover:bg-navy-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Нова анкета
          </Link>
        </div>

        {/* Последни статии */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-700">Последни статии</h3>
            <Link to="/admin/statii" className="text-xs text-navy-600 hover:underline">Всички →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : recentArticles.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Няма статии</p>
          ) : (
            <div className="space-y-2">
              {recentArticles.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {a.image_url ? (
                    <img src={a.image_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0 mt-0.5 flex items-center justify-center text-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug truncate">{a.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{CATEGORY_LABELS[a.category]}</span>
                      {!a.published && <span className="text-xs text-amber-600">Скрита</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/admin/statii" className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-crimson-700 border border-crimson-200 rounded-lg hover:bg-crimson-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Нова статия
          </Link>
        </div>

        {/* Последни съобщения + линкове */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-700">Последни съобщения</h3>
              <Link to="/admin/saobshteniya" className="text-xs text-navy-600 hover:underline">Всички →</Link>
            </div>
            {loading ? (
              <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
            ) : messages.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-3">Няма съобщения</p>
            ) : (
              <div className="space-y-2">
                {messages.map(m => (
                  <div key={m.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{m.name}</span>
                      <span className="text-xs text-gray-400">{new Date(m.created_at).toLocaleDateString('bg-BG')}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{m.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Публичен сайт */}
          <div className="card p-5">
            <h3 className="font-semibold text-navy-700 mb-3">Публичен сайт</h3>
            <div className="space-y-1.5">
              {[
                { href: '/', label: 'Начало' },
                { href: '/anketi', label: 'Анкети' },
                { href: '/rezultati', label: 'Резултати' },
                { href: '/komentari', label: 'Коментари' },
                { href: '/kontakt', label: 'Контакт' },
              ].map(l => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-navy-600 hover:text-navy-800 py-1.5 px-2 rounded-lg hover:bg-navy-50 transition-colors">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
