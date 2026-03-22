import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../lib/api'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi.login(password)
      if (res.token) {
        localStorage.setItem('admin_token', res.token)
        navigate('/admin')
      } else {
        setError(res.error || 'Грешна парола')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Грешка при свързване със сървъра')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-700 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-crimson-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={2}>
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold">Обществен пулс</h1>
          <p className="text-navy-300 text-sm mt-1">Администраторски панел</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">Администраторска парола</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-crimson-50 border border-crimson-200 text-crimson-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Влизане...' : 'Вход'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
