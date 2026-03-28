import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

export default async function handler(req, res) {
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(204).end()

  try {
    if (req.method === 'POST') {
      const { name, email, message } = req.body
      if (!name || !email || !message) return res.status(400).json({ error: 'Липсват данни' })
      const { error } = await supabase.from('contact_messages').insert({ name, email, message })
      if (error) throw error
      return res.json({ success: true })
    }

    if (req.method === 'GET') {
      if (!verifyAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Неоторизиран' })
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return res.json(data)
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
