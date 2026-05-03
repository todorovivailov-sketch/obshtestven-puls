import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { policyTranslationsApi } from '../lib/api'

export default function PolicyTranslations() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    policyTranslationsApi.getAll().then(data => {
      setItems(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-navy-800 mb-1">Преводач на политики</h1>
        <p className="text-gray-500 text-sm">Разбираем превод на политики, закони и документи за всеки гражданин.</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="card h-64 animate-pulse bg-gray-100" />)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {items.map(item => (
            <Link key={item.id} to={`/prevodach/${item.id}`} className="card group flex flex-col hover:shadow-md transition-shadow duration-200">
              {item.image_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                    Политика
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString('bg-BG')}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 group-hover:text-navy-700 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.author && (
                  <p className="text-sm text-gray-400 mt-auto pt-3">{item.author}</p>
                )}
                <div className="mt-3 flex items-center text-crimson-600 text-sm font-medium">
                  Прочети
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700">Все още няма публикувани преводи</h3>
        </div>
      )}
    </div>
  )
}
