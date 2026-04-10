import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const SITE_NAME = 'Обществен пулс'
const SITE_URL = 'https://obshtestvenpuls.online'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(204).end()

  const { type, id } = req.query

  let title = SITE_NAME
  let description = 'Платформа за граждански анкети и анализи — Силистра и региона.'
  let image = `${SITE_URL}/logo.png`
  let pageUrl = SITE_URL

  try {
    if (type === 'poll' && id) {
      pageUrl = `${SITE_URL}/anketi/${id}`
      const { data: poll } = await supabase
        .from('polls')
        .select('question,description,image_url,results_published')
        .eq('id', id)
        .single()

      if (poll) {
        title = poll.question || SITE_NAME
        description = poll.description || 'Гласувайте в анкетата на Обществен пулс — Силистра и региона.'
        image = poll.image_url || `${SITE_URL}/logo.png`

        if (poll.results_published) {
          const { data: results } = await supabase
            .from('poll_results')
            .select('label,vote_count,percentage')
            .eq('poll_id', id)
            .order('position')

          if (results?.length) {
            const chartImg = await buildChartUrl(results)
            if (chartImg) image = chartImg
            const winner = results.reduce((a, b) => Number(a.vote_count) > Number(b.vote_count) ? a : b)
            description = `Резултати: ${results.map(r => `${r.label} ${r.percentage}%`).join(' | ')}. Водещ: ${winner.label}`
          }
        }
      }
    }

    if (type === 'article' && id) {
      pageUrl = `${SITE_URL}/komentari/${id}`
      const { data: article } = await supabase
        .from('articles')
        .select('title,body,image_url')
        .eq('id', id)
        .single()

      if (article) {
        title = article.title || SITE_NAME
        description = article.body ? article.body.replace(/<[^>]+>/g, '').slice(0, 160) : description
        image = article.image_url || `${SITE_URL}/logo.png`
      }
    }

    if (type === 'policy' && id) {
      pageUrl = `${SITE_URL}/prevodach/${id}`
      const { data: item } = await supabase
        .from('policy_translations')
        .select('title,body,image_url')
        .eq('id', id)
        .single()

      if (item) {
        title = item.title || SITE_NAME
        description = item.body ? item.body.replace(/<[^>]+>/g, '').slice(0, 160) : description
        image = item.image_url || `${SITE_URL}/logo.png`
      }
    }
  } catch (err) {
    console.error('OG error:', err)
  }

  const e = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.send(`<!DOCTYPE html>
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
</html>`)
}

async function buildChartUrl(results) {
  try {
    const labels = results.map(r => r.label)
    const votes = results.map(r => Number(r.vote_count))
    const percents = results.map(r => Number(r.percentage))
    const bgs = ['#0369a1', '#C0392B', '#D4AC0D', '#1A8754', '#7C3AED', '#0891B2', '#EA580C'].slice(0, labels.length)

    const cfg = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: votes,
          backgroundColor: bgs,
          borderRadius: 10,
          barPercentage: 0.6,
        }],
      },
      options: {
        layout: { padding: { top: 80, bottom: 30, left: 40, right: 40 } },
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: 'end',
            align: 'end',
            offset: 6,
            color: '#1e293b',
            font: { weight: 'bold', size: 22 },
            formatter: (_, ctx) => `${percents[ctx.dataIndex]}%`,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(...percents) + 20,
            ticks: { display: false },
            grid: { display: false },
            border: { display: false },
          },
          x: {
            ticks: { font: { size: 18, weight: 'bold' }, color: '#374151' },
            grid: { display: false },
            border: { display: false },
          },
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
  } catch {
    return null
  }
}
