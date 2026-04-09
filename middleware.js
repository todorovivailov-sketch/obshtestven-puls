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
const DEFAULT_IMAGE = '/logo.png'

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || ''
  const isCrawler = /facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|vkshare|w3c_validator/i.test(ua)

  if (!isCrawler) return // обикновен потребител → минава към React SPA

  const url = new URL(request.url)
  const origin = url.origin
  const path = url.pathname

  // ── Начална страница ──────────────────────────────────────────
  if (path === '/') {
    return ogResponse(
      'Обществен пулс — Силистра и региона',
      'Платформа за граждански анкети и анализи по актуални обществени и политически теми.',
      `${origin}${DEFAULT_IMAGE}`,
      url.href
    )
  }

  // ── Списък анкети ─────────────────────────────────────────────
  if (path === '/anketi') {
    return ogResponse(
      'Анкети — Обществен пулс',
      'Участвайте в активните граждански анкети за Силистра и региона.',
      `${origin}${DEFAULT_IMAGE}`,
      url.href
    )
  }

  // ── Индивидуална анкета /anketi/:id ───────────────────────────
  if (path.startsWith('/anketi/')) {
    const id = path.split('/')[2]
    if (id) {
      try {
        const res = await fetch(`${origin}/api/polls?id=${id}`)
        const poll = await res.json()
        const title = poll.question || `Анкета — ${SITE_NAME}`
        const description = poll.description || 'Гласувайте в анкетата на Обществен пулс — Силистра и региона.'
        const image = poll.image_url || `${origin}${DEFAULT_IMAGE}`
        return ogResponse(title, description, image, url.href)
      } catch { /* продължи с default */ }
    }
  }

  // ── Резултати ─────────────────────────────────────────────────
  if (path === '/rezultati') {
    return ogResponse(
      'Резултати от анкети — Обществен пулс',
      'Разгледайте резултатите от приключилите граждански анкети.',
      `${origin}${DEFAULT_IMAGE}`,
      url.href
    )
  }

  // ── Списък коментари и анализи ────────────────────────────────
  if (path === '/komentari') {
    return ogResponse(
      'Коментари и анализи — Обществен пулс',
      'Четете коментари и анализи по актуални теми за Силистра и региона.',
      `${origin}${DEFAULT_IMAGE}`,
      url.href
    )
  }

  // ── Индивидуална статия /komentari/:id ────────────────────────
  if (path.startsWith('/komentari/')) {
    const id = path.split('/')[2]
    if (id) {
      try {
        const res = await fetch(`${origin}/api/articles?id=${id}`)
        const article = await res.json()
        const title = article.title || `Коментари и анализи — ${SITE_NAME}`
        const description = article.body
          ? article.body.replace(/<[^>]+>/g, '').slice(0, 160)
          : 'Коментари и анализи от Обществен пулс.'
        const image = article.image_url || `${origin}${DEFAULT_IMAGE}`
        return ogResponse(title, description, image, url.href)
      } catch { /* продължи с default */ }
    }
  }

  // ── Преводач на политики (списък) ─────────────────────────────
  if (path === '/prevodach') {
    return ogResponse(
      'Преводач на политики — Обществен пулс',
      'Разбираем превод на политически документи и решения за гражданите на Силистра.',
      `${origin}${DEFAULT_IMAGE}`,
      url.href
    )
  }

  // ── Индивидуален превод /prevodach/:id ────────────────────────
  if (path.startsWith('/prevodach/')) {
    const id = path.split('/')[2]
    if (id) {
      try {
        const res = await fetch(`${origin}/api/policy-translations?id=${id}`)
        const item = await res.json()
        const title = item.title || `Преводач на политики — ${SITE_NAME}`
        const description = item.body
          ? item.body.replace(/<[^>]+>/g, '').slice(0, 160)
          : 'Преводач на политики от Обществен пулс.'
        const image = item.image_url || `${origin}${DEFAULT_IMAGE}`
        return ogResponse(title, description, image, url.href)
      } catch { /* продължи с default */ }
    }
  }

  // ── Предложения ───────────────────────────────────────────────
  if (path === '/predlozheniya') {
    return ogResponse(
      'Предложения за граждански анкети — Обществен пулс',
      'Имате идея за анкета по важна тема за Силистра и региона? Споделете я с нас!',
      `${origin}${DEFAULT_IMAGE}`,
      url.href
    )
  }

  // ── Контакти ──────────────────────────────────────────────────
  if (path === '/kontakti') {
    return ogResponse(
      'Контакти — Обществен пулс',
      'Свържете се с екипа на Обществен пулс — Силистра и региона.',
      `${origin}${DEFAULT_IMAGE}`,
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
  <meta property="og:site_name" content="${SITE_NAME}" />
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
