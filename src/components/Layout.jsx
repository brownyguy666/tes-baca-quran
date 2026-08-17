import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardList, LogOut,
  Menu, X, BookOpen, ChevronRight, FileText,
  BarChart3, SlidersHorizontal, GraduationCap, Tv,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

// ── Navigation Groups ─────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'MAIN MENU',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/test/new',  icon: ClipboardList,   label: 'Tes Baru' },
      { to: '/live',      icon: Tv,              label: 'Layar Siswa', badge: 'Live' },
    ],
  },
  {
    label: 'DATA & LAPORAN',
    items: [
      { to: '/students', icon: Users,     label: 'Data Murid' },
      { to: '/history',  icon: FileText,  label: 'Riwayat / Log Tes' },
      { to: '/reports',  icon: BarChart3, label: 'Rekap & Laporan' },
    ],
  },
  {
    label: 'SISTEM & ACUAN',
    items: [
      { to: '/rubric',   icon: BookOpen,         label: 'Panduan & Rubrik' },
      { to: '/settings', icon: SlidersHorizontal, label: 'Pengaturan System' },
    ],
  },
]

// ── Topbar ────────────────────────────────────────────────
function Topbar({ onMenuClick }) {
  const { profile } = useAuth()
  const hour = new Date().getHours()
  const greeting =
    hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : 'Selamat Sore'
  const initial = (profile?.name || profile?.email || 'G').charAt(0).toUpperCase()

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-5 py-3"
      style={{
        background: 'rgba(11,15,25,0.88)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: '60px',
      }}
    >
      {/* Mobile burger */}
      <button
        id="mobile-menu-btn"
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg transition-colors"
        style={{ background: 'rgba(30,41,59,0.8)', color: '#94a3b8' }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* School branding — desktop */}
      <div className="hidden md:flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08))',
            border: '1px solid rgba(212,175,55,0.3)',
          }}
        >
          <GraduationCap className="w-4 h-4" style={{ color: '#d4af37' }} />
        </div>
        <div>
          <p
            className="text-xs font-black uppercase tracking-widest leading-none"
            style={{ color: '#d4af37', letterSpacing: '0.1em' }}
          >
            SMP Negeri 2 Glagah
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>
            Sistem Penilaian Baca Al-Quran
          </p>
        </div>
      </div>

      {/* Mobile brand */}
      <div className="md:hidden flex items-center gap-2">
        <BookOpen className="w-4 h-4" style={{ color: '#d4af37' }} />
        <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
          Tes Baca Al-Quran
        </span>
      </div>

      {/* User greeting + avatar */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
            {greeting}, {profile?.name} 👋
          </p>
          <p className="text-[11px]" style={{ color: '#475569' }}>
            Penguji / Guru PAI
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.35), rgba(212,175,55,0.15))',
            border: '2px solid rgba(212,175,55,0.5)',
            color: '#d4af37',
          }}
        >
          {initial}
        </div>
      </div>
    </header>
  )
}

// ── Sidebar Content ───────────────────────────────────────
function SidebarContent({ onClose }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const initial = (profile?.name || profile?.email || 'G').charAt(0).toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Berhasil keluar')
    navigate('/login')
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* ── Brand / Logo ── */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(212,175,55,0.08))',
              border: '1px solid rgba(212,175,55,0.35)',
            }}
          >
            <BookOpen className="w-5 h-5" style={{ color: '#d4af37' }} />
          </div>
          <div className="min-w-0">
            <p
              className="text-[11px] font-black uppercase tracking-widest leading-none"
              style={{ color: '#d4af37' }}
            >
              Tes Baca
            </p>
            <p className="text-sm font-semibold truncate leading-tight mt-0.5"
               style={{ color: '#e2e8f0' }}>
              Al-Quran
            </p>
          </div>
        </div>

        {/* User profile card */}
        <div
          className="mt-4 p-3 rounded-2xl flex items-center gap-3"
          style={{
            background: 'rgba(30,41,59,0.6)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.35), rgba(212,175,55,0.12))',
              border: '2px solid rgba(212,175,55,0.45)',
              color: '#d4af37',
            }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>
              {profile?.name || 'Guru'}
            </p>
            <p className="text-[11px] truncate" style={{ color: '#475569' }}>
              {profile?.email}
            </p>
            <span
              className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#d4af37',
              }}
            >
              Penguji
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation Groups ── */}
      <nav className="flex-1 px-3 pb-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="nav-group-label">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  target={to === '/live' ? '_blank' : undefined}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link group ${isActive ? 'active' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className="w-4 h-4 flex-shrink-0 transition-colors"
                        style={{ color: isActive ? '#d4af37' : undefined }}
                      />
                      <span className="flex-1">{label}</span>
                      {badge && (
                        <span
                          className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(16,185,129,0.18)',
                            color: '#34d399',
                            border: '1px solid rgba(16,185,129,0.35)',
                          }}
                        >
                          {badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isActive ? 'text-amber-400 opacity-100 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer / Sign out ── */}
      <div className="px-3 pb-5 flex-shrink-0">
        <div className="ornament-line mb-3" />
        <button
          onClick={handleSignOut}
          className="sidebar-link w-full"
          style={{ color: '#f43f5e' }}
          id="sign-out-btn"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" style={{ color: '#f43f5e' }} />
          <span>Keluar</span>
        </button>
        <p
          className="text-[10px] text-center mt-3 font-arabic leading-relaxed"
          style={{ color: '#334155' }}
        >
          بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
        </p>
      </div>
    </div>
  )
}

// ── Layout ────────────────────────────────────────────────
export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div
      className="flex h-full min-h-screen pattern-bg"
      style={{ background: 'var(--bg-canvas)' }}
    >
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30"
        style={{
          width: 'var(--sidebar-width)',
          background: 'rgba(17,24,39,0.95)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 md:hidden
          shadow-2xl transform transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: 'var(--sidebar-width)',
          background: '#111827',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ background: 'rgba(30,41,59,0.8)', color: '#94a3b8' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main area ── */}
      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >
        {/* Desktop hidden via CSS, always rendered but md:ml applied to content */}
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 animate-in">
          {children}
        </main>
      </div>
    </div>
  )
}
