import { useEffect, useState, useRef } from 'react'
import { pollsApi } from '../../lib/api'
import PollChart from '../../components/PollChart'

const CATEGORIES = ['Политика', 'Общество', 'Култура', 'Медии', 'Развлечения']
const EMPTY_FORM = { question: '', description: '', category: 'Политика', start_date: '', end_date: '', options: ['', ''] }

export default function AdminPolls() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [publishingResults, setPublishingResults] = useState(null)
  const [summaryForm, setSummaryForm] = useState(null) // { pollId, text }
  const imageRef = useRef()

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

    let payload
    if (imageFile) {
      const fd = new FormData()
      fd.append('question', form.question)
      fd.append('category', form.category || 'Политика')
      fd.append('description', form.description || '')
      if (form.start_date) fd.append('start_date', form.start_date)
      if (form.end_date) fd.append('end_date', form.end_date)
      fd.append('options', JSON.stringify(opts))
      fd.append('image', imageFile)
      payload = fd
    } else {
      payload = {
        question: form.question,
        category: form.category || 'Политика',
        description: form.description,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        options: opts,
      }
    }

    const res = await pollsApi.create(payload, !!imageFile)
    if (res.id) {
      setForm(EMPTY_FORM)
      setImageFile(null)
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

  function openSummaryForm(poll) {
    setSummaryForm({ pollId: poll.id, text: '' })
  }

  async function confirmPublish() {
    const poll = polls.find(p => p.id === summaryForm.pollId)
    setPublishingResults(poll.id)
    const { results } = await pollsApi.getOne(poll.id)
    setPolls(ps => ps.map(p => p.id === poll.id ? { ...p, results } : p))
    await pollsApi.update({ id: poll.id, status: 'closed', results_published: true, result_summary: summaryForm.text || null })
    setPolls(ps => ps.map(p => p.id === poll.id ? { ...p, status: 'closed', results_published: true, result_summary: summaryForm.text } : p))
    setExpandedId(poll.id)
    setPublishingResults(null)
    setSummaryForm(null)
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
              <label className="label">Категория *</label>
              <select
                className="input"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
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

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label">Начална дата (незадължително)</label>
                <input
                  type="date"
                  className="input"
                  value={form.start_date}
                  onChange={e => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Крайна дата (незадължително)</label>
                <input
                  type="date"
                  className="input"
                  value={form.end_date}
                  onChange={e => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>

            {/* Снимка */}
            <div>
              <label className="label">Снимка (незадължително)</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-navy-400 transition-colors"
                onClick={() => imageRef.current?.click()}
              >
                {imageFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">{imageFile.name}</span>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Кликнете за качване на снимка</p>
                    <p className="text-xs mt-1">JPG, PNG, WebP</p>
                  </div>
                )}
                <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
              </div>
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
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setImageFile(null) }} className="btn-outline">
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
                      {poll.results_published && (
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold">Резултатите публикувани</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{poll.question}</h3>
                    <div className="flex gap-4 mt-1">
                      {poll.start_date && (
                        <p className="text-xs text-gray-400">
                          От: {new Date(poll.start_date).toLocaleDateString('bg-BG')}
                        </p>
                      )}
                      {poll.end_date && (
                        <p className="text-xs text-gray-400">
                          До: {new Date(poll.end_date).toLocaleDateString('bg-BG')}
                        </p>
                      )}
                      {poll.ends_at && !poll.end_date && (
                        <p className="text-xs text-gray-400">
                          Приключва: {new Date(poll.ends_at).toLocaleDateString('bg-BG')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <button
                      onClick={() => loadResults(poll)}
                      className="text-sm text-navy-600 hover:text-navy-800 px-3 py-1.5 rounded-lg hover:bg-navy-50 border border-navy-200 font-medium"
                    >
                      {expandedId === poll.id ? 'Скрий' : 'Резултати'}
                    </button>
                    {!poll.results_published && (
                      <button
                        onClick={() => openSummaryForm(poll)}
                        disabled={publishingResults === poll.id}
                        className="text-sm text-blue-700 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        {publishingResults === poll.id ? 'Публикуване...' : 'Публикувай резултати'}
                      </button>
                    )}
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
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-navy-700 text-sm">Резултати от анкетата</h4>
                    {!poll.results_published && (
                      <button
                        onClick={() => openSummaryForm(poll)}
                        disabled={publishingResults === poll.id}
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        {publishingResults === poll.id ? 'Публикуване...' : 'Публикувай резултати публично'}
                      </button>
                    )}
                  </div>
                  <PollChart results={poll.results} options={poll.options} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Модал за обобщаващ текст */}
      {summaryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-navy-700 mb-2">Публикуване на резултати</h3>
            <p className="text-sm text-gray-500 mb-4">Добавете кратко обобщение на резултатите (незадължително).</p>
            <textarea
              className="input resize-none w-full"
              rows={4}
              placeholder="Пример: По-голямата част от гласувалите подкрепят..."
              value={summaryForm.text}
              onChange={e => setSummaryForm(s => ({ ...s, text: e.target.value }))}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={confirmPublish}
                disabled={publishingResults !== null}
                className="btn-primary flex-1"
              >
                {publishingResults ? 'Публикуване...' : 'Публикувай'}
              </button>
              <button onClick={() => setSummaryForm(null)} className="btn-outline flex-1">Отказ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
