export const config = {
  matcher: [
    '/',
    '/anketi',
    '/anketi/:path*',
    '/rezultati',
    '/komentari',
    '/komentari/:path*',
    '/prevodach',
    '/prevodach/:path*',
    '/predlozheniya',
    '/kontakti',
  ],
}

const SITE_NAME = 'Обществен пулс'
const SITE_URL = 'https://obshtestvenpuls.online'
const COLORS = ['#0369a1', '#C0392B', '#D4AC0D', '#1A8754', '#7C3AED', '#0891B2', '#EA580C']

async function sb(path) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Accept': 'application/json',
    },
  })
  const data = await res.json()
  return Array.isArray(data) ? data : [data]
}

async function buildChart(results) {
  try {
    const labels = results.map(r => r.label)
    const votes = results.map(r => Number(r.vote_count))
    const percents = results.map(r => Number(r.percentage))
    const bgs = COLORS.slice(0, labels.length)
    const cfg = {
      type: 'bar',
      data: { labels, datasets: [{ data: percents, backgroundColor: bgs, borderRadius: 10, barPercentage: 0.6 }] },
      options: {
        layout: { padding: { top: 80, bottom: 30, left: 40, right: 40 } },
        plugins: {
          legend: { display: false },
          datalabels: { anchor: 'end', align: 'end', offset: 6, color: '#1e293b', font: { weight: 'bold', size: 22 }, formatter: v => `${v}%` },
        },
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { display: false }, grid: { display: false }, border: { display: false } },
          x: { ticks: { font: { size: 26, weight: 'bold' }, color: '#374151' }, grid: { display: false }, border: { display: false } },
        },
      },
    }
    const r = await fetch('https://quickchart.io/chart/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chart: cfg, width: 1200, height: 630, backgroundColor: 'white', devicePixelRatio: 1 }),
    })
    const json = await r.json()
    return json.url || null
  } catch { return null }
}

function html(title, description, image, pageUrl) {
  const e = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return new Response(`<!DOCTYPE html>
<html lang="bg"><head>
<meta charset="UTF-8">
<title>${e(title)}</title>
<meta property="og:site_name" content="${SITE_NAME}"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${e(title)}"/>
<meta property="og:description" content="${e(description)}"/>
<meta property="og:image" content="${image}"/>
<meta property="og:url" content="${pageUrl}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${e(title)}"/>
<meta name="twitter:description" content="${e(description)}"/>
<meta name="twitter:image" content="${image}"/>
</head><body></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || ''
  const isCrawler = /facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|vkShare/i.test(ua)
  if (!isCrawler) return

  const url = new URL(request.url)
  const path = url.pathname

  // Статични страници
  const staticPages = {
    '/':              ['Обществен пулс — Силистра и региона', 'Платформа за граждански анкети и анализи по актуални теми.'],
    '/anketi':        ['Анкети — Обществен пулс', 'Участвайте в активните граждански анкети за Силистра и региона.'],
    '/rezultati':     ['Резултати от анкети — Обществен пулс', 'Разгледайте резултатите от приключилите анкети.'],
    '/komentari':     ['Коментари и анализи — Обществен пулс', 'Четете коментари и анализи по актуални теми.'],
    '/prevodach':     ['Преводач на политики — Обществен пулс', 'Разбираем превод на политически документи.'],
    '/predlozheniya': ['Предложения за граждански анкети — Обществен пулс', 'Споделете идея за анкета с нас!'],
    '/kontakti':      ['Контакти — Обществен пулс', 'Свържете се с екипа на Обществен пулс.'],
  }
  if (staticPages[path]) {
    const [title, desc] = staticPages[path]
    return html(title, desc, `${SITE_URL}/logo.png`, url.href)
  }

  // Анкета /anketi/:id
  if (path.startsWith('/anketi/')) {
    const id = path.split('/')[2]
    if (id) {
      try {
        const [poll] = await sb(`polls?id=eq.${id}&select=question,description,image_url,results_published`)
        if (poll) {
          let title = poll.question || SITE_NAME
          let desc = poll.description || 'Гласувайте в анкетата на Обществен пулс.'
          let image = poll.image_url || `${SITE_URL}/logo.png`
          if (poll.results_published) {
            const results = await sb(`poll_results?poll_id=eq.${id}&select=label,vote_count,percentage&order=position.asc`)
            if (results?.length) {
              const chart = await buildChart(results)
              if (chart) image = chart
              const winner = results.reduce((a, b) => Number(a.vote_count) > Number(b.vote_count) ? a : b)
              desc = `Резултати: ${results.map(r => `${r.label} ${r.percentage}%`).join(' | ')}. Водещ: ${winner.label}`
            }
          }
          return html(title, desc, image, url.href)
        }
      } catch { /* fallback */ }
    }
  }

  // Статия /komentari/:id
  if (path.startsWith('/komentari/')) {
    const id = path.split('/')[2]
    if (id) {
      try {
        const [article] = await sb(`articles?id=eq.${id}&select=title,body,image_url`)
        if (article) {
          const desc = article.body ? article.body.replace(/<[^>]+>/g, '').slice(0, 160) : 'Коментари и анализи.'
          return html(article.title || SITE_NAME, desc, article.image_url || `${SITE_URL}/logo.png`, url.href)
        }
      } catch { /* fallback */ }
    }
  }

  // Превод /prevodach/:id
  if (path.startsWith('/prevodach/')) {
    const id = path.split('/')[2]
    if (id) {
      try {
        const [item] = await sb(`policy_translations?id=eq.${id}&select=title,body,image_url`)
        if (item) {
          const desc = item.body ? item.body.replace(/<[^>]+>/g, '').slice(0, 160) : 'Преводач на политики.'
          return html(item.title || SITE_NAME, desc, item.image_url || `${SITE_URL}/logo.png`, url.href)
        }
      } catch { /* fallback */ }
    }
  }
}
