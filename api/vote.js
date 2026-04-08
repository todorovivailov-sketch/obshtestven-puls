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
    const { poll_id, option_id } = req.body
    if (!poll_id || !option_id) return res.status(400).json({ error: 'Липсват данни' })

    const { voter_id } = req.body
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown'
    const identifier = voter_id || ip
    const ip_hash = createHash('sha256').update(identifier + poll_id).digest('hex')

    const { error } = await supabase.from('votes').insert({ poll_id, option_id, ip_hash })

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Вече сте гласували.', already_voted: true })
      throw error
    }

    const { data: results } = await supabase.from('poll_results').select('*').eq('poll_id', poll_id)
    return res.json({ success: true, results })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Сървърна грешка' })
  }
}
