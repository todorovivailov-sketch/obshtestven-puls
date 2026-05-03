import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { policyTranslationsApi } from '../lib/api'

function formatBody(body) {
  if (!body) return ''
  if (/<[a-z][\s\S]*>/i.test(body)) return body
  return body
    .split(/\n\n+/)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

export default function PolicyTranslationPage() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    policyTranslationsApi.getOne(id).then(data => {
      setItem(data.id ? data : null)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4 mb-6" />
        <div className="h-10 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-10 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="h-4 bg-gray-100 rounded animate-pulse mt-4" />
        <div className="h-72 bg-gray-100 rounded-xl animate-pulse mt-6" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Документът не е намерен</h2>
        <Link to="/prevodach" className="text-crimson-600 hover:underline">Назад към преводач на политики</Link>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <article className="max-w-3xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
          <Link to="/prevodach" className="hover:text-navy-700 transition-colors">Преводач на политики</Link>
          <span>/</span>
          <span className="text-gray-600">Политика</span>
        </nav>

        {/* Badge */}
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 text-amber-700">
            Политика
          </span>
        </div>

        {/* Заглавие */}
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mb-6" style={{ lineHeight: '1.2' }}>
          {item.title}
        </h1>

        {/* Мета */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gray-100">
          <div className="flex items-center gap-3">
            {item.author_image_url ? (
              <img
                src={item.author_image_url}
                alt={item.author || 'Автор'}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
                {(item.author || 'Р').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-sm font-semibold text-gray-800">{item.author || 'Редакция'}</div>
              <div className="text-xs text-gray-400">
                {new Date(item.created_at).toLocaleDateString('bg-BG', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Снимка */}
        {item.image_url && (
          <figure className="mb-8 -mx-4 md:mx-0">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full md:rounded-xl object-cover shadow-md"
              style={{ maxHeight: '480px' }}
            />
          </figure>
        )}

        {/* Тяло */}
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: formatBody(item.body) }}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
          <Link to="/prevodach" className="inline-flex items-center gap-2 text-navy-700 hover:text-crimson-600 font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад към преводач на политики
          </Link>
          <span className="text-xs text-gray-400">
            {new Date(item.created_at).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

      </article>
    </div>
  )
}
