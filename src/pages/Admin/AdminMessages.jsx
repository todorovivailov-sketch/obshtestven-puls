import { useEffect, useState } from 'react'
import { contactApi } from '../../lib/api'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    contactApi.getAll().then(data => {
      setMessages(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-navy-700 mb-8">Контактни съобщения</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : messages.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">Няма съобщения.</div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className="card overflow-hidden">
              <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
              >
                <div className="w-9 h-9 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 font-bold text-sm shrink-0">
                  {msg.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{msg.name}</div>
                  <div className="text-sm text-gray-500 truncate">{msg.email}</div>
                </div>
                <div className="text-xs text-gray-400 shrink-0">
                  {new Date(msg.created_at).toLocaleDateString('bg-BG')}
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expanded === msg.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {expanded === msg.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                  <a
                    href={`mailto:${msg.email}`}
                    className="inline-flex items-center gap-1 mt-4 text-sm text-navy-600 hover:text-navy-800 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Отговори на {msg.email}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
