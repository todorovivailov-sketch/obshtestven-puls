import { useEffect, useState, useRef } from 'react'
import { articlesApi, uploadApi } from '../../lib/api'

const EMPTY_FORM = { title: '', author: '', body: '', category: 'analysis', published: true }
const CATEGORIES = [
  { value: 'analysis', label: 'Анализ' },
  { value: 'comment', label: 'Коментар' },
  { value: 'news', label: 'Новина' },
]

export default function AdminArticles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [docxFile, setDocxFile] = useState(null)
  const [uploadingDocx, setUploadingDocx] = useState(false)
  const imageRef = useRef()
  const docxRef = useRef()

  async function load() {
    const data = await articlesApi.getAll()
    setArticles(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Конвертиране на DOCX → HTML чрез mammoth (client-side)
  async function handleDocx(file) {
    if (!file) return
    setDocxFile(file)
    setUploadingDocx(true)
    try {
      const mammoth = await import('mammoth/mammoth.browser')
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      setForm(f => ({ ...f, body: result.value }))
    } catch (err) {
      setError('Грешка при конвертиране на Word файла.')
    }
    setUploadingDocx(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.body) { setError('Заглавието и текстът са задължителни.'); return }
    setSaving(true)
    setError(null)

    let docx_url = form.docx_url || null

    try {
      // Качване на оригинален docx
      if (docxFile) {
        docx_url = await uploadApi.uploadFile(docxFile, 'article-docs')
      }

      // Използваме FormData когато има снимка
      let res
      if (imageFile) {
        const fd = new FormData()
        fd.append('title', form.title)
        fd.append('author', form.author || '')
        fd.append('body', form.body)
        fd.append('category', form.category)
        fd.append('published', form.published ? 'true' : 'false')
        if (docx_url) fd.append('docx_url', docx_url)
        fd.append('image', imageFile)
        res = await articlesApi.createWithFormData(fd)
      } else {
        res = await articlesApi.create({ ...form, docx_url })
      }

      if (res.id) {
        setForm(EMPTY_FORM)
        setImageFile(null)
        setDocxFile(null)
        setShowForm(false)
        load()
      } else {
        setError(res.error || 'Грешка при запис')
      }
    } catch (err) {
      setError('Грешка при качване на файл.')
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Изтрийте тази статия?')) return
    await articlesApi.delete(id)
    load()
  }

  async function togglePublished(article) {
    await articlesApi.update({ id: article.id, published: !article.published })
    load()
  }

  const CATEGORY_LABELS = { analysis: 'Анализ', comment: 'Коментар', news: 'Новина' }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-navy-700">Статии и анализи</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Отказ' : '+ Нова статия'}
        </button>
      </div>

      {/* Форма за нова статия */}
      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-navy-700 mb-5">Нова статия</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label">Заглавие *</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Заглавие на статията"
                  required
                />
              </div>
              <div>
                <label className="label">Автор</label>
                <input
                  className="input"
                  value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value })}
                  placeholder="Име на автора"
                />
              </div>
            </div>

            <div>
              <label className="label">Категория</label>
              <select
                className="input"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Снимка */}
            <div>
              <label className="label">Снимка (thumbnail)</label>
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

            {/* Word файл */}
            <div>
              <label className="label">Качи Word документ (.docx) — автоматично се конвертира</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-navy-400 transition-colors"
                onClick={() => docxRef.current?.click()}
              >
                {uploadingDocx ? (
                  <div className="text-navy-600 text-sm">Конвертиране на Word файл...</div>
                ) : docxFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">{docxFile.name} — конвертиран успешно</span>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">Качете .docx файл (или пишете директно по-долу)</p>
                  </div>
                )}
                <input ref={docxRef} type="file" accept=".docx" className="hidden" onChange={e => handleDocx(e.target.files[0])} />
              </div>
            </div>

            {/* Текст */}
            <div>
              <label className="label">Текст на статията (HTML) *</label>
              <textarea
                className="input font-mono text-xs resize-y"
                rows={12}
                value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
                placeholder="<p>Текст на статията...</p>"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Поддържа HTML форматиране. При качен Word файл се попълва автоматично.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={form.published}
                onChange={e => setForm({ ...form, published: e.target.checked })}
                className="accent-navy-700 w-4 h-4"
              />
              <label htmlFor="published" className="text-sm font-medium text-gray-700">Публикувай веднага</label>
            </div>

            {error && <p className="text-crimson-600 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving || uploadingDocx} className="btn-primary">
                {saving ? 'Запазване...' : 'Публикувай статията'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} className="btn-outline">
                Отказ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Списък */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">Няма статии. Създайте първата!</div>
      ) : (
        <div className="space-y-3">
          {articles.map(a => (
            <div key={a.id} className="card p-4 flex items-center gap-4">
              {a.image_url && (
                <img src={a.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-navy-600 bg-navy-50 px-2 py-0.5 rounded">
                    {CATEGORY_LABELS[a.category]}
                  </span>
                  {!a.published && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-semibold">Скрита</span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 truncate">{a.title}</h3>
                <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('bg-BG')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublished(a)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                    a.published
                      ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
                      : 'text-green-700 border-green-200 hover:bg-green-50'
                  }`}
                >
                  {a.published ? 'Скрий' : 'Публикувай'}
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-xs text-crimson-600 hover:text-crimson-800 px-3 py-1.5 rounded-lg border border-crimson-200 hover:bg-crimson-50 font-medium"
                >
                  Изтрий
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
