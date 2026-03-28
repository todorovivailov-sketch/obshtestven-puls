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
    // GET /api/polls?status=active|closed|all
    if (event.httpMethod === 'GET') {
      const status = event.queryStringParameters?.status || 'active'
      const id = event.queryStringParameters?.id

      // Единична анкета с резултати
      if (id) {
        const { data: poll, error: pe } = await supabase
          .from('polls').select('*').eq('id', id).single()
        if (pe) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Не е намерена' }) }

        const { data: results } = await supabase
          .from('poll_results').select('*').eq('poll_id', id)

        return { statusCode: 200, headers, body: JSON.stringify({ poll, results }) }
      }

      // Всички анкети
      const published = event.queryStringParameters?.published
      let query = supabase.from('polls').select('*').order('created_at', { ascending: false })
      if (status !== 'all') query = query.eq('status', status)
      if (published === 'true') query = query.eq('results_published', true)
      const { data, error } = await query
      if (error) throw error

      if (!data.length) return { statusCode: 200, headers, body: JSON.stringify([]) }

      // Вземи options за всяка анкета
      const pollIds = data.map(p => p.id)
      const { data: options } = await supabase
        .from('poll_options').select('*').in('poll_id', pollIds).order('position')

      // Вземи резултати за всички анкети в резултатния изглед
      let resultsMap = {}
      const { data: allResults } = await supabase
        .from('poll_results').select('*').in('poll_id', pollIds)
      if (allResults) {
        allResults.forEach(r => {
          if (!resultsMap[r.poll_id]) resultsMap[r.poll_id] = []
          resultsMap[r.poll_id].push(r)
        })
      }

      const polls = data.map(p => ({
        ...p,
        options: options?.filter(o => o.poll_id === p.id) || [],
        results: resultsMap[p.id] || null,
      }))

      return { statusCode: 200, headers, body: JSON.stringify(polls) }
    }

    // POST /api/polls — само за админ
    if (event.httpMethod === 'POST') {
      const token = event.headers.authorization?.replace('Bearer ', '')
      if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

      const contentType = event.headers['content-type'] || event.headers['Content-Type'] || ''

      let question, description, start_date, end_date, options, image_url

      if (contentType.includes('multipart/form-data')) {
        const { fields, fileBuffer, fileName, fileMime } = await parseFormData(event)
        question = fields.question
        description = fields.description || null
        start_date = fields.start_date || null
        end_date = fields.end_date || null
        options = fields.options ? JSON.parse(fields.options) : []

        // Качи снимката
        if (fileBuffer && fileName) {
          const ext = fileName.split('.').pop()
          const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          const { error: uploadError } = await supabase.storage
            .from('poll-images')
            .upload(storagePath, fileBuffer, { contentType: fileMime || 'image/jpeg', upsert: false })
          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage.from('poll-images').getPublicUrl(storagePath)
          image_url = urlData.publicUrl
        }
      } else {
        const parsed = JSON.parse(event.body)
        question = parsed.question
        description = parsed.description || null
        start_date = parsed.start_date || null
        end_date = parsed.end_date || null
        options = parsed.options
        image_url = parsed.image_url || null
      }

      if (!question || !options?.length) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Липсват данни' }) }

      const { data: poll, error: pe } = await supabase
        .from('polls').insert({ question, description, start_date, end_date, image_url }).select().single()
      if (pe) throw pe

      const optRows = options.map((label, i) => ({ poll_id: poll.id, label, position: i }))
      const { error: oe } = await supabase.from('poll_options').insert(optRows)
      if (oe) throw oe

      return { statusCode: 201, headers, body: JSON.stringify(poll) }
    }

    // PUT /api/polls — затваряне / редакция / публикуване на резултати
    if (event.httpMethod === 'PUT') {
      const token = event.headers.authorization?.replace('Bearer ', '')
      if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

      const { id, status, question, description, start_date, end_date, results_published } = JSON.parse(event.body)
      const updateFields = {}
      if (status !== undefined) updateFields.status = status
      if (question !== undefined) updateFields.question = question
      if (description !== undefined) updateFields.description = description
      if (start_date !== undefined) updateFields.start_date = start_date
      if (end_date !== undefined) updateFields.end_date = end_date
      if (results_published !== undefined) updateFields.results_published = results_published

      const { data, error } = await supabase
        .from('polls').update(updateFields).eq('id', id).select().single()
      if (error) throw error

      return { statusCode: 200, headers, body: JSON.stringify(data) }
    }

    // DELETE /api/polls
    if (event.httpMethod === 'DELETE') {
      const token = event.headers.authorization?.replace('Bearer ', '')
      if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

      const { id } = JSON.parse(event.body)
      const { error } = await supabase.from('polls').delete().eq('id', id)
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
