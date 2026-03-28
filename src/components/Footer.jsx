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
              <li><Link to="/kontakti" className="hover:text-white transition-colors">Контакти</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Информация</h4>
            <ul className="space-y-2 text-sm">
              <li><span>Анонимно гласуване</span></li>
              <li><span>Независима платформа</span></li>
              <li><Link to="/admin/login" className="hover:text-white transition-colors text-navy-300">Администрация</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-600 mt-8 pt-6 text-sm text-center text-navy-400">
          &copy; {new Date().getFullYear()} Обществен пулс. Всички права запазени.
        </div>
      </div>
    </footer>
  )
}
