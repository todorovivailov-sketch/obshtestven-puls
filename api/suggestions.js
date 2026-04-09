import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const { email, suggestion } = req.body
    if (!email || !suggestion) return res.status(400).json({ error: 'Липсват данни' })

    await resend.emails.send({
      from: 'Обществен пулс <onboarding@resend.dev>',
      to: 'obshtestvenpuls@gmail.com',
      subject: `Предложение за гражданска анкета от ${email}`,
      html: `
        <p><strong>Имейл:</strong> ${email}</p>
        <p><strong>Предложение:</strong></p>
        <p>${suggestion.replace(/\n/g, '<br>')}</p>
      `,
    })

    return res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Сървърна грешка' })
  }
}
