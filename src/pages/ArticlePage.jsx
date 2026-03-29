import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { articlesApi } from '../lib/api'

const CATEGORY_LABELS = {
  analysis: 'Анализ',
  comment: 'Коментар',
  news: 'Новина',
}

const CATEGORY_COLORS = {
  analysis: 'bg-navy-100 text-navy-700',
  comment: 'bg-crimson-100 text-crimson-700',
  news: 'bg-green-100 text-green-700',
}

export default function ArticlePage() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    articlesApi.getOne(id).then(data => {
      setArticle(data.id ? data : null)
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

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Статията не е намерена</h2>
        <Link to="/komentari" className="text-crimson-600 hover:underline">Назад към анализи</Link>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <article className="max-w-3xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
          <Link to="/komentari" className="hover:text-navy-700 transition-colors">Коментари и анализи</Link>
          <span>/</span>
          <span className="text-gray-600">{CATEGORY_LABELS[article.category] || 'Статия'}</span>
        </nav>

        {/* Категория badge */}
        <div className="mb-4">
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-600'}`}>
            {CATEGORY_LABELS[article.category] || 'Статия'}
          </span>
        </div>

        {/* Заглавие */}
        <h1 className="text-3xl md:text-4xl font-bold text-navy-800 leading-tight mb-6" style={{ lineHeight: '1.25' }}>
          {article.title}
        </h1>

        {/* Мета — автор и дата */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gray-100">
          <div className="flex items-center gap-3">
            {article.author_image_url ? (
              <img
                src={article.author_image_url}
                alt={article.author || 'Автор'}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center text-white font-bold text-sm">
                {(article.author || 'Р').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-sm font-semibold text-gray-800">{article.author || 'Редакция'}</div>
              <div className="text-xs text-gray-400">
                {new Date(article.created_at).toLocaleDateString('bg-BG', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Снимка */}
        {article.image_url && (
          <figure className="mb-8 -mx-4 md:mx-0">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full md:rounded-xl object-cover shadow-md"
              style={{ maxHeight: '480px' }}
            />
          </figure>
        )}

        {/* Тяло на статията */}
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
          <Link to="/komentari" className="inline-flex items-center gap-2 text-navy-700 hover:text-crimson-600 font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад към анализи
          </Link>
          <span className="text-xs text-gray-400">
            {new Date(article.created_at).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

      </article>
    </div>
  )
}
