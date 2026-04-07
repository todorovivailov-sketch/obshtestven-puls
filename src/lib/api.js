const BASE = '/api'

function getToken() {
  return localStorage.getItem('admin_token')
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

// АНКЕТИ
export const pollsApi = {
  getAll: (status = 'active', publishedOnly = false, category = '') =>
    fetch(`${BASE}/polls?status=${status}${publishedOnly ? '&published=true' : ''}${category ? `&category=${encodeURIComponent(category)}` : ''}`).then(r => r.json()),

  getHomeResults: () =>
    fetch(`${BASE}/polls?status=all&published=true&show_on_home=true`).then(r => r.json()),

  getOne: (id) =>
    fetch(`${BASE}/polls?id=${id}`).then(r => r.json()),

  create: (data, isFormData = false) =>
    fetch(`${BASE}/polls`, {
      method: 'POST',
      headers: isFormData
        ? { Authorization: `Bearer ${getToken()}` }
        : authHeaders(),
      body: isFormData ? data : JSON.stringify(data),
    }).then(r => r.json()),

  update: (data) =>
    fetch(`${BASE}/polls`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),

  delete: (id) =>
    fetch(`${BASE}/polls`, { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }) }).then(r => r.json()),
}

// ГЛАСУВАНЕ
export const voteApi = {
  vote: (poll_id, option_id) =>
    fetch(`${BASE}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poll_id, option_id }),
    }).then(r => r.json()),
}

// СТАТИИ
export const articlesApi = {
  getAll: (category) =>
    fetch(`${BASE}/articles${category ? `?category=${category}` : ''}`).then(r => r.json()),

  getAllAdmin: () =>
    fetch(`${BASE}/articles?admin=true`, { headers: authHeaders() }).then(r => r.json()),

  getOne: (id) =>
    fetch(`${BASE}/articles?id=${id}`).then(r => r.json()),

  getOneAdmin: (id) =>
    fetch(`${BASE}/articles?id=${id}&admin=true`, { headers: authHeaders() }).then(r => r.json()),

  create: (data) =>
    fetch(`${BASE}/articles`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),

  // FormData — браузърът автоматично задава Content-Type с boundary
  createWithFormData: (formData) =>
    fetch(`${BASE}/articles`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    }).then(r => r.json()),

  update: (data) =>
    fetch(`${BASE}/articles`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),

  delete: (id) =>
    fetch(`${BASE}/articles`, { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }) }).then(r => r.json()),
}

// UPLOAD — директно към Supabase Storage чрез signed URL
export const uploadApi = {
  uploadFile: async (file, bucket) => {
    // 1. Вземи signed URL от нашата функция
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ filename: file.name, contentType: file.type, bucket }),
    }).then(r => r.json())

    if (res.error) throw new Error(res.error)

    // 2. Качи директно към Supabase (заобикаля Netlify лимита)
    const uploadRes = await fetch(res.signedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    if (!uploadRes.ok) throw new Error('Грешка при качване на файла')

    return res.publicUrl
  },
}

// ПРЕВОДАЧ НА ПОЛИТИКИ
export const policyTranslationsApi = {
  getAll: () =>
    fetch(`${BASE}/policy-translations`).then(r => r.json()),

  getAllAdmin: () =>
    fetch(`${BASE}/policy-translations?admin=true`, { headers: authHeaders() }).then(r => r.json()),

  getOne: (id) =>
    fetch(`${BASE}/policy-translations?id=${id}`).then(r => r.json()),

  getOneAdmin: (id) =>
    fetch(`${BASE}/policy-translations?id=${id}&admin=true`, { headers: authHeaders() }).then(r => r.json()),

  create: (data) =>
    fetch(`${BASE}/policy-translations`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),

  update: (data) =>
    fetch(`${BASE}/policy-translations`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),

  delete: (id) =>
    fetch(`${BASE}/policy-translations`, { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }) }).then(r => r.json()),
}

// КОНТАКТ
export const contactApi = {
  send: (data) =>
    fetch(`${BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getAll: () =>
    fetch(`${BASE}/contact`, { headers: authHeaders() }).then(r => r.json()),
}

// ADMIN LOGIN
export const adminApi = {
  login: (password) =>
    fetch(`${BASE}/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(r => r.json()),
}
