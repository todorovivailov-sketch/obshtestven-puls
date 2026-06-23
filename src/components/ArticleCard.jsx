import { Link } from 'react-router-dom'
import { VideoThumb } from './MediaBlock'

const CATEGORY_LABELS = {
  analysis: 'Анализ',
  comment:  'Коментар',
  news:     'Новина',
}

export default function ArticleCard({ article }) {
  const catLabel = CATEGORY_LABELS[article.category] || 'Статия'

  return (
    <Link to={`/komentari/${article.id}`} className="article-card group">
      {/* Снимка */}
      {article.image_url ? (
        <div className="content-image-frame shrink-0">
          <img
            src={article.image_url}
            alt={article.title}
          />
        </div>
      ) : article.video_url ? (
        <div className="content-image-frame shrink-0">
          <VideoThumb url={article.video_url} alt={article.title} />
        </div>
      ) : null}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {catLabel}
          </span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-xs text-gray-400">
            {new Date(article.created_at).toLocaleDateString('bg-BG')}
          </span>
        </div>

        <h3 className="font-serif font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-navy-700 transition-colors line-clamp-2">
          {article.title}
        </h3>

        {article.summary && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
            {article.summary}
          </p>
        )}

        <div className="mt-4 flex items-center text-crimson-600 text-xs font-semibold uppercase tracking-wider">
          Прочети
          <svg className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
