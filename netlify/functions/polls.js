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
      let query = supabase.from('polls').select('*').order('created_at', { ascending: false })
      if (status !== 'all') query = query.eq('status', status)
      const { data, error } = await query
      if (error) throw error

      // Вземи options за всяка анкета
      const pollIds = data.map(p => p.id)
      const { data: options } = await supabase
        .from('poll_options').select('*').in('poll_id', pollIds).order('position')

      const polls = data.map(p => ({
        ...p,
        options: options.filter(o => o.poll_id === p.id)
      }))

      return { statusCode: 200, headers, body: JSON.stringify(polls) }
    }

    // POST /api/polls — само за админ
    if (event.httpMethod === 'POST') {
      const token = event.headers.authorization?.replace('Bearer ', '')
      if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

      const { question, description, ends_at, options } = JSON.parse(event.body)
      if (!question || !options?.length) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Липсват данни' }) }

      const { data: poll, error: pe } = await supabase
        .from('polls').insert({ question, description, ends_at }).select().single()
      if (pe) throw pe

      const optRows = options.map((label, i) => ({ poll_id: poll.id, label, position: i }))
      const { error: oe } = await supabase.from('poll_options').insert(optRows)
      if (oe) throw oe

      return { statusCode: 201, headers, body: JSON.stringify(poll) }
    }

    // PUT /api/polls — затваряне / редакция
    if (event.httpMethod === 'PUT') {
      const token = event.headers.authorization?.replace('Bearer ', '')
      if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

      const { id, status, question, description, ends_at } = JSON.parse(event.body)
      const { data, error } = await supabase
        .from('polls').update({ status, question, description, ends_at }).eq('id', id).select().single()
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
