import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { articlesApi } from '../lib/api'

const CATEGORY_LABELS = {
  analysis: 'Анализ',
  comment: 'Коментар',
  news: 'Новина',
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
        <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse mt-6" />
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
    <article className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/komentari" className="hover:text-navy-700">Коментари и анализи</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{CATEGORY_LABELS[article.category] || 'Статия'}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold bg-navy-100 text-navy-700 px-3 py-1 rounded-full">
            {CATEGORY_LABELS[article.category] || 'Статия'}
          </span>
          <span className="text-sm text-gray-400">
            {new Date(article.created_at).toLocaleDateString('bg-BG', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-navy-700 leading-tight mb-4">
          {article.title}
        </h1>

        {article.summary && (
          <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-crimson-500 pl-4">
            {article.summary}
          </p>
        )}
      </header>

      {/* Снимка */}
      {article.image_url && (
        <div className="mb-8 rounded-xl overflow-hidden">
          <img src={article.image_url} alt={article.title} className="w-full h-72 object-cover" />
        </div>
      )}

      {/* Тяло */}
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />

      {/* Назад */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link to="/komentari" className="inline-flex items-center gap-2 text-navy-700 hover:text-crimson-600 font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад към анализи
        </Link>
      </div>
    </article>
  )
}
