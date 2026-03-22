import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token')
  if (!token) return <Navigate to="/admin/login" replace />

  // Проверяваме дали е изтекъл
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp < Date.now() / 1000) {
      localStorage.removeItem('admin_token')
      return <Navigate to="/admin/login" replace />
    }
  } catch {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
