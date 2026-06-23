export function getYouTubeEmbedUrl(url) {
  if (!url) return null

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/embed/')) return url
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/').filter(Boolean)[1]
        return id ? `https://www.youtube.com/embed/${id}` : null
      }
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
  } catch {
    return null
  }

  return null
}

export function isYouTubeUrl(url) {
  return Boolean(getYouTubeEmbedUrl(url))
}

export function getYouTubeThumbnail(url) {
  const embed = getYouTubeEmbedUrl(url)
  if (!embed) return null
  const id = embed.split('/embed/')[1]?.split(/[?&]/)[0]
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
