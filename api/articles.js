import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

export default async function handler(req, res) {
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(204).end()

  try {
    if (req.method === 'GET') {
      const { id, category } = req.query
      if (id) {
        const { data, error } = await supabase.from('articles').select('*').eq('id', id).eq('published', true).single()
        if (error) return res.status(404).json({ error: 'Не е намерена' })
        return res.json(data)
      }
      let query = supabase.from('articles')
        .select('id, title, author, category, image_url, created_at')
        .eq('published', true).order('created_at', { ascending: false })
      if (category) query = query.eq('category', category)
      const { data, error } = await query
      if (error) throw error
      return res.json(data)
    }

    if (req.method === 'POST') {
      if (!verifyAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Неоторизиран' })
      const { title, author, body, category, image_url, docx_url, published } = req.body
      if (!title || !body) return res.status(400).json({ error: 'Липсват данни' })
      const { data, error } = await supabase.from('articles')
        .insert({ title, author: author || null, body, category: category || 'analysis', image_url: image_url || null, docx_url: docx_url || null, published: published ?? true })
        .select().single()
      if (error) throw error
      return res.status(201).json(data)
    }

    if (req.method === 'PUT') {
      if (!verifyAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Неоторизиран' })
      const { id, ...fields } = req.body
      const { data, error } = await supabase.from('articles').update(fields).eq('id', id).select().single()
      if (error) throw error
      return res.json(data)
    }

    if (req.method === 'DELETE') {
      if (!verifyAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Неоторизиран' })
      const { id } = req.body
      const { error } = await supabase.from('articles').delete().eq('id', id)
      if (error) throw error
      return res.json({ success: true })
    }

    res.status(405).json({ error: 'Методът не е позволен' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Сървърна грешка' })
  }
}

function verifyAdmin(authHeader) {
  try {
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return false
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload.role === 'admin' && payload.exp > Date.now() / 1000
  } catch { return false }
}
