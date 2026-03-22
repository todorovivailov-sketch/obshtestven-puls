import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PollCard from '../components/PollCard'
import ArticleCard from '../components/ArticleCard'
import { pollsApi, articlesApi } from '../lib/api'

export default function Home() {
  const [polls, setPolls] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      pollsApi.getAll('active'),
      articlesApi.getAll(),
    ]).then(([p, a]) => {
      setPolls(Array.isArray(p) ? p.slice(0, 2) : [])
      setArticles(Array.isArray(a) ? a.slice(0, 3) : [])
      setLoading(false)
    })
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-700 via-navy-700 to-navy-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-crimson-600/20 border border-crimson-500/30 text-crimson-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-crimson-400 rounded-full animate-pulse" />
            Граждански барометър
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Вашият глас.<br />
            <span className="text-crimson-400">Обществен пулс.</span>
          </h1>
          <p className="text-navy-200 text-lg mb-8 max-w-xl mx-auto">
            Независима платформа за граждански анкети и задълбочени анализи по актуални политически и обществени теми.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/anketi" className="btn-primary">Вижте анкетите</Link>
            <Link to="/komentari" className="btn-outline border-white/40 text-white hover:bg-white hover:text-navy-700">Четете анализи</Link>
          </div>
        </div>
      </section>

      {/* Активни анкети */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy-700">Активни анкети</h2>
          <Link to="/anketi" className="text-crimson-600 hover:text-crimson-700 text-sm font-medium flex items-center gap-1">
            Всички
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => <div key={i} className="card h-64 animate-pulse bg-gray-100" />)}
          </div>
        ) : polls.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {polls.map(p => <PollCard key={p.id} poll={p} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">Няма активни анкети в момента.</div>
        )}
      </section>

      {/* Последни анализи */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-navy-700">Последни анализи</h2>
            <Link to="/komentari" className="text-crimson-600 hover:text-crimson-700 text-sm font-medium flex items-center gap-1">
              Всички
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
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
            <div className="text-center py-12 text-gray-500">Няма публикувани статии.</div>
          )}
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-navy-700 py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-6 text-center text-white">
          <div>
            <div className="text-3xl font-bold text-crimson-400">100%</div>
            <div className="text-navy-200 text-sm mt-1">Анонимно гласуване</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-crimson-400">0</div>
            <div className="text-navy-200 text-sm mt-1">Регистрация не е нужна</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-crimson-400">24/7</div>
            <div className="text-navy-200 text-sm mt-1">Актуални резултати</div>
          </div>
        </div>
      </section>
    </div>
  )
}
