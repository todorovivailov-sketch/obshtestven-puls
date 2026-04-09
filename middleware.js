export const config = {
  matcher: ['/anketi/:path*', '/predlozheniya', '/komentari/:path*', '/prevodach/:path*'],
}

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || ''
  const isCrawler = /facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|vkshare|w3c_validator/i.test(ua)

  if (!isCrawler) return // обикновен потребител → минава към React SPA

  const url = new URL(request.url)
  const origin = url.origin

  // --- Индивидуална анкета /anketi/:id ---
  if (url.pathname.startsWith('/anketi/')) {
    const id = url.pathname.split('/')[2]
    if (id && id !== 'undefined') {
      try {
        const res = await fetch(`${origin}/api/polls?id=${id}`)
        const poll = await res.json()
        const title = poll.question || 'Анкета — Обществен пулс'
        const description = poll.description || 'Гласувайте в анкетата на Обществен пулс — Силистра и региона.'
        const image = poll.image_url || `${origin}/logo.png`
        return ogResponse(title, description, image, url.href)
      } catch {
        // при грешка — продължи с default
      }
    }
  }

  // --- Индивидуална статия /komentari/:id ---
  if (url.pathname.startsWith('/komentari/')) {
    const id = url.pathname.split('/')[2]
    if (id && id !== 'undefined') {
      try {
        const res = await fetch(`${origin}/api/articles?id=${id}`)
        const article = await res.json()
        const title = article.title || 'Коментари и анализи — Обществен пулс'
        const description = article.body
          ? article.body.replace(/<[^>]+>/g, '').slice(0, 160)
          : 'Коментари и анализи от Обществен пулс.'
        const image = article.image_url || `${origin}/logo.png`
        return ogResponse(title, description, image, url.href)
      } catch {
        // при грешка — продължи с default
      }
    }
  }

  // --- Индивидуален превод /prevodach/:id ---
  if (url.pathname.startsWith('/prevodach/')) {
    const id = url.pathname.split('/')[2]
    if (id && id !== 'undefined') {
      try {
        const res = await fetch(`${origin}/api/policy-translations?id=${id}`)
        const item = await res.json()
        const title = item.title || 'Преводач на политики — Обществен пулс'
        const description = item.body
          ? item.body.replace(/<[^>]+>/g, '').slice(0, 160)
          : 'Преводач на политики от Обществен пулс.'
        const image = item.image_url || `${origin}/logo.png`
        return ogResponse(title, description, image, url.href)
      } catch {
        // при грешка — продължи с default
      }
    }
  }

  // --- Страница за предложения /predlozheniya ---
  if (url.pathname === '/predlozheniya') {
    return ogResponse(
      'Предложения за граждански анкети — Обществен пулс',
      'Имате идея за анкета по важна тема за Силистра и региона? Споделете я с нас!',
      `${origin}/logo.png`,
      url.href
    )
  }
}

function ogResponse(title, description, image, pageUrl) {
  const safeTitle = title.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const safeDesc = description.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return new Response(
    `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle}</title>
  <meta property="og:site_name" content="Обществен пулс" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body></body>
</html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}
