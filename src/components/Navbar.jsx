import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

const links = [
  { to: '/anketi',       label: 'Анкети' },
  { to: '/rezultati', label: 'Резултати' },
  { to: '/komentari',   label: 'Коментари и анализи' },
  { to: '/kontakti',    label: 'Контакти' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-navy-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Лого */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-crimson-600 rounded-lg flex items-center justify-center group-hover:bg-crimson-500 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-lg tracking-tight">
                Обществен <span className="text-crimson-400">пулс</span>
              </span>
              <span className="text-navy-300 text-xs font-medium tracking-wide">Силистра и региона</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-navy-200 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Burger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-3 space-y-1">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/15 text-white' : 'text-navy-200 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
