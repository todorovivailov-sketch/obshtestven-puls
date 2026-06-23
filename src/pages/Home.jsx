import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PollCard from '../components/PollCard'
import ArticleCard from '../components/ArticleCard'
import { VideoThumb } from '../components/MediaBlock'
import { pollsApi, articlesApi, policyTranslationsApi } from '../lib/api'

export default function Home() {
  const [activePolls, setActivePolls] = useState([])
  const [closedPolls, setClosedPolls] = useState([])
  const [articles, setArticles] = useState([])
  const [latestPolicy, setLatestPolicy] = useState(null)
  const [recentItems, setRecentItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      pollsApi.getAll('active'),
      pollsApi.getHomeResults(),
      articlesApi.getAll(),
      policyTranslationsApi.getAll(),
    ]).then(([active, homeResults, arts, policies]) => {
      const activePollsArr = Array.isArray(active.value) ? active.value : []
      const artsArr = Array.isArray(arts.value) ? arts.value : []
      const policiesArr = Array.isArray(policies.value) ? policies.value : []

      setActivePolls(activePollsArr)
      setClosedPolls(Array.isArray(homeResults.value) ? homeResults.value.slice(0, 2) : [])
      setArticles(artsArr.slice(0, 3))
      setLatestPolicy(policiesArr.length > 0 ? policiesArr[0] : null)

      // Актуално: обединяваме всичко, сортираме по дата, вземаме 3 най-нови
      const all = [
        ...activePollsArr.map(d => ({ type: 'poll', data: d, date: d.start_date || d.created_at })),
        ...artsArr.map(d => ({ type: 'article', data: d, date: d.created_at || d.published_at })),
        ...policiesArr.map(d => ({ type: 'policy', data: d, date: d.created_at })),
      ]
      all.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      setRecentItems(all.slice(0, 3))

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
      {!loading && recentItems.length > 0 && (
        <section className="py-12" style={{ background: '#EDE8DF' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300/50">
              <h2 className="section-h text-xl">Актуално</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recentItems.map((item, i) => {
                if (item.type === 'poll') return (
                  <Link key={i} to={`/anketi/${item.data.id}`} className="article-card group flex flex-col">
                    {item.data.image_url ? (
                      <div className="content-image-frame">
                        <img src={item.data.image_url} alt={item.data.question} />
                      </div>
                    ) : item.data.video_url ? (
                      <div className="content-image-frame">
                        <VideoThumb url={item.data.video_url} alt={item.data.question} />
                      </div>
                    ) : null}
                    <div className="p-5 flex flex-col flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-crimson-600 mb-2">Анкета</span>
                      <p className="font-serif font-bold text-navy-800 leading-snug line-clamp-3 flex-1">{item.data.question}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {item.data.start_date && new Date(item.data.start_date).toLocaleDateString('bg-BG')}
                        </span>
                        <span className="text-xs text-crimson-600 font-medium">Гласувай →</span>
                      </div>
                    </div>
                  </Link>
                )
                if (item.type === 'article') return (
                  <Link key={i} to={`/komentari/${item.data.id}`} className="article-card group flex flex-col">
                    {item.data.image_url ? (
                      <div className="content-image-frame">
                        <img src={item.data.image_url} alt={item.data.title} />
                      </div>
                    ) : item.data.video_url ? (
                      <div className="content-image-frame">
                        <VideoThumb url={item.data.video_url} alt={item.data.title} />
                      </div>
                    ) : null}
                    <div className="p-5 flex flex-col flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        {item.data.category === 'analysis' ? 'Анализ' : item.data.category === 'comment' ? 'Коментар' : 'Новина'}
                      </span>
                      <p className="font-serif font-bold text-navy-800 leading-snug line-clamp-3 flex-1">{item.data.title}</p>
                      <div className="mt-4">
                        <span className="text-xs text-crimson-600 font-medium">Прочети →</span>
                      </div>
                    </div>
                  </Link>
                )
                if (item.type === 'policy') return (
                  <Link key={i} to={`/prevodach/${item.data.id}`} className="article-card group flex flex-col">
                    {item.data.image_url ? (
                      <div className="content-image-frame">
                        <img src={item.data.image_url} alt={item.data.title} />
                      </div>
                    ) : item.data.video_url ? (
                      <div className="content-image-frame">
                        <VideoThumb url={item.data.video_url} alt={item.data.title} />
                      </div>
                    ) : null}
                    <div className="p-5 flex flex-col flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Политика</span>
                      <p className="font-serif font-bold text-navy-800 leading-snug line-clamp-3 flex-1">{item.data.title}</p>
                      <div className="mt-4">
                        <span className="text-xs text-crimson-600 font-medium">Прочети →</span>
                      </div>
                    </div>
                  </Link>
                )
                return null
              })}
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
                <div className="content-image-frame md:w-72 shrink-0">
                  <img src={latestPolicy.image_url} alt={latestPolicy.title} />
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
