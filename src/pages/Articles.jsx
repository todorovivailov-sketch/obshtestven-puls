import { useEffect, useState } from 'react'
import ArticleCard from '../components/ArticleCard'
import { articlesApi } from '../lib/api'

const CATEGORIES = [
  { value: '', label: 'Всички' },
  { value: 'analysis', label: 'Анализи' },
  { value: 'comment', label: 'Коментари' },
  { value: 'news', label: 'Новини' },
]

export default function Articles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')

  useEffect(() => {
    setLoading(true)
    articlesApi.getAll(category || undefined).then(data => {
      setArticles(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [category])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-700 mb-2">Коментари и анализи</h1>
        <p className="text-gray-500">Задълбочени анализи и коментари по актуални теми.</p>
      </div>

      {/* Филтри */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === c.value
                ? 'bg-navy-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-navy-300'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="card h-64 animate-pulse bg-gray-100" />)}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {articles.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700">Няма публикации в тази категория</h3>
        </div>
      )}
    </div>
  )
}
