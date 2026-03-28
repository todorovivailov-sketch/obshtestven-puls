import bcrypt from 'bcryptjs'
import { createHmac } from 'crypto'

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
    const jwtSecret = process.env.JWT_SECRET
    const passwordHash = process.env.ADMIN_PASSWORD_HASH

    if (!jwtSecret || !passwordHash) {
      console.error('Липсват env променливи')
      return res.status(500).json({ error: 'Сървърна конфигурация липсва' })
    }

    const { password } = req.body
    const valid = await bcrypt.compare(password, passwordHash)
    if (!valid) return res.status(401).json({ error: 'Грешна парола' })

    const payload = { role: 'admin', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 }
    const token = makeJWT(payload, jwtSecret)
    return res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Сървърна грешка' })
  }
}

function makeJWT(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}
