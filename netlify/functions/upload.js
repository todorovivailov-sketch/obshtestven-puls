import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Само POST' }) }

  const token = event.headers.authorization?.replace('Bearer ', '')
  if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

  try {
    const { filename, contentType, bucket } = JSON.parse(event.body)
    const validBuckets = ['article-images', 'article-docs', 'poll-images']
    if (!validBuckets.includes(bucket)) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Невалиден bucket' }) }

    const ext = filename.split('.').pop().toLowerCase()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path)

    if (error) throw error

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl

    return { statusCode: 200, headers, body: JSON.stringify({ signedUrl: data.signedUrl, path, publicUrl }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Грешка при upload: ' + err.message }) }
  }
}

function verifyAdmin(token) {
  if (!token) return false
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload.role === 'admin' && payload.exp > Date.now() / 1000
  } catch { return false }
}
