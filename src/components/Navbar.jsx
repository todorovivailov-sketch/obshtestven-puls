import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

const links = [
  { to: '/anketi',         label: 'Анкети' },
  { to: '/rezultati',      label: 'Резултати' },
  { to: '/komentari',      label: 'Коментари и анализи' },
  { to: '/prevodach',      label: 'Преводач на политики' },
  { to: '/predlozheniya',  label: 'Предложения' },
  { to: '/kontakti',       label: 'Контакти' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-navy-700 sticky top-0 z-50 border-b border-navy-600">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Лого */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="h-8 w-8 rounded-md overflow-hidden bg-white flex-shrink-0">
              <img src="/logo.png" alt="Обществен пулс" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-base tracking-tight">
                Обществен <span className="text-crimson-400">пулс</span>
              </span>
              <span className="text-navy-400 text-[10px] font-medium tracking-wider uppercase">Силистра и региона</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-navy-300 hover:text-white hover:bg-white/10'
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
            className="md:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-navy-600 py-2 space-y-0.5">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/15 text-white' : 'text-navy-300 hover:text-white hover:bg-white/10'
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
