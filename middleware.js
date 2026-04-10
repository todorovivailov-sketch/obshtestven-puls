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
const COLORS = ['#0369a1', '#C0392B', '#D4AC0D', '#1A8754', '#7C3AED', '#0891B2', '#EA580C', '#BE185D']

async function sbFetch(path) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Accept': 'application/json',
    },
  })
  const data = await res.json()
  return Array.isArray(data) ? data[0] : data
}

async function sbFetchAll(path) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Accept': 'application/json',
    },
  })
  return res.json()
}

function chartImageUrl(results) {
  const labels = results.map(r => r.label)
  const votes = results.map(r => Number(r.vote_count))
  const percents = results.map(r => Number(r.percentage))
  const bgs = COLORS.slice(0, labels.length)

  const cfg = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: votes,
        backgroundColor: bgs,
        borderRadius: 6,
      }],
    },
    options: {
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'top',
          color: '#1e293b',
          font: { weight: 'bold', size: 14 },
          formatter: (_, ctx) => `${percents[ctx.dataIndex]}%`,
        },
      },
      scales: {
        y: { beginAtZero: true, ticks: { display: false }, grid: { display: false } },
        x: { ticks: { font: { size: 13 } } },
      },
    },
  }

  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(cfg))}&width=600&height=350&backgroundColor=white`
}

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || ''
  const isCrawler = /facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|vkshare|w3c_validator/i.test(ua)

  if (!isCrawler) return

  const url = new URL(request.url)
  const path = url.pathname

  // ── Начална страница ─────────────────────────────────────────
  if (path === '/') {
    return ogResponse(
      'Обществен пулс — Силистра и региона',
      'Платформа за граждански анкети и анализи по актуални обществени и политически теми.',
      `${SITE_URL}/logo.png`, url.href
    )
  }

  // ── Списък анкети ────────────────────────────────────────────
  if (path === '/anketi') {
    return ogResponse(
      'Анкети — Обществен пулс',
      'Участвайте в активните граждански анкети за Силистра и региона.',
      `${SITE_URL}/logo.png`, url.href
    )
  }

  // ── Индивидуална анкета /anketi/:id ──────────────────────────
  if (path.startsWith('/anketi/')) {
    const id = path.split('/')[2]
    if (id) {
      try {
        const poll = await sbFetch(`polls?id=eq.${id}&select=question,description,image_url,results_published`)
        if (poll) {
          let image = poll.image_url || `${SITE_URL}/logo.png`
          let title = poll.question || `Анкета — ${SITE_NAME}`
          let desc = poll.description || 'Гласувайте в анкетата на Обществен пулс — Силистра и региона.'

          // Ако резултатите са публикувани → генерирай графика
          if (poll.results_published) {
            const results = await sbFetchAll(`poll_results?poll_id=eq.${id}&select=label,vote_count,percentage&order=position.asc`)
            if (Array.isArray(results) && results.length > 0) {
              image = chartImageUrl(results)
              const winner = results.reduce((a, b) => Number(a.vote_count) > Number(b.vote_count) ? a : b)
              desc = `Резултати: ${results.map(r => `${r.label} ${r.percentage}%`).join(' | ')}. Водещ: ${winner.label}`
            }
          }

          return ogResponse(title, desc, image, url.href)
        }
      } catch { /* fallback */ }
    }
  }

  // ── Резултати ────────────────────────────────────────────────
  if (path === '/rezultati') {
    return ogResponse(
      'Резултати от анкети — Обществен пулс',
      'Разгледайте резултатите от приключилите граждански анкети.',
      `${SITE_URL}/logo.png`, url.href
    )
  }

  // ── Списък коментари ─────────────────────────────────────────
  if (path === '/komentari') {
    return ogResponse(
      'Коментари и анализи — Обществен пулс',
      'Четете коментари и анализи по актуални теми за Силистра и региона.',
      `${SITE_URL}/logo.png`, url.href
    )
  }

  // ── Индивидуална статия /komentari/:id ───────────────────────
  if (path.startsWith('/komentari/')) {
    const id = path.split('/')[2]
    if (id) {
      try {
        const article = await sbFetch(`articles?id=eq.${id}&select=title,body,image_url`)
        if (article) {
          const desc = article.body
            ? article.body.replace(/<[^>]+>/g, '').slice(0, 160)
            : 'Коментари и анализи от Обществен пулс.'
          return ogResponse(
            article.title || `Коментари и анализи — ${SITE_NAME}`,
            desc,
            article.image_url || `${SITE_URL}/logo.png`,
            url.href
          )
        }
      } catch { /* fallback */ }
    }
  }

  // ── Преводач (списък) ────────────────────────────────────────
  if (path === '/prevodach') {
    return ogResponse(
      'Преводач на политики — Обществен пулс',
      'Разбираем превод на политически документи и решения за гражданите на Силистра.',
      `${SITE_URL}/logo.png`, url.href
    )
  }

  // ── Индивидуален превод /prevodach/:id ───────────────────────
  if (path.startsWith('/prevodach/')) {
    const id = path.split('/')[2]
    if (id) {
      try {
        const item = await sbFetch(`policy_translations?id=eq.${id}&select=title,body,image_url`)
        if (item) {
          const desc = item.body
            ? item.body.replace(/<[^>]+>/g, '').slice(0, 160)
            : 'Преводач на политики от Обществен пулс.'
          return ogResponse(
            item.title || `Преводач на политики — ${SITE_NAME}`,
            desc,
            item.image_url || `${SITE_URL}/logo.png`,
            url.href
          )
        }
      } catch { /* fallback */ }
    }
  }

  // ── Предложения ──────────────────────────────────────────────
  if (path === '/predlozheniya') {
    return ogResponse(
      'Предложения за граждански анкети — Обществен пулс',
      'Имате идея за анкета по важна тема за Силистра и региона? Споделете я с нас!',
      `${SITE_URL}/logo.png`, url.href
    )
  }

  // ── Контакти ─────────────────────────────────────────────────
  if (path === '/kontakti') {
    return ogResponse(
      'Контакти — Обществен пулс',
      'Свържете се с екипа на Обществен пулс — Силистра и региона.',
      `${SITE_URL}/logo.png`, url.href
    )
  }
}

function ogResponse(title, description, image, pageUrl) {
  const e = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return new Response(
    `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <title>${e(title)}</title>
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${e(title)}" />
  <meta property="og:description" content="${e(description)}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${e(title)}" />
  <meta name="twitter:description" content="${e(description)}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body></body>
</html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}
