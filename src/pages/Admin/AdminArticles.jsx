import { useEffect, useState, useRef } from 'react'
import { articlesApi, uploadApi } from '../../lib/api'

const EMPTY_FORM = { title: '', author: '', body: '', category: 'analysis', published: true, image_source: '', video_url: '', video_source: '' }
const CATEGORIES = [
  { value: 'analysis', label: 'Анализ' },
  { value: 'comment', label: 'Коментар' },
  { value: 'news', label: 'Новина' },
]
const CATEGORY_LABELS = { analysis: 'Анализ', comment: 'Коментар', news: 'Новина' }

export default function AdminArticles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [authorImageFile, setAuthorImageFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [docxFile, setDocxFile] = useState(null)
  const [uploadingDocx, setUploadingDocx] = useState(false)

  // Редактиране
  const [editArticle, setEditArticle] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editImageFile, setEditImageFile] = useState(null)
  const [editAuthorImageFile, setEditAuthorImageFile] = useState(null)
  const [editVideoFile, setEditVideoFile] = useState(null)
  const [editDocxFile, setEditDocxFile] = useState(null)
  const [editUploadingDocx, setEditUploadingDocx] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState(null)

  const imageRef = useRef()
  const authorImageRef = useRef()
  const videoRef = useRef()
  const docxRef = useRef()
  const editImageRef = useRef()
  const editAuthorImageRef = useRef()
  const editVideoRef = useRef()
  const editDocxRef = useRef()

  async function load() {
    const data = await articlesApi.getAllAdmin()
    setArticles(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDocx(file, isEdit = false) {
    if (!file) return
    if (isEdit) { setEditDocxFile(file); setEditUploadingDocx(true) }
    else { setDocxFile(file); setUploadingDocx(true) }
    try {
      const mammoth = await import('mammoth/mammoth.browser')
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      if (isEdit) setEditForm(f => ({ ...f, body: result.value }))
      else setForm(f => ({ ...f, body: result.value }))
    } catch {
      if (isEdit) setEditError('Грешка при конвертиране на Word файла.')
      else setError('Грешка при конвертиране на Word файла.')
    }
    if (isEdit) setEditUploadingDocx(false)
    else setUploadingDocx(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.body) { setError('Заглавието и текстът са задължителни.'); return }
    setSaving(true)
    setError(null)
    try {
      let image_url = null
      let author_image_url = null
      let video_url = form.video_url || null
      let docx_url = null

      if (imageFile) image_url = await uploadApi.uploadFile(imageFile, 'article-images')
      if (authorImageFile) author_image_url = await uploadApi.uploadFile(authorImageFile, 'author-images')
      if (videoFile) video_url = await uploadApi.uploadFile(videoFile, 'media-files')
      if (docxFile) docx_url = await uploadApi.uploadFile(docxFile, 'article-docs')

      const res = await articlesApi.create({ ...form, image_url, author_image_url, video_url, docx_url })
      if (res.id) {
        setForm(EMPTY_FORM)
        setImageFile(null)
        setAuthorImageFile(null)
        setVideoFile(null)
        setDocxFile(null)
        setShowForm(false)
        load()
      } else {
        setError(res.error || 'Грешка при запис')
      }
    } catch (err) {
      setError('Грешка при качване: ' + err.message)
    }
    setSaving(false)
  }

  async function openEdit(article) {
    // Зареди пълния текст на статията
    const full = await articlesApi.getOneAdmin(article.id)
    setEditArticle(full.id ? full : article)
    setEditForm({
      title: full.title || '',
      author: full.author || '',
      body: full.body || '',
      category: full.category || 'analysis',
      published: full.published ?? true,
      image_url: full.image_url || '',
      image_source: full.image_source || '',
      video_url: full.video_url || '',
      video_source: full.video_source || '',
      author_image_url: full.author_image_url || '',
    })
    setEditImageFile(null)
    setEditAuthorImageFile(null)
    setEditVideoFile(null)
    setEditDocxFile(null)
    setEditError(null)
  }

  function closeEdit() {
    setEditArticle(null)
    setEditForm({})
    setEditImageFile(null)
    setEditAuthorImageFile(null)
    setEditVideoFile(null)
    setEditDocxFile(null)
    setEditError(null)
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    if (!editForm.title || !editForm.body) { setEditError('Заглавието и текстът са задължителни.'); return }
    setEditSaving(true)
    setEditError(null)
    try {
      let image_url = editForm.image_url || null
      let author_image_url = editForm.author_image_url || null
      let video_url = editForm.video_url || null
      let docx_url = editArticle.docx_url || null

      if (editImageFile) image_url = await uploadApi.uploadFile(editImageFile, 'article-images')
      if (editAuthorImageFile) author_image_url = await uploadApi.uploadFile(editAuthorImageFile, 'author-images')
      if (editVideoFile) video_url = await uploadApi.uploadFile(editVideoFile, 'media-files')
      if (editDocxFile) docx_url = await uploadApi.uploadFile(editDocxFile, 'article-docs')

      const res = await articlesApi.update({
        id: editArticle.id,
        title: editForm.title,
        author: editForm.author,
        body: editForm.body,
        category: editForm.category,
        published: editForm.published,
        image_url,
        image_source: editForm.image_source || null,
        video_url,
        video_source: editForm.video_source || null,
        author_image_url,
        docx_url,
      })

      if (res.id) {
        closeEdit()
        load()
      } else {
        setEditError(res.error || 'Грешка при запис')
      }
    } catch (err) {
      setEditError('Грешка при качване: ' + err.message)
    }
    setEditSaving(false)
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
                <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Заглавие на статията" required />
              </div>
              <div>
                <label className="label">Автор</label>
                <input className="input" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Име на автора" />
              </div>
            </div>

            <div>
              <label className="label">Категория</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Снимка на автора */}
            <div>
              <label className="label">Снимка на автора (незадължително)</label>
              <div className="flex items-center gap-4">
                {authorImageFile ? (
                  <img src={URL.createObjectURL(authorImageFile)} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-navy-200" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-navy-100 flex items-center justify-center text-navy-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <button type="button" onClick={() => authorImageRef.current?.click()} className="btn-outline text-sm py-1.5">
                  {authorImageFile ? 'Смени снимката' : 'Качи снимка'}
                </button>
                {authorImageFile && (
                  <button type="button" onClick={() => setAuthorImageFile(null)} className="text-xs text-crimson-600 hover:underline">Премахни</button>
                )}
                <input ref={authorImageRef} type="file" accept="image/*" className="hidden" onChange={e => setAuthorImageFile(e.target.files[0])} />
              </div>
            </div>

            {/* Снимка на статията */}
            <div>
              <label className="label">Снимка (thumbnail)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-navy-400 transition-colors" onClick={() => imageRef.current?.click()}>
                {imageFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm font-medium">{imageFile.name}</span>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm">Кликнете за качване на снимка</p>
                    <p className="text-xs mt-1">JPG, PNG, WebP</p>
                  </div>
                )}
                <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
              </div>
            </div>

            <div>
              <label className="label">Източник на снимката</label>
              <input
                className="input"
                value={form.image_source}
                onChange={e => setForm({ ...form, image_source: e.target.value })}
                placeholder="Напр. автор, институция, личен архив, URL..."
              />
            </div>

            <div>
              <label className="label">Видео (YouTube линк или локален файл)</label>
              <div className="grid md:grid-cols-[1fr_auto] gap-3">
                <input
                  className="input"
                  value={form.video_url}
                  onChange={e => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <button type="button" onClick={() => videoRef.current?.click()} className="btn-outline">
                  {videoFile ? 'Смени файл' : 'Качи видео'}
                </button>
              </div>
              {videoFile && <p className="text-xs text-green-600 mt-2">{videoFile.name}</p>}
              <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => setVideoFile(e.target.files[0])} />
            </div>

            <div>
              <label className="label">Източник на видеото</label>
              <input
                className="input"
                value={form.video_source}
                onChange={e => setForm({ ...form, video_source: e.target.value })}
                placeholder="Напр. YouTube канал, автор, институция..."
              />
            </div>

            {/* Word файл */}
            <div>
              <label className="label">Качи Word документ (.docx) — автоматично се конвертира</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-navy-400 transition-colors" onClick={() => docxRef.current?.click()}>
                {uploadingDocx ? (
                  <div className="text-navy-600 text-sm">Конвертиране на Word файл...</div>
                ) : docxFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm font-medium">{docxFile.name} — конвертиран успешно</span>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="text-sm">Качете .docx файл (или пишете директно по-долу)</p>
                  </div>
                )}
                <input ref={docxRef} type="file" accept=".docx" className="hidden" onChange={e => handleDocx(e.target.files[0])} />
              </div>
            </div>

            {/* Текст */}
            <div>
              <label className="label">Текст на статията (HTML) *</label>
              <textarea className="input font-mono text-xs resize-y" rows={12} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="<p>Текст на статията...</p>" required />
              <p className="text-xs text-gray-400 mt-1">Поддържа HTML форматиране. При качен Word файл се попълва автоматично.</p>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="accent-navy-700 w-4 h-4" />
              <label htmlFor="published" className="text-sm font-medium text-gray-700">Публикувай веднага</label>
            </div>

            {error && <p className="text-crimson-600 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving || uploadingDocx} className="btn-primary">
                {saving ? 'Запазване...' : 'Публикувай статията'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setImageFile(null); setAuthorImageFile(null); setVideoFile(null) }} className="btn-outline">Отказ</button>
            </div>
          </form>
        </div>
      )}

      {/* Списък */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : articles.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">Няма статии. Създайте първата!</div>
      ) : (
        <div className="space-y-3">
          {articles.map(a => (
            <div key={a.id} className="card p-4 flex items-center gap-4">
              {a.image_url ? (
                <img src={a.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-navy-600 bg-navy-50 px-2 py-0.5 rounded">{CATEGORY_LABELS[a.category]}</span>
                  {!a.published && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-semibold">Скрита</span>}
                </div>
                <h3 className="font-medium text-gray-900 truncate">{a.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {a.author_image_url && (
                    <img src={a.author_image_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                  )}
                  <p className="text-xs text-gray-400">{a.author && <span className="mr-2">{a.author}</span>}{new Date(a.created_at).toLocaleDateString('bg-BG')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(a)}
                  className="text-xs text-gray-700 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg font-medium"
                >
                  Редактирай
                </button>
                <button
                  onClick={() => togglePublished(a)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${a.published ? 'text-amber-700 border-amber-200 hover:bg-amber-50' : 'text-green-700 border-green-200 hover:bg-green-50'}`}
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

      {/* Модал за редактиране */}
      {editArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-4 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-navy-700">Редактиране на статия</h3>
              <button onClick={closeEdit} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Заглавие *</label>
                  <input className="input" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Автор</label>
                  <input className="input" value={editForm.author} onChange={e => setEditForm(f => ({ ...f, author: e.target.value }))} placeholder="Име на автора" />
                </div>
              </div>

              <div>
                <label className="label">Категория</label>
                <select className="input" value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Снимка на автора */}
              <div>
                <label className="label">Снимка на автора</label>
                <div className="flex items-center gap-4">
                  {editAuthorImageFile ? (
                    <img src={URL.createObjectURL(editAuthorImageFile)} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-navy-200" />
                  ) : editForm.author_image_url ? (
                    <img src={editForm.author_image_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-navy-200" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-navy-100 flex items-center justify-center text-navy-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                  )}
                  <button type="button" onClick={() => editAuthorImageRef.current?.click()} className="btn-outline text-sm py-1.5">
                    {editForm.author_image_url || editAuthorImageFile ? 'Смени снимката' : 'Качи снимка'}
                  </button>
                  {(editForm.author_image_url || editAuthorImageFile) && (
                    <button type="button" onClick={() => { setEditForm(f => ({ ...f, author_image_url: '' })); setEditAuthorImageFile(null) }} className="text-xs text-crimson-600 hover:underline">Премахни</button>
                  )}
                  <input ref={editAuthorImageRef} type="file" accept="image/*" className="hidden" onChange={e => setEditAuthorImageFile(e.target.files[0])} />
                </div>
              </div>

              {/* Снимка на статията */}
              <div>
                <label className="label">Снимка (thumbnail)</label>
                {editForm.image_url && !editImageFile && (
                  <div className="mb-2 flex items-center gap-3">
                    <img src={editForm.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                    <button type="button" onClick={() => setEditForm(f => ({ ...f, image_url: '' }))} className="text-xs text-crimson-600 hover:underline">Премахни</button>
                  </div>
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-navy-400 transition-colors" onClick={() => editImageRef.current?.click()}>
                  {editImageFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm">{editImageFile.name}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">{editForm.image_url ? 'Качете нова снимка (ще замени текущата)' : 'Кликнете за качване на снимка'}</p>
                  )}
                  <input ref={editImageRef} type="file" accept="image/*" className="hidden" onChange={e => setEditImageFile(e.target.files[0])} />
                </div>
              </div>

              <div>
                <label className="label">Източник на снимката</label>
                <input
                  className="input"
                  value={editForm.image_source || ''}
                  onChange={e => setEditForm(f => ({ ...f, image_source: e.target.value }))}
                  placeholder="Напр. автор, институция, личен архив, URL..."
                />
              </div>

              <div>
                <label className="label">Видео (YouTube линк или локален файл)</label>
                {editForm.video_url && !editVideoFile && (
                  <div className="mb-2 flex items-center gap-3">
                    <a href={editForm.video_url} target="_blank" rel="noreferrer" className="text-xs text-navy-600 hover:underline truncate">
                      {editForm.video_url}
                    </a>
                    <button type="button" onClick={() => setEditForm(f => ({ ...f, video_url: '' }))} className="text-xs text-crimson-600 hover:underline">Премахни</button>
                  </div>
                )}
                <div className="grid md:grid-cols-[1fr_auto] gap-3">
                  <input
                    className="input"
                    value={editForm.video_url || ''}
                    onChange={e => setEditForm(f => ({ ...f, video_url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <button type="button" onClick={() => editVideoRef.current?.click()} className="btn-outline">
                    {editVideoFile ? 'Смени файл' : 'Качи видео'}
                  </button>
                </div>
                {editVideoFile && <p className="text-xs text-green-600 mt-2">{editVideoFile.name}</p>}
                <input ref={editVideoRef} type="file" accept="video/*" className="hidden" onChange={e => setEditVideoFile(e.target.files[0])} />
              </div>

              <div>
                <label className="label">Източник на видеото</label>
                <input
                  className="input"
                  value={editForm.video_source || ''}
                  onChange={e => setEditForm(f => ({ ...f, video_source: e.target.value }))}
                  placeholder="Напр. YouTube канал, автор, институция..."
                />
              </div>

              {/* Word файл */}
              <div>
                <label className="label">Смени Word документ (незадължително)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-navy-400 transition-colors" onClick={() => editDocxRef.current?.click()}>
                  {editUploadingDocx ? (
                    <div className="text-navy-600 text-sm">Конвертиране...</div>
                  ) : editDocxFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm">{editDocxFile.name} — конвертиран</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Качете нов .docx (ще замени текста по-долу)</p>
                  )}
                  <input ref={editDocxRef} type="file" accept=".docx" className="hidden" onChange={e => handleDocx(e.target.files[0], true)} />
                </div>
              </div>

              {/* Текст */}
              <div>
                <label className="label">Текст (HTML) *</label>
                <textarea className="input font-mono text-xs resize-y" rows={10} value={editForm.body} onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))} required />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="edit-published" checked={editForm.published} onChange={e => setEditForm(f => ({ ...f, published: e.target.checked }))} className="accent-navy-700 w-4 h-4" />
                <label htmlFor="edit-published" className="text-sm font-medium text-gray-700">Публикувана</label>
              </div>

              {editError && <p className="text-crimson-600 text-sm">{editError}</p>}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={editSaving || editUploadingDocx} className="btn-primary flex-1">
                  {editSaving ? 'Запазване...' : 'Запази промените'}
                </button>
                <button type="button" onClick={closeEdit} className="btn-outline flex-1">Отказ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
