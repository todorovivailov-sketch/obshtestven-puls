import { Link } from 'react-router-dom'

const CATEGORY_LABELS = {
  analysis: { label: 'Анализ', color: 'bg-navy-100 text-navy-700' },
  comment:  { label: 'Коментар', color: 'bg-crimson-100 text-crimson-700' },
  news:     { label: 'Новина', color: 'bg-green-100 text-green-700' },
}

export default function ArticleCard({ article }) {
  const cat = CATEGORY_LABELS[article.category] || CATEGORY_LABELS.analysis

  return (
    <Link to={`/komentari/${article.id}`} className="card group flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Снимка */}
      {article.image_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.color}`}>
            {cat.label}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(article.created_at).toLocaleDateString('bg-BG')}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 group-hover:text-navy-700 transition-colors line-clamp-2">
          {article.title}
        </h3>

        {article.summary && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
            {article.summary}
          </p>
        )}

        <div className="mt-4 flex items-center text-crimson-600 text-sm font-medium">
          Прочети
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
