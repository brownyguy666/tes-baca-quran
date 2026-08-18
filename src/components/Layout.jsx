import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardList, LogOut,
  Menu, X, BookOpen, ChevronRight, FileText,
  BarChart3, SlidersHorizontal, GraduationCap, Tv,
  History, Sparkles,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

// ── Navigation Groups (sidebar desktop) ───────────────────────
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
      { to: '/rubric',   icon: BookOpen,          label: 'Panduan & Rubrik' },
      { to: '/settings', icon: SlidersHorizontal, label: 'Pengaturan System' },
    ],
  },
]

// ── Demo Navigation Groups ─────────────────────────────────────
const DEMO_NAV_GROUPS = [
  {
    label: 'MODE DEMO KEMENAG',
    items: [
      { to: '/demo',   icon: Sparkles, label: 'Studio AI Penilai', badge: 'Demo' },
      { to: '/live',   icon: Tv,       label: 'Layar Siswa (Live)', badge: 'Live' },
      { to: '/rubric', icon: BookOpen, label: 'Panduan & Rubrik' },
    ],
  },
]

// ── Bottom Nav Items (mobile) — 5 paling penting ──────────────
const BOTTOM_NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Beranda' },
  { to: '/test/new',  icon: ClipboardList,   label: 'Tes Baru' },
  { to: '/students',  icon: Users,           label: 'Murid' },
  { to: '/history',   icon: History,         label: 'Riwayat' },
  { to: '/settings',  icon: SlidersHorizontal, label: 'Setelan' },
]

const DEMO_BOTTOM_NAV_ITEMS = [
  { to: '/demo',   icon: Sparkles, label: 'Uji AI' },
  { to: '/live',   icon: Tv,       label: 'Layar' },
  { to: '/rubric', icon: BookOpen, label: 'Rubrik' },
]

// ── Topbar ────────────────────────────────────────────────────
function Topbar({ onMenuClick }) {
  const { profile, isDemo, signOut } = useAuth()
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting =
    hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : 'Selamat Sore'
  const initial = (profile?.name || profile?.email || 'G').charAt(0).toUpperCase()

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-5 py-3"
      style={{
        background: 'rgba(11,15,25,0.92)',
        backdropFilter: 'blur(16px)',
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
        aria-label="Buka menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* School branding — desktop */}
      <div className="hidden md:flex items-center gap-3">
        <img
          src="/logo-smpn2glagah.png"
          alt="Logo SMPN 2 Glagah"
          className="w-9 h-9 object-contain flex-shrink-0"
          style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}
        />
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
        <img
          src="/logo-smpn2glagah.png"
          alt="Logo"
          className="w-7 h-7 object-contain"
        />
        <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
          Tes Baca Al-Quran
        </span>
      </div>

      {/* User greeting + avatar + demo badge */}
      <div className="flex items-center gap-3">
        {isDemo ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Mode Demo Kemenag</span>
            </div>
            <button
              onClick={async () => {
                await signOut()
                toast.success('Keluar dari mode demo')
                navigate('/login')
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-colors font-semibold"
            >
              Keluar
            </button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </header>
  )
}

// ── Sidebar Content (desktop + mobile drawer) ─────────────────
function SidebarContent({ onClose }) {
  const { profile, signOut, isDemo } = useAuth()
  const navigate = useNavigate()
  const initial = (profile?.name || profile?.email || 'G').charAt(0).toUpperCase()
  const navGroups = isDemo ? DEMO_NAV_GROUPS : NAV_GROUPS

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
          <img
            src="/logo-smpn2glagah.png"
            alt="Logo SMPN 2 Glagah"
            className="w-12 h-12 object-contain flex-shrink-0"
            style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }}
          />
          <div className="min-w-0">
            <p
              className="text-[11px] font-black uppercase tracking-widest leading-none"
              style={{ color: '#d4af37' }}
            >
              SMPN 2 Glagah
            </p>
            <p className="text-xs font-semibold truncate leading-tight mt-0.5"
               style={{ color: '#94a3b8' }}>
              Penilaian Baca Al-Quran
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
                background: isDemo ? 'rgba(99,102,241,0.2)' : 'rgba(212,175,55,0.15)',
                border: `1px solid ${isDemo ? 'rgba(99,102,241,0.4)' : 'rgba(212,175,55,0.3)'}`,
                color: isDemo ? '#c7d2fe' : '#d4af37',
              }}
            >
              {isDemo ? 'Pengawas / Tamu' : 'Penguji'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation Groups ── */}
      <nav className="flex-1 px-3 pb-2">
        {navGroups.map((group) => (
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
          <span>{isDemo ? 'Keluar Mode Demo' : 'Keluar'}</span>
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

// ── Bottom Navigation Bar (Mobile Only) ───────────────────────
function BottomNav() {
  const { isDemo } = useAuth()
  const location = useLocation()
  const items = isDemo ? DEMO_BOTTOM_NAV_ITEMS : BOTTOM_NAV_ITEMS

  const isActive = (to) => {
    if (to === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama mobile">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={() => `bottom-nav-item ${isActive(to) ? 'active' : ''}`}
          aria-label={label}
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

// ── Layout ────────────────────────────────────────────────────
export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div
      className="flex h-full min-h-screen pattern-bg w-full max-w-full overflow-x-hidden"
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

      {/* ── Mobile Sidebar Drawer ── */}
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
            aria-label="Tutup menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main area ── */}
      <div
        className="flex-1 flex flex-col min-h-screen md:ml-[var(--sidebar-width)] w-full max-w-full min-w-0 overflow-x-hidden"
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 w-full max-w-full min-w-0 px-3 py-3 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 animate-in mobile-content-pad">
          {children}
        </main>
      </div>

      {/* ── Bottom Navigation Bar (mobile only) ── */}
      <BottomNav />
    </div>
  )
}
