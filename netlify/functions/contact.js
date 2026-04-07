import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }

  // POST — публично изпращане
  if (event.httpMethod === 'POST') {
    try {
      const { name, email, message } = JSON.parse(event.body)
      if (!name || !email || !message) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Всички полета са задължителни' }) }

      const { error } = await supabase.from('contact_messages').insert({ name, email, message })
      if (error) throw error

      await resend.emails.send({
        from: 'Обществен пулс <onboarding@resend.dev>',
        to: 'obshtestvenpuls@gmail.com',
        subject: `Ново съобщение от ${name}`,
        html: `
          <p><strong>Име:</strong> ${name}</p>
          <p><strong>Имейл:</strong> ${email}</p>
          <p><strong>Съобщение:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      })

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Грешка при изпращане' }) }
    }
  }

  // GET — само за админ
  if (event.httpMethod === 'GET') {
    const token = event.headers.authorization?.replace('Bearer ', '')
    if (!verifyAdmin(token)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Неоторизиран' }) }

    const { data, error } = await supabase
      .from('contact_messages').select('*').order('created_at', { ascending: false })
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Грешка' }) }

    return { statusCode: 200, headers, body: JSON.stringify(data) }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Методът не е позволен' }) }
}

function verifyAdmin(token) {
  if (!token) return false
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload.role === 'admin' && payload.exp > Date.now() / 1000
  } catch { return false }
}
