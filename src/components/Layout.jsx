import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  X,
  BookOpen,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students',  icon: Users,           label: 'Data Murid' },
  { to: '/test/new',  icon: ClipboardList,   label: 'Tes Baru' },
]

function OrnamentDivider() {
  return (
    <div className="flex items-center gap-2 px-4 my-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-islamic-700 to-transparent" />
      <span className="text-gold-600 text-xs">✦</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-islamic-700 to-transparent" />
    </div>
  )
}

function SidebarContent({ onClose }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Berhasil keluar')
    navigate('/login')
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-islamic-600 to-islamic-800
                          flex items-center justify-center shadow-glow-green flex-shrink-0">
            <BookOpen className="w-5 h-5 text-gold-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gold-400 uppercase tracking-widest leading-none">Tes Baca</p>
            <p className="text-sm font-semibold text-islamic-100 truncate leading-tight mt-0.5">Al-Quran</p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-islamic-800/60 border border-islamic-700/40">
          <p className="text-xs text-islamic-400 font-medium">Login sebagai</p>
          <p className="text-sm font-semibold text-islamic-100 truncate mt-0.5">{profile?.name}</p>
          <p className="text-xs text-islamic-500 truncate">{profile?.email}</p>
        </div>
      </div>

      <OrnamentDivider />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link group ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 flex-shrink-0 transition-colors
                  ${isActive ? 'text-gold-400' : 'text-islamic-500 group-hover:text-islamic-300'}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-gold-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <OrnamentDivider />

      {/* Footer */}
      <div className="px-3 py-4 space-y-2">
        <div className="px-4 py-2">
          <p className="text-[10px] text-islamic-600 text-center leading-relaxed">
            SMP Negeri 2 Glagah<br />
            <span className="font-arabic text-xs text-gold-700/60">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</span>
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="sidebar-link w-full text-red-400 hover:bg-red-900/30 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-full min-h-screen bg-islamic-950 pattern-bg">
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-islamic-950/80 border-r border-islamic-800/60
                        backdrop-blur-xl fixed inset-y-0 left-0 z-30 shadow-xl">
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ──────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar ──────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-islamic-950 border-r border-islamic-800/60
        shadow-2xl transform transition-transform duration-300 md:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg bg-islamic-800/60 text-islamic-400 hover:text-islamic-100
                       hover:bg-islamic-700/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-islamic-950/90
                           backdrop-blur-xl border-b border-islamic-800/60 sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg bg-islamic-800/60 text-islamic-300 hover:text-islamic-100
                       hover:bg-islamic-700/60 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-semibold text-islamic-100">Tes Baca Al-Quran</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 animate-in">
          {children}
        </main>
      </div>
    </div>
  )
}
