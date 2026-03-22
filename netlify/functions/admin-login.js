import bcrypt from 'bcryptjs'
import { createHmac } from 'crypto'

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
    const jwtSecret = process.env.JWT_SECRET
    const passwordHash = process.env.ADMIN_PASSWORD_HASH

    if (!jwtSecret || !passwordHash) {
      console.error('Липсват env променливи:', { jwtSecret: !!jwtSecret, passwordHash: !!passwordHash })
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Сървърна конфигурация липсва' }) }
    }

    const { password } = JSON.parse(event.body)
    const valid = await bcrypt.compare(password, passwordHash)

    if (!valid) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Грешна парола' }) }

    const payload = { role: 'admin', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 }
    const token = makeJWT(payload, jwtSecret)

    return { statusCode: 200, headers, body: JSON.stringify({ token }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Сървърна грешка' }) }
  }
}

function makeJWT(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body   = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig    = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}
