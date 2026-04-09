import { useState } from 'react'

export default function Suggestions() {
  const [form, setForm] = useState({ email: '', suggestion: '' })
  const [status, setStatus] = useState(null) // 'sending' | 'ok' | 'error'

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).then(r => r.json())

      if (res.success) {
        setStatus('ok')
        setForm({ email: '', suggestion: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-700 mb-2">Предложения за граждански анкети</h1>
        <p className="text-gray-500">Имате идея за анкета, която да засегне важна тема за Силистра и региона? Споделете я с нас!</p>
      </div>

      <div className="card p-8">
        {status === 'ok' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Предложението е изпратено!</h3>
            <p className="text-gray-500 mb-6">Благодарим ви! Ще разгледаме вашата идея.</p>
            <button onClick={() => setStatus(null)} className="btn-outline">Изпрати ново предложение</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className="label">Вашето предложение</label>
              <textarea
                className="input resize-none"
                rows={6}
                value={form.suggestion}
                onChange={e => setForm({ ...form, suggestion: e.target.value })}
                placeholder="Опишете темата, която смятате за важна и за която искате да се проведе анкета..."
                required
              />
            </div>

            {status === 'error' && (
              <p className="text-crimson-600 text-sm">Грешка при изпращане. Опитайте отново.</p>
            )}

            <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
              {status === 'sending' ? 'Изпращане...' : 'Изпрати предложението'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 card p-5 bg-blue-50 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">Как работи?</p>
            <p className="text-sm text-blue-700">Изпращате предложение, екипът ни го разглежда и при достатъчен обществен интерес публикуваме анкетата на сайта.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
