import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const voteHashSecret = process.env.VOTE_HASH_SECRET || process.env.JWT_SECRET || 'obshtestven-puls-vote-hash'

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

    const ip = getClientIp(req)
    const userAgent = String(req.headers['user-agent'] || '').slice(0, 240)
    const acceptLanguage = String(req.headers['accept-language'] || '').slice(0, 80)

    // Legacy hashes keep duplicate detection working for votes already recorded
    // before the stronger columns were added.
    const legacyVoterHash = createHash('sha256').update((voter_id || ip) + poll_id).digest('hex')
    const legacyIpHash = createHash('sha256').update(ip + poll_id).digest('hex')
    const voterHash = hashVotePart('voter', poll_id, voter_id || ip)
    const fingerprintHash = hashVotePart('fingerprint', poll_id, ip, userAgent, acceptLanguage)

    const duplicateFilters = [
      `ip_hash.eq.${legacyVoterHash}`,
      `ip_hash.eq.${legacyIpHash}`,
      `voter_hash.eq.${voterHash}`,
      `fingerprint_hash.eq.${fingerprintHash}`,
    ].join(',')

    const { data: existing, error: existingError } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', poll_id)
      .or(duplicateFilters)
      .limit(1)

    if (existingError) throw existingError

    if (existing?.length) {
      return res.status(409).json({ error: 'Вече сте гласували.', already_voted: true })
    }

    const { error } = await supabase.from('votes').insert({
      poll_id,
      option_id,
      ip_hash: legacyVoterHash,
      voter_hash: voterHash,
      fingerprint_hash: fingerprintHash,
    })

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

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return String(forwarded).split(',')[0].trim()
  const realIp = req.headers['x-real-ip']
  if (realIp) return String(realIp).trim()
  return req.socket?.remoteAddress || 'unknown'
}

function hashVotePart(...parts) {
  return createHash('sha256')
    .update(`${voteHashSecret}:${parts.map(part => String(part || '')).join(':')}`)
    .digest('hex')
}
