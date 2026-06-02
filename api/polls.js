import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

export default async function handler(req, res) {
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(204).end()

  try {
    if (req.method === 'GET') {
      const { status = 'active', published, category, id } = req.query

      if (id) {
        const { data: poll, error: pe } = await supabase.from('polls').select('*').eq('id', id).single()
        if (pe) return res.status(404).json({ error: 'Не е намерена' })
        const { data: options } = await supabase.from('poll_options').select('*').eq('poll_id', id).order('position')
        const { data: results } = await supabase.from('poll_results').select('*').eq('poll_id', id)
        return res.json({ poll: { ...poll, options: options || [] }, results })
      }

      const { show_on_home } = req.query
      let query = supabase.from('polls').select('*').order('created_at', { ascending: false })
      if (status !== 'all') query = query.eq('status', status)
      if (published === 'true') query = query.eq('results_published', true)
      if (show_on_home === 'true') query = query.eq('show_on_home', true)
      if (category) query = query.eq('category', category)

      const { data, error } = await query
      if (error) throw error
      if (!data.length) return res.json([])

      const pollIds = data.map(p => p.id)
      const { data: options } = await supabase.from('poll_options').select('*').in('poll_id', pollIds).order('position')

      const { data: allResults } = await supabase.from('poll_results').select('*').in('poll_id', pollIds)
      const resultsMap = {}
      if (allResults) allResults.forEach(r => {
        if (!resultsMap[r.poll_id]) resultsMap[r.poll_id] = []
        resultsMap[r.poll_id].push(r)
      })

      return res.json(data.map(p => ({
        ...p,
        options: options?.filter(o => o.poll_id === p.id) || [],
        results: resultsMap[p.id] || null,
      })))
    }

    if (req.method === 'POST') {
      if (!verifyAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Неоторизиран' })
      const { question, category, description, start_date, end_date, options, image_url, image_source, video_url, video_source } = req.body
      if (!question || !options?.length) return res.status(400).json({ error: 'Липсват данни' })

      const { data: poll, error: pe } = await supabase
        .from('polls').insert({ question, category: category || 'Политика', description, start_date, end_date, image_url, image_source: image_source || null, video_url: video_url || null, video_source: video_source || null }).select().single()
      if (pe) throw pe

      const optRows = options.map((label, i) => ({ poll_id: poll.id, label, position: i }))
      const { error: oe } = await supabase.from('poll_options').insert(optRows)
      if (oe) throw oe

      return res.status(201).json(poll)
    }

    if (req.method === 'PUT') {
      if (!verifyAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Неоторизиран' })
      const { id, status, question, description, category, start_date, end_date, image_url, image_source, video_url, video_source, results_published, result_summary, show_on_home } = req.body
      const fields = {}
      if (status !== undefined) fields.status = status
      if (question !== undefined) fields.question = question
      if (description !== undefined) fields.description = description
      if (category !== undefined) fields.category = category
      if (start_date !== undefined) fields.start_date = start_date
      if (end_date !== undefined) fields.end_date = end_date
      if (image_url !== undefined) fields.image_url = image_url
      if (image_source !== undefined) fields.image_source = image_source
      if (video_url !== undefined) fields.video_url = video_url
      if (video_source !== undefined) fields.video_source = video_source
      if (results_published !== undefined) fields.results_published = results_published
      if (result_summary !== undefined) fields.result_summary = result_summary
      if (show_on_home !== undefined) fields.show_on_home = show_on_home

      const { data, error } = await supabase.from('polls').update(fields).eq('id', id).select().single()
      if (error) throw error

      // Ако са изпратени нови опции — UPDATE съществуващите по позиция (запазва option IDs и гласовете!)
      if (req.body.options && Array.isArray(req.body.options)) {
        const newLabels = req.body.options.map(l => String(l).trim()).filter(Boolean)

        const { data: existing } = await supabase
          .from('poll_options').select('id, position').eq('poll_id', id).order('position')
        const existingOpts = existing || []

        // UPDATE съществуващите опции на същата позиция
        for (let i = 0; i < Math.min(newLabels.length, existingOpts.length); i++) {
          await supabase.from('poll_options')
            .update({ label: newLabels[i], position: i })
            .eq('id', existingOpts[i].id)
        }

        // INSERT нови (ако се добавят повече варианти)
        if (newLabels.length > existingOpts.length) {
          const toInsert = newLabels.slice(existingOpts.length).map((label, j) => ({
            poll_id: id, label, position: existingOpts.length + j
          }))
          await supabase.from('poll_options').insert(toInsert)
        }

        // DELETE премахнатите (ако се намаляват варианти)
        if (existingOpts.length > newLabels.length) {
          const toDelete = existingOpts.slice(newLabels.length).map(o => o.id)
          await supabase.from('poll_options').delete().in('id', toDelete)
        }
      }

      return res.json(data)
    }

    if (req.method === 'DELETE') {
      if (!verifyAdmin(req.headers.authorization)) return res.status(401).json({ error: 'Неоторизиран' })
      const { id } = req.body
      const { error } = await supabase.from('polls').delete().eq('id', id)
      if (error) throw error
      return res.json({ success: true })
    }

    res.status(405).json({ error: 'Методът не е позволен' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Сървърна грешка' })
  }
}

function verifyAdmin(authHeader) {
  try {
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return false
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload.role === 'admin' && payload.exp > Date.now() / 1000
  } catch { return false }
}
