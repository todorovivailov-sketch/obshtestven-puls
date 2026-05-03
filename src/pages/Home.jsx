import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PollCard from '../components/PollCard'
import ArticleCard from '../components/ArticleCard'
import { pollsApi, articlesApi, policyTranslationsApi } from '../lib/api'

export default function Home() {
  const [activePolls, setActivePolls] = useState([])
  const [closedPolls, setClosedPolls] = useState([])
  const [articles, setArticles] = useState([])
  const [latestPolicy, setLatestPolicy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      pollsApi.getAll('active'),
      pollsApi.getHomeResults(),
      articlesApi.getAll(),
      policyTranslationsApi.getAll(),
    ]).then(([active, homeResults, arts, policies]) => {
      setActivePolls(Array.isArray(active.value) ? active.value : [])
      setClosedPolls(Array.isArray(homeResults.value) ? homeResults.value.slice(0, 2) : [])
      setArticles(Array.isArray(arts.value) ? arts.value.slice(0, 3) : [])
      setLatestPolicy(Array.isArray(policies.value) && policies.value.length > 0 ? policies.value[0] : null)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative text-white overflow-hidden" style={{ minHeight: '480px' }}>
        {/* Видео фон */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay — тъмен отгоре и отдолу, по-прозрачен в средата */}
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, rgba(11,24,51,0.75) 0%, rgba(11,24,51,0.55) 50%, rgba(11,24,51,0.80) 100%)' }} />

        {/* Съдържание */}
        <div className="relative z-20 max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 border border-white/20 text-white/70 text-xs font-semibold px-3 py-1 rounded-full mb-8 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-crimson-400 rounded-full animate-pulse" />
            Граждански барометър · Силистра
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Вашият глас.<br />
            <span className="text-crimson-400">Обществен пулс.</span>
          </h1>
          <p className="text-white/80 text-base leading-relaxed mb-5 max-w-3xl mx-auto">
            Платформа за анкети – място, където мнението на хората има значение. Тук можете да участвате в анкети по политически, обществено значими и актуални теми, които засягат ежедневието в нашия регион.
          </p>
          <p className="text-white/70 text-base leading-relaxed mb-10 max-w-2xl mx-auto">
            Всички резултати от проведените анкети ще бъдат публикувани на сайта. Нашата цел е да създадем пространство за активна гражданска позиция.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/anketi" className="bg-crimson-600 hover:bg-crimson-700 text-white font-semibold px-7 py-2.5 rounded-lg transition-colors text-sm">
              Вижте анкетите
            </Link>
            <Link to="/komentari" className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-7 py-2.5 rounded-lg transition-colors text-sm">
              Четете анализи
            </Link>
          </div>
        </div>
      </section>

      {/* Активни анкети */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-h text-xl">Активни анкети</h2>
          <Link to="/anketi" className="text-crimson-600 hover:text-crimson-700 text-sm font-medium flex items-center gap-1">
            Всички <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => <div key={i} className="card h-64 animate-pulse bg-gray-100" />)}
          </div>
        ) : activePolls.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {activePolls.map(p => <PollCard key={p.id} poll={p} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">Няма активни анкети в момента.</div>
        )}
      </section>

      {/* Последни резултати */}
      {!loading && closedPolls.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-h text-xl">Последни резултати</h2>
              <Link to="/rezultati" className="text-crimson-600 hover:text-crimson-700 text-sm font-medium flex items-center gap-1">
                Всички <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {closedPolls.map(p => <PollCard key={p.id} poll={p} showResults={true} />)}
            </div>
          </div>
        </section>
      )}

      {/* Последно от Преводач на политики */}
      {!loading && latestPolicy && (
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-h text-xl">Преводач на политики</h2>
              <Link to="/prevodach" className="text-crimson-600 hover:text-crimson-700 text-sm font-medium flex items-center gap-1">
                Всички <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <Link to={`/prevodach/${latestPolicy.id}`} className="card group flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition-shadow">
              {latestPolicy.image_url && (
                <div className="md:w-72 h-48 md:h-auto shrink-0 overflow-hidden">
                  <img src={latestPolicy.image_url} alt={latestPolicy.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-6 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-3">Политика</span>
                <h3 className="font-serif text-xl font-bold text-navy-800 mb-2">{latestPolicy.title}</h3>
                {latestPolicy.body && (
                  <p className="text-gray-500 text-sm line-clamp-3">{latestPolicy.body.replace(/<[^>]+>/g, '').slice(0, 200)}</p>
                )}
                <span className="mt-4 text-crimson-600 text-sm font-medium">Прочети повече →</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Последни анализи */}
      <section className={closedPolls.length > 0 ? 'py-12' : 'bg-gray-50 py-12'}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-h text-xl">Последни анализи</h2>
            <Link to="/komentari" className="text-crimson-600 hover:text-crimson-700 text-sm font-medium flex items-center gap-1">
              Всички <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
    </div>
  )
}
