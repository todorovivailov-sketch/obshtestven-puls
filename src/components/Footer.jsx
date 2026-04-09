import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-navy-700 text-navy-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">
              Обществен <span className="text-crimson-400">пулс</span>
            </h3>
            <p className="text-sm leading-relaxed">
              Платформа за граждански анкети и анализи по актуални обществени и политически теми.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Навигация</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/anketi" className="hover:text-white transition-colors">Анкети</Link></li>
              <li><Link to="/rezultati" className="hover:text-white transition-colors">Резултати</Link></li>
              <li><Link to="/komentari" className="hover:text-white transition-colors">Коментари и анализи</Link></li>
              <li><Link to="/predlozheniya" className="hover:text-white transition-colors">Предложения за анкети</Link></li>
              <li><Link to="/kontakti" className="hover:text-white transition-colors">Контакти</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Информация</h4>
            <ul className="space-y-2 text-sm">
              <li><span>Анонимно гласуване</span></li>
              <li><span>Не е социологическо проучване</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-600 mt-8 pt-6 flex items-center justify-between">
          <div className="text-sm text-navy-400">
            &copy; {new Date().getFullYear()} Обществен пулс. Всички права запазени.
          </div>
          <a
            href="https://www.facebook.com/share/18PRE7SPUn/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 bg-navy-600 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
            title="Facebook"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
