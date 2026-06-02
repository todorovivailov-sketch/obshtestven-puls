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
      const { id, admin } = req.query
      const isAdmin = admin === 'true' && verifyAdmin(req.headers.authorization)

      if (id) {
        let query = supabase.from('policy_translations').select('*').eq('id', id)
        if (!isAdmin) query = query.eq('published', true)
        const { data, error } = await query.single()
        if (error) return res.status(404).json({ error: 'Не е намерен' })
        return res.json(data)
      }

      let query = supabase.from('policy_translations')
        .select('id, title, author, author_image_url, image_url, image_source, video_url, video_source, published, created_at')
        .order('created_at', { ascending: false })
      if (!isAdmin) query = query.eq('published', true)
      const { data, error } = await query
      if (error) throw error
      return res.json(data)
    }

    if (req.method === 'POST') {
      if (!verifyAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Неоторизиран' })
      const { title, author, author_image_url, body, image_url, image_source, video_url, video_source, docx_url, published } = req.body
      if (!title || !body) return res.status(400).json({ error: 'Липсват данни' })
      const { data, error } = await supabase.from('policy_translations')
        .insert({ title, author: author || null, author_image_url: author_image_url || null, body, image_url: image_url || null, image_source: image_source || null, video_url: video_url || null, video_source: video_source || null, docx_url: docx_url || null, published: published ?? true })
        .select().single()
      if (error) throw error
      return res.status(201).json(data)
    }

    if (req.method === 'PUT') {
      if (!verifyAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Неоторизиран' })
      const { id, ...fields } = req.body
      const { data, error } = await supabase.from('policy_translations').update(fields).eq('id', id).select().single()
      if (error) throw error
      return res.json(data)
    }

    if (req.method === 'DELETE') {
      if (!verifyAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Неоторизиран' })
      const { id } = req.body
      const { error } = await supabase.from('policy_translations').delete().eq('id', id)
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
