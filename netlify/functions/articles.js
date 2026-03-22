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
      const category = event.queryStringParameters?.category

      if (id) {
        const { data, error } = await supabase
          .from('articles').select('*').eq('id', id).eq('published', true).single()
        if (error) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Не е намерена' }) }
        return { statusCode: 200, headers, body: JSON.stringify(data) }
      }

      let query = supabase.from('articles').select('id, title, summary, category, image_url, created_at')
        .eq('published', true).order('created_at', { ascending: false })
      if (category) query = query.eq('category', category)

      const { data, error } = await query
      if (error) throw error
      return { statusCode: 200, headers, body: JSON.stringify(data) }
    }

    // POST — само админ
    if (event.httpMethod === 'POST') {
      const token = event.headers.authorization?.replace('Bearer ', '')
      if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

      const { title, summary, body, category, image_url, docx_url, published } = JSON.parse(event.body)
      if (!title || !body) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Липсват данни' }) }

      const { data, error } = await supabase
        .from('articles').insert({ title, summary, body, category, image_url, docx_url, published: published ?? true })
        .select().single()
      if (error) throw error

      return { statusCode: 201, headers, body: JSON.stringify(data) }
    }

    // PUT — редакция
    if (event.httpMethod === 'PUT') {
      const token = event.headers.authorization?.replace('Bearer ', '')
      if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

      const { id, ...fields } = JSON.parse(event.body)
      const { data, error } = await supabase.from('articles').update(fields).eq('id', id).select().single()
      if (error) throw error
      return { statusCode: 200, headers, body: JSON.stringify(data) }
    }

    // DELETE
    if (event.httpMethod === 'DELETE') {
      const token = event.headers.authorization?.replace('Bearer ', '')
      if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

      const { id } = JSON.parse(event.body)
      const { error } = await supabase.from('articles').delete().eq('id', id)
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
