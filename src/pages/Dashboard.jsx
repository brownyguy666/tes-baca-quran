import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LEVELS } from '../utils/scoring'
import {
  Users, ClipboardList, TrendingUp, Plus, Search,
  ChevronRight, ChevronLeft, Calendar, BookOpen, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

const PAGE_SIZE = 24

// ── Avatar colour pool (deterministic by student id) ──────
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#4338ca)',
  'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'linear-gradient(135deg,#06b6d4,#0e7490)',
  'linear-gradient(135deg,#10b981,#047857)',
  'linear-gradient(135deg,#f59e0b,#b45309)',
  'linear-gradient(135deg,#ec4899,#be185d)',
  'linear-gradient(135deg,#14b8a6,#0f766e)',
]
function avatarGradient(id = '') {
  const h = [...id].reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length]
}

// ── KPI Card ──────────────────────────────────────────────
const KPI_VARIANTS = {
  indigo:  {
    cls: 'kpi-indigo',
    iconBg: 'rgba(99,102,241,0.18)',
    iconColor: '#818cf8',
    valueCls: 'text-indigo-300',
    glow: 'rgba(99,102,241,0.15)',
  },
  blue: {
    cls: 'kpi-blue',
    iconBg: 'rgba(59,130,246,0.18)',
    iconColor: '#60a5fa',
    valueCls: 'text-blue-300',
    glow: 'rgba(59,130,246,0.15)',
  },
  gold: {
    cls: 'kpi-gold',
    iconBg: 'rgba(212,175,55,0.18)',
    iconColor: '#d4af37',
    valueCls: 'text-yellow-300',
    glow: 'rgba(212,175,55,0.15)',
  },
}

function KpiCard({ icon: Icon, label, value, sub, variant = 'indigo' }) {
  const v = KPI_VARIANTS[variant]
  return (
    <div className={`kpi-card ${v.cls} animate-in`}>
      {/* Ambient glow blob */}
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: v.glow, filter: 'blur(28px)', transform: 'translate(30%,-30%)' }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2"
             style={{ color: '#475569' }}>
            {label}
          </p>
          <p className={`text-4xl font-black ${v.valueCls}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs mt-1.5" style={{ color: '#475569' }}>{sub}</p>}
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: v.iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: v.iconColor }} />
        </div>
      </div>
    </div>
  )
}

// ── Level Badge ───────────────────────────────────────────
function LevelBadge({ level }) {
  const l = LEVELS.find((x) => x.label === level)
  const styleMap = {
    'Mumtaz (Tartil)': 'level-mumtaz',
    'Mahir':           'level-mahir',
    'Menengah':        'level-menengah',
    'Dasar':           'level-dasar',
    'Pemula':          'level-pemula',
  }
  return (
    <span className={`badge-level ${styleMap[level] || 'level-pemula'}`}>
      <span>{l?.emoji || '📚'}</span>
      <span>{level || '—'}</span>
    </span>
  )
}

// ── Student Card ──────────────────────────────────────────
function StudentCard({ murid, lastTest }) {
  const navigate = useNavigate()
  const grad = avatarGradient(murid.id)

  return (
    <div
      className="card card-hover p-5 flex flex-col gap-3 animate-in"
      onClick={() => navigate(`/students/${murid.id}/history`)}
      id={`student-card-${murid.id}`}
    >
      {/* Avatar + name */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0
                     text-base font-bold text-white"
          style={{ background: grad }}
        >
          {murid.nama.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ color: '#e2e8f0' }}>{murid.nama}</p>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
            Kelas {murid.kelas} · NISN {murid.nisn || '—'}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: '#334155' }} />
      </div>

      {/* Last test */}
      {lastTest ? (
        <div className="rounded-xl p-3 space-y-2"
             style={{ background: 'rgba(11,15,25,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <LevelBadge level={lastTest.level} />
            <span className="text-xl font-black" style={{ color: '#f8fafc' }}>
              {lastTest.skor_total}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(lastTest.tanggal_tes).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-3 text-center"
             style={{ background: 'rgba(11,15,25,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-xs italic" style={{ color: '#334155' }}>Belum ada tes</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Link
          to={`/test/new?murid=${murid.id}`}
          id={`test-new-btn-${murid.id}`}
          className="btn-primary flex-1 text-center text-xs py-2"
        >
          Tes Baru
        </Link>
        <Link
          to={`/students/${murid.id}/history`}
          id={`history-btn-${murid.id}`}
          className="btn-secondary flex-1 text-center text-xs py-2"
        >
          Riwayat
        </Link>
      </div>
    </div>
  )
}

// ── Dashboard Page ────────────────────────────────────────
export default function Dashboard() {
  const [students, setStudents]   = useState([])
  const [lastTests, setLastTests] = useState({})
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [stats, setStats] = useState({ total: 0, tesHariIni: 0, rataRata: null })
  const [page, setPage]         = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const fetchStats = async () => {
    const { data, error } = await supabase.rpc('get_dashboard_stats')
    if (error) { toast.error('Gagal memuat statistik'); return }
    const row = Array.isArray(data) ? data[0] : data
    setStats({
      total:      row?.total_murid ?? 0,
      tesHariIni: row?.tes_hari_ini ?? 0,
      rataRata:   row?.rata_rata_skor != null ? Number(row.rata_rata_skor).toFixed(1) : null,
    })
  }

  const fetchStudents = async (targetPage, term) => {
    setLoading(true)
    const from = (targetPage - 1) * PAGE_SIZE
    const to   = from + PAGE_SIZE - 1

    let query = supabase.from('murid').select('*', { count: 'exact' }).order('nama')
    const t = term.trim()
    if (t) query = query.or(`nama.ilike.%${t}%,kelas.ilike.%${t}%,nisn.ilike.%${t}%`)

    const { data: muridData, error: muridErr, count } = await query.range(from, to)
    if (muridErr) { toast.error('Gagal memuat data murid'); setLoading(false); return }

    setStudents(muridData || [])
    setTotalCount(count || 0)

    const ids = (muridData || []).map((m) => m.id)
    if (ids.length) {
      const { data: lastTestData } = await supabase
        .from('last_test_per_murid').select('*').in('murid_id', ids)
      const map = {}
      for (const tes of (lastTestData || [])) map[tes.murid_id] = tes
      setLastTests(map)
    } else {
      setLastTests({})
    }
    setLoading(false)
  }

  useEffect(() => { fetchStats() }, [])
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])
  useEffect(() => { setPage(1) }, [debouncedSearch])
  useEffect(() => { fetchStudents(page, debouncedSearch) }, [page, debouncedSearch])

  const from = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to   = Math.min(page * PAGE_SIZE, totalCount)

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Page header ── */}
      <div className="animate-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[10px] font-arabic mb-1" style={{ color: '#334155' }}>
            الحمد لله
          </div>
          <h1 className="section-title text-2xl flex items-center gap-2">
            <BookOpen className="w-6 h-6" style={{ color: '#d4af37' }} />
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            Pantau aktivitas dan kemajuan penilaian
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/students" id="manage-students-btn"
                className="btn-secondary flex items-center gap-2">
            <Users className="w-4 h-4" /> Kelola Murid
          </Link>
          <Link to="/test/new" id="new-test-btn"
                className="btn-gold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tes Baru
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon={Users}
          label="Total Murid"
          value={stats.total}
          sub="Murid terdaftar"
          variant="indigo"
        />
        <KpiCard
          icon={ClipboardList}
          label="Tes Hari Ini"
          value={stats.tesHariIni}
          sub="Penilaian dilakukan"
          variant="blue"
        />
        <KpiCard
          icon={TrendingUp}
          label="Rata-rata Skor"
          value={stats.rataRata ?? '—'}
          sub="Dari semua tes"
          variant="gold"
        />
      </div>

      {/* ── Search + Student Grid ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h2 className="section-title flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: '#d4af37' }} />
            Daftar Murid
          </h2>
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: '#475569' }}
            />
            <input
              id="search-students-input"
              type="text"
              placeholder="Cari nama, kelas, NISN…"
              className="input-field pl-10 py-2.5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#475569' }}>Memuat data murid…</p>
          </div>
        ) : students.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: '#334155' }} />
            <p className="font-medium" style={{ color: '#64748b' }}>
              {debouncedSearch ? 'Murid tidak ditemukan' : 'Belum ada data murid'}
            </p>
            {!debouncedSearch && (
              <Link to="/students" className="btn-primary inline-flex items-center gap-2 mt-4">
                <Plus className="w-4 h-4" /> Tambah Murid
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {students.map((murid) => (
                <StudentCard key={murid.id} murid={murid} lastTest={lastTests[murid.id]} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
              <p className="text-xs" style={{ color: '#475569' }}>
                Menampilkan {from}–{to} dari {totalCount} murid
              </p>
              <div className="flex items-center gap-2">
                <button
                  id="dashboard-prev-page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-secondary p-2 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm px-2" style={{ color: '#94a3b8' }}>
                  {page} / {totalPages}
                </span>
                <button
                  id="dashboard-next-page-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn-secondary p-2 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
