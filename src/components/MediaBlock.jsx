import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../lib/media'

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
      <video src={`${url}#t=0.1`} controls className="aspect-video w-full bg-black" preload="metadata" />
    </div>
  )
}

// Статичен кадър от видео за карти/тизъри (показва се вместо празно бяло поле)
export function VideoThumb({ url, alt = 'Видео' }) {
  if (!url) return null

  const thumb = getYouTubeThumbnail(url)

  return (
    <div className="relative">
      {thumb ? (
        <img src={thumb} alt={alt} />
      ) : (
        <video src={`${url}#t=0.1`} muted playsInline preload="metadata" className="block w-full h-auto" />
      )}
      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-black/55">
          <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </div>
  )
}
