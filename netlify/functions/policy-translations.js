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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }

  try {
    // GET — публично
    if (event.httpMethod === 'GET') {
      const id = event.queryStringParameters?.id
      const isAdmin = event.queryStringParameters?.admin === 'true'

      if (isAdmin) {
        const token = event.headers.authorization?.replace('Bearer ', '')
        if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }
      }

      if (id) {
        let query = supabase.from('policy_translations').select('*').eq('id', id)
        if (!isAdmin) query = query.eq('published', true)
        const { data, error } = await query.single()
        if (error) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Не е намерена' }) }
        return { statusCode: 200, headers, body: JSON.stringify(data) }
      }

      let query = isAdmin
        ? supabase.from('policy_translations').select('id, title, author, image_url, author_image_url, published, created_at').order('created_at', { ascending: false })
        : supabase.from('policy_translations').select('id, title, author, image_url, created_at').eq('published', true).order('created_at', { ascending: false })

      const { data, error } = await query
      if (error) throw error
      return { statusCode: 200, headers, body: JSON.stringify(data) }
    }

    // POST — само админ
    if (event.httpMethod === 'POST') {
      const token = event.headers.authorization?.replace('Bearer ', '')
      if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

      const parsed = JSON.parse(event.body)
      const { title, author, body, image_url, author_image_url, docx_url, published } = parsed

      if (!title || !body) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Липсват данни' }) }

      const { data, error } = await supabase
        .from('policy_translations')
        .insert({ title, author: author || null, body, image_url: image_url || null, author_image_url: author_image_url || null, docx_url: docx_url || null, published: published ?? true })
        .select().single()
      if (error) throw error

      return { statusCode: 201, headers, body: JSON.stringify(data) }
    }

    // PUT — редакция
    if (event.httpMethod === 'PUT') {
      const token = event.headers.authorization?.replace('Bearer ', '')
      if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

      const { id, ...fields } = JSON.parse(event.body)
      const { data, error } = await supabase.from('policy_translations').update(fields).eq('id', id).select().single()
      if (error) throw error
      return { statusCode: 200, headers, body: JSON.stringify(data) }
    }

    // DELETE
    if (event.httpMethod === 'DELETE') {
      const token = event.headers.authorization?.replace('Bearer ', '')
      if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

      const { id } = JSON.parse(event.body)
      const { error } = await supabase.from('policy_translations').delete().eq('id', id)
      if (error) throw error
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Методът не е позволен' }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Сървърна грешка' }) }
  }
}

function verifyAdmin(token) {
  if (!token) return false
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload.role === 'admin' && payload.exp > Date.now() / 1000
  } catch { return false }
}
