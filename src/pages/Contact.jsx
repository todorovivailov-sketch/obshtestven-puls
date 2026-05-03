import { useState } from 'react'
import { contactApi } from '../lib/api'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null) // 'sending' | 'ok' | 'error'

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const res = await contactApi.send(form)
    if (res.success) {
      setStatus('ok')
      setForm({ name: '', email: '', message: '' })
    } else {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="page-header">
        <h1 className="font-serif text-2xl font-bold text-navy-800 mb-1">Контакти</h1>
        <p className="text-gray-500 text-sm">Изпратете ни съобщение — ще се свържем с вас.</p>
      </div>

      <div className="card p-8">
        {status === 'ok' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Съобщението е изпратено!</h3>
            <p className="text-gray-500 mb-6">Ще се свържем с вас в рамките на 1-2 работни дни.</p>
            <button onClick={() => setStatus(null)} className="btn-outline">Изпрати ново</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Вашето име</label>
              <input
                className="input"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Иван Иванов"
                required
              />
            </div>
            <div>
              <label className="label">Имейл адрес</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="ivan@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Съобщение</label>
              <textarea
                className="input resize-none"
                rows={5}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Вашето съобщение..."
                required
              />
            </div>

            {status === 'error' && (
              <p className="text-crimson-600 text-sm">Грешка при изпращане. Опитайте отново.</p>
            )}

            <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
              {status === 'sending' ? 'Изпращане...' : 'Изпрати съобщение'}
            </button>
          </form>
        )}
      </div>

      {/* Автор */}
      <div className="mt-8 card p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Лице за контакт</div>
          <div className="text-sm font-semibold text-gray-800">Станислав Тодоров</div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Имейл</div>
            <div className="text-sm font-medium text-gray-800">obshtestvenpuls@gmail.com</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-crimson-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-crimson-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Местоположение</div>
            <div className="text-sm font-medium text-gray-800">Силистра и региона</div>
          </div>
        </div>
      </div>

      {/* Реклама */}
      <div className="mt-4 card p-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Връзка за реклама</div>
            <div className="text-sm font-medium text-gray-800">obshtestvenpuls@gmail.com</div>
            <div className="text-xs text-gray-400 mt-0.5">За рекламни запитвания и партньорства</div>
          </div>
        </div>
      </div>
    </div>
  )
}
