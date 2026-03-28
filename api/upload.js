import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export default async function handler(req, res) {
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Само POST' })

  if (!verifyAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Неоторизиран' })

  try {
    const { filename, contentType, bucket } = req.body
    const validBuckets = ['article-images', 'article-docs', 'poll-images']
    if (!validBuckets.includes(bucket)) return res.status(400).json({ error: 'Невалиден bucket' })

    const ext = filename.split('.').pop().toLowerCase()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path)
    if (error) throw error

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
    return res.json({ signedUrl: data.signedUrl, path, publicUrl })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Грешка при upload: ' + err.message })
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
