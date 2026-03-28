import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Polls from './pages/Polls'
import PastPolls from './pages/PastPolls'
import Articles from './pages/Articles'
import ArticlePage from './pages/ArticlePage'
import Contact from './pages/Contact'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminPolls from './pages/Admin/AdminPolls'
import AdminArticles from './pages/Admin/AdminArticles'
import AdminMessages from './pages/Admin/AdminMessages'
import AdminLayout from './pages/Admin/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      {/* Публични страници */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="anketi" element={<Polls />} />
        <Route path="rezultati" element={<PastPolls />} />
        <Route path="komentari" element={<Articles />} />
        <Route path="komentari/:id" element={<ArticlePage />} />
        <Route path="kontakti" element={<Contact />} />
      </Route>

      {/* Админ */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="anketi" element={<AdminPolls />} />
        <Route path="statii" element={<AdminArticles />} />
        <Route path="saobshteniya" element={<AdminMessages />} />
      </Route>
    </Routes>
  )
}
