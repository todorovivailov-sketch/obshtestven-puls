import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Само POST' }) }

  try {
    const { poll_id, option_id } = JSON.parse(event.body)
    if (!poll_id || !option_id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Липсват данни' }) }

    // Хешираме IP за поверителност
    const ip = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown'
    const ip_hash = createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex')

    // Проверка дали вече е гласувал
    const { data: existing } = await supabase
      .from('votes').select('id').eq('poll_id', poll_id).eq('ip_hash', ip_hash).maybeSingle()

    if (existing) return { statusCode: 409, headers, body: JSON.stringify({ error: 'Вече сте гласували по тази анкета', already_voted: true }) }

    // Запис на гласа
    const { error } = await supabase.from('votes').insert({ poll_id, option_id, ip_hash })
    if (error) throw error

    // Връщаме актуалните резултати
    const { data: results } = await supabase
      .from('poll_results').select('*').eq('poll_id', poll_id)

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, results }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Сървърна грешка' }) }
  }
}
