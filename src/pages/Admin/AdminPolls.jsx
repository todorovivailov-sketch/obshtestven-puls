import { useEffect, useState } from 'react'
import { pollsApi } from '../../lib/api'
import PollChart from '../../components/PollChart'

const EMPTY_FORM = { question: '', description: '', ends_at: '', options: ['', ''] }

export default function AdminPolls() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  async function loadPolls() {
    const [active, closed] = await Promise.all([
      pollsApi.getAll('active'),
      pollsApi.getAll('closed'),
    ])
    setPolls([
      ...(Array.isArray(active) ? active : []),
      ...(Array.isArray(closed) ? closed : []),
    ])
    setLoading(false)
  }

  useEffect(() => { loadPolls() }, [])

  function addOption() {
    setForm(f => ({ ...f, options: [...f.options, ''] }))
  }

  function removeOption(i) {
    setForm(f => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }))
  }

  function updateOption(i, val) {
    setForm(f => {
      const opts = [...f.options]
      opts[i] = val
      return { ...f, options: opts }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const opts = form.options.filter(o => o.trim())
    if (opts.length < 2) { setError('Добавете поне 2 отговора.'); return }
    setSaving(true)
    setError(null)
    const res = await pollsApi.create({
      question: form.question,
      description: form.description,
      ends_at: form.ends_at || null,
      options: opts,
    })
    if (res.id) {
      setForm(EMPTY_FORM)
      setShowForm(false)
      loadPolls()
    } else {
      setError(res.error || 'Грешка при запис')
    }
    setSaving(false)
  }

  async function toggleStatus(poll) {
    const newStatus = poll.status === 'active' ? 'closed' : 'active'
    await pollsApi.update({ id: poll.id, status: newStatus })
    loadPolls()
  }

  async function handleDelete(id) {
    if (!confirm('Изтрийте тази анкета? Всички гласове ще бъдат изтрити.')) return
    await pollsApi.delete(id)
    loadPolls()
  }

  async function loadResults(poll) {
    if (expandedId === poll.id) { setExpandedId(null); return }
    const { results } = await pollsApi.getOne(poll.id)
    setPolls(ps => ps.map(p => p.id === poll.id ? { ...p, results } : p))
    setExpandedId(poll.id)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-navy-700">Анкети</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Отказ' : '+ Нова анкета'}
        </button>
      </div>

      {/* Форма за нова анкета */}
      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-navy-700 mb-5">Нова анкета</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Въпрос *</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })}
                placeholder="Въведете въпроса на анкетата..."
                required
              />
            </div>

            <div>
              <label className="label">Описание (незадължително)</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Допълнителна информация за анкетата..."
              />
            </div>

            <div>
              <label className="label">Приключва на (незадължително)</label>
              <input
                type="datetime-local"
                className="input"
                value={form.ends_at}
                onChange={e => setForm({ ...form, ends_at: e.target.value })}
              />
            </div>

            {/* Варианти за отговор */}
            <div>
              <label className="label">Варианти за отговор *</label>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className="input"
                      value={opt}
                      onChange={e => updateOption(i, e.target.value)}
                      placeholder={`Вариант ${i + 1}`}
                    />
                    {form.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="px-3 py-2 text-crimson-600 hover:bg-crimson-50 rounded-lg transition-colors"
                        title="Изтрий вариант"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-3 text-sm text-navy-600 hover:text-navy-800 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Добави вариант
              </button>
            </div>

            {error && <p className="text-crimson-600 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Публикуване...' : 'Публикувай анкетата'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} className="btn-outline">
                Отказ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Списък анкети */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : polls.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">Няма анкети. Създайте първата!</div>
      ) : (
        <div className="space-y-4">
          {polls.map(poll => (
            <div key={poll.id} className="card">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {poll.status === 'active'
                        ? <span className="badge-active"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Активна</span>
                        : <span className="badge-closed">Приключила</span>
                      }
                    </div>
                    <h3 className="font-semibold text-gray-900">{poll.question}</h3>
                    {poll.ends_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Приключва: {new Date(poll.ends_at).toLocaleDateString('bg-BG')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => loadResults(poll)}
                      className="text-sm text-navy-600 hover:text-navy-800 px-3 py-1.5 rounded-lg hover:bg-navy-50 border border-navy-200 font-medium"
                    >
                      {expandedId === poll.id ? 'Скрий' : 'Резултати'}
                    </button>
                    <button
                      onClick={() => toggleStatus(poll)}
                      className={`text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        poll.status === 'active'
                          ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
                          : 'text-green-700 border-green-200 hover:bg-green-50'
                      }`}
                    >
                      {poll.status === 'active' ? 'Затвори' : 'Активирай'}
                    </button>
                    <button
                      onClick={() => handleDelete(poll.id)}
                      className="text-sm text-crimson-600 hover:text-crimson-800 px-3 py-1.5 rounded-lg hover:bg-crimson-50 border border-crimson-200 font-medium"
                    >
                      Изтрий
                    </button>
                  </div>
                </div>
              </div>

              {/* Резултати */}
              {expandedId === poll.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  <PollChart results={poll.results} options={poll.options} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
