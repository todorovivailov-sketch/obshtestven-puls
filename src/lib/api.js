const BASE = '/.netlify/functions'

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

  getOne: (id) =>
    fetch(`${BASE}/articles?id=${id}`).then(r => r.json()),

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

// UPLOAD
export const uploadApi = {
  getSignedUrl: (filename, contentType, bucket) =>
    fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ filename, contentType, bucket }),
    }).then(r => r.json()),

  uploadFile: async (file, bucket) => {
    const { signedUrl, publicUrl, error } = await uploadApi.getSignedUrl(file.name, file.type, bucket)
    if (error) throw new Error(error)
    await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    return publicUrl
  },
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
