import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export default async function handler(req, res) {
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Само POST' })

  try {
    const { poll_id, option_id, voter_id } = req.body
    if (!poll_id || !option_id) return res.status(400).json({ error: 'Липсват данни' })

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown'
    const voter_hash = createHash('sha256').update((voter_id || ip) + poll_id).digest('hex')
    const ip_hash = createHash('sha256').update(ip + poll_id).digest('hex')

    // Проверка по voter_id хеш ИЛИ IP хеш — двоен слой защита
    const { data: existing } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', poll_id)
      .or(`ip_hash.eq.${voter_hash},ip_hash.eq.${ip_hash}`)
      .limit(1)

    if (existing?.length) {
      return res.status(409).json({ error: 'Вече сте гласували.', already_voted: true })
    }

    const { error } = await supabase.from('votes').insert({ poll_id, option_id, ip_hash: voter_hash })

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Вече сте гласували.', already_voted: true })
      throw error
    }

    // Сървърен cookie — не се изтрива от iOS Safari ITP (за разлика от JS cookies)
    const cookieHeader = req.headers.cookie || ''
    const votedMatch = cookieHeader.match(/(?:^|;\s*)voted_polls=([^;]*)/)
    const currentVoted = votedMatch ? decodeURIComponent(votedMatch[1]) : ''
    const votedSet = new Set(currentVoted ? currentVoted.split(',') : [])
    votedSet.add(String(poll_id))
    const maxAge = 2 * 365 * 24 * 3600
    res.setHeader('Set-Cookie', `voted_polls=${encodeURIComponent([...votedSet].join(','))}; Path=/; Max-Age=${maxAge}; SameSite=Lax`)

    const { data: results } = await supabase.from('poll_results').select('*').eq('poll_id', poll_id)
    return res.json({ success: true, results })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Сървърна грешка' })
  }
}
