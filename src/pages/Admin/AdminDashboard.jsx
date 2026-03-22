import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pollsApi, articlesApi, contactApi } from '../../lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ activePolls: 0, closedPolls: 0, articles: 0, messages: 0 })

  useEffect(() => {
    Promise.all([
      pollsApi.getAll('active'),
      pollsApi.getAll('closed'),
      articlesApi.getAll(),
      contactApi.getAll(),
    ]).then(([active, closed, arts, msgs]) => {
      setStats({
        activePolls: Array.isArray(active) ? active.length : 0,
        closedPolls: Array.isArray(closed) ? closed.length : 0,
        articles: Array.isArray(arts) ? arts.length : 0,
        messages: Array.isArray(msgs) ? msgs.length : 0,
      })
    })
  }, [])

  const cards = [
    { label: 'Активни анкети', value: stats.activePolls, color: 'bg-green-500', link: '/admin/anketi' },
    { label: 'Минали анкети', value: stats.closedPolls, color: 'bg-navy-500', link: '/admin/anketi' },
    { label: 'Публикации', value: stats.articles, color: 'bg-crimson-600', link: '/admin/statii' },
    { label: 'Съобщения', value: stats.messages, color: 'bg-amber-500', link: '/admin/saobshteniya' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-navy-700 mb-8">Начало</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map(c => (
          <Link key={c.label} to={c.link} className="card p-6 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${c.color} rounded-lg mb-3`} />
            <div className="text-3xl font-bold text-navy-700">{c.value}</div>
            <div className="text-sm text-gray-500 mt-1">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-navy-700 mb-4">Бързи действия</h3>
          <div className="space-y-3">
            <Link to="/admin/anketi" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
              <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-medium">Нова анкета</span>
            </Link>
            <Link to="/admin/statii" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
              <div className="w-8 h-8 bg-crimson-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-crimson-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-medium">Нова статия</span>
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-navy-700 mb-4">Публичен сайт</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-navy-600 hover:underline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Начална страница
            </a>
            <a href="/anketi" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-navy-600 hover:underline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Анкети
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
