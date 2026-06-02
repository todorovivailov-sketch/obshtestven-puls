import { getYouTubeEmbedUrl } from '../lib/media'

export function MediaCredit({ source }) {
  if (!source) return null

  let href = null
  try {
    href = new URL(source).href
  } catch {
    href = null
  }

  return (
    <figcaption className="mt-2 text-[11px] text-gray-400">
      Източник: {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="hover:text-navy-600 underline underline-offset-2">
          {source}
        </a>
      ) : source}
    </figcaption>
  )
}

export function VideoBlock({ url, title = 'Видео', className = '' }) {
  if (!url) return null

  const embedUrl = getYouTubeEmbedUrl(url)
  const frameClass = `w-full overflow-hidden bg-black shadow-md ${className}`

  if (embedUrl) {
    return (
      <div className={frameClass}>
        <iframe
          src={embedUrl}
          title={title}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className={frameClass}>
      <video src={url} controls className="aspect-video w-full bg-black" preload="metadata" />
    </div>
  )
}
