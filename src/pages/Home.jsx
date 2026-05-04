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
      <section className="text-white" style={{ background: '#0B1833' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:min-h-[440px]">

          {/* Видео вляво */}
          <div className="md:w-5/12 p-5 md:p-8 flex items-center">
            <div className="w-full h-[220px] md:h-[300px] rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/hero-video.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          {/* Текст вдясно */}
          <div className="md:w-7/12 px-5 md:pl-6 md:pr-12 pb-10 md:py-0 flex flex-col justify-center md:border-l md:border-white/5">
            <div className="inline-flex items-center gap-2 border border-white/20 text-white/70 text-xs font-semibold px-3 py-1 rounded-full mb-7 uppercase tracking-widest w-fit">
              <span className="w-1.5 h-1.5 bg-crimson-400 rounded-full animate-pulse" />
              Граждански барометър · Силистра
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Вашият глас.<br />
              <span className="text-crimson-400">Обществен пулс.</span>
            </h1>
            <p className="text-white/80 text-sm md:text-base leading-relaxed mb-4">
              Платформа за анкети, коментари и анализи по обществено значими теми.
            </p>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              Тук може да участвате в анкети по политически, обществено значими и актуални теми, които засягат ежедневието в Силистра и региона.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/anketi" className="bg-crimson-600 hover:bg-crimson-700 text-white font-semibold px-7 py-2.5 rounded-lg transition-colors text-sm">
                Вижте анкетите
              </Link>
              <Link to="/komentari" className="border border-white/60 hover:border-white hover:bg-white/10 text-white font-semibold px-7 py-2.5 rounded-lg transition-all duration-200 text-sm">
                Четете анализи
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Актуално */}
      {!loading && (activePolls.length > 0 || articles.length > 0 || latestPolicy) && (
        <section style={{ background: '#0D1F3C' }} className="border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-stretch divide-x divide-white/8">

              {/* Лейбъл */}
              <div className="flex items-center gap-2 pr-6 py-4 shrink-0">
                <span className="w-1.5 h-1.5 bg-crimson-500 rounded-full animate-pulse shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">Актуално</span>
              </div>

              {/* Последна активна анкета */}
              {activePolls[0] && (
                <Link
                  to={`/anketi/${activePolls[0].id}`}
                  className="flex-1 flex items-center gap-3 px-6 py-4 group hover:bg-white/4 transition-colors min-w-0"
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest text-crimson-400 border border-crimson-800 px-2 py-0.5 rounded shrink-0">Анкета</span>
                  <span className="text-white/70 text-sm leading-snug line-clamp-1 group-hover:text-white transition-colors min-w-0 truncate">
                    {activePolls[0].question}
                  </span>
                  <svg className="w-3.5 h-3.5 text-white/20 group-hover:text-crimson-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              )}

              {/* Последен анализ */}
              {articles[0] && (
                <Link
                  to={`/komentari/${articles[0].id}`}
                  className="flex-1 flex items-center gap-3 px-6 py-4 group hover:bg-white/4 transition-colors min-w-0 hidden md:flex"
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 border border-white/10 px-2 py-0.5 rounded shrink-0">Анализ</span>
                  <span className="text-white/70 text-sm leading-snug line-clamp-1 group-hover:text-white transition-colors min-w-0 truncate">
                    {articles[0].title}
                  </span>
                  <svg className="w-3.5 h-3.5 text-white/20 group-hover:text-crimson-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              )}

              {/* Последна политика */}
              {latestPolicy && (
                <Link
                  to={`/prevodach/${latestPolicy.id}`}
                  className="flex-1 flex items-center gap-3 px-6 py-4 group hover:bg-white/4 transition-colors min-w-0 hidden lg:flex"
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 border border-white/10 px-2 py-0.5 rounded shrink-0">Политика</span>
                  <span className="text-white/70 text-sm leading-snug line-clamp-1 group-hover:text-white transition-colors min-w-0 truncate">
                    {latestPolicy.title}
                  </span>
                  <svg className="w-3.5 h-3.5 text-white/20 group-hover:text-crimson-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              )}

            </div>
          </div>
        </section>
      )}

      {/* Активни анкети */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/70">
          <h2 className="section-h text-xl">Активни анкети</h2>
          <Link to="/anketi" className="text-crimson-600 hover:text-crimson-700 text-sm font-medium flex items-center gap-1">
            Всички <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => <div key={i} className="card h-64 animate-pulse bg-gray-100" />)}
          </div>
        ) : activePolls.length === 1 ? (
          <PollCard poll={activePolls[0]} landscape />
        ) : activePolls.length > 1 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {activePolls.map(p => <PollCard key={p.id} poll={p} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">Няма активни анкети в момента.</div>
        )}
      </section>

      {/* Последни резултати */}
      {!loading && closedPolls.length > 0 && (
        <section className="py-12" style={{ background: '#EDE8DF' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300/50">
              <h2 className="section-h text-xl">Последни резултати</h2>
              <Link to="/rezultati" className="text-crimson-600 hover:text-crimson-700 text-sm font-medium flex items-center gap-1">
                Всички <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            {closedPolls.length === 1 ? (
              <PollCard poll={closedPolls[0]} showResults={true} landscape />
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {closedPolls.map(p => <PollCard key={p.id} poll={p} showResults={true} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Последно от Преводач на политики */}
      {!loading && latestPolicy && (
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/70">
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Политика</span>
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
      <section className="py-12" style={closedPolls.length === 0 ? { background: '#EDE8DF' } : {}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/70">
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
