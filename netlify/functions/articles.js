import { createClient } from '@supabase/supabase-js'
import busboy from 'busboy'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Parse multipart/form-data
function parseFormData(event) {
  return new Promise((resolve, reject) => {
    const fields = {}
    let fileBuffer = null
    let fileName = null
    let fileMime = null

    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || ''
    const bb = busboy({ headers: { 'content-type': contentType } })

    bb.on('field', (name, val) => {
      fields[name] = val
    })

    bb.on('file', (name, file, info) => {
      fileName = info.filename
      fileMime = info.mimeType
      const chunks = []
      file.on('data', chunk => chunks.push(chunk))
      file.on('end', () => { fileBuffer = Buffer.concat(chunks) })
    })

    bb.on('finish', () => resolve({ fields, fileBuffer, fileName, fileMime }))
    bb.on('error', reject)

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body || '')

    bb.write(body)
    bb.end()
  })
}

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

      let query = supabase.from('articles').select('id, title, author, category, image_url, created_at')
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

      const contentType = event.headers['content-type'] || event.headers['Content-Type'] || ''

      let title, author, body, category, image_url, docx_url, published

      if (contentType.includes('multipart/form-data')) {
        // FormData с файл
        const { fields, fileBuffer, fileName, fileMime } = await parseFormData(event)
        title = fields.title
        author = fields.author || null
        body = fields.body
        category = fields.category || 'analysis'
        docx_url = fields.docx_url || null
        published = fields.published !== 'false'

        if (!title || !body) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Липсват данни' }) }

        // Качи снимката в Supabase Storage
        if (fileBuffer && fileName) {
          const ext = fileName.split('.').pop()
          const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          const { error: uploadError } = await supabase.storage
            .from('article-images')
            .upload(storagePath, fileBuffer, { contentType: fileMime || 'image/jpeg', upsert: false })
          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage.from('article-images').getPublicUrl(storagePath)
          image_url = urlData.publicUrl
        }
      } else {
        // JSON без снимка
        const parsed = JSON.parse(event.body)
        title = parsed.title
        author = parsed.author || null
        body = parsed.body
        category = parsed.category || 'analysis'
        image_url = parsed.image_url || null
        docx_url = parsed.docx_url || null
        published = parsed.published ?? true
      }

      if (!title || !body) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Липсват данни' }) }

      const { data, error } = await supabase
        .from('articles').insert({ title, author, body, category, image_url, docx_url, published })
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
