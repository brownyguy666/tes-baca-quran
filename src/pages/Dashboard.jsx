import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LEVELS } from '../utils/scoring'
import {
  Users, ClipboardList, TrendingUp, Plus, Search,
  ChevronRight, ChevronLeft, Calendar, BookOpen, Loader2,
  PieChart,
} from 'lucide-react'
import toast from 'react-hot-toast'

const PAGE_SIZE = 24

// ── Avatar colour pool ────────────────────────────────────
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

// ── Level meta ────────────────────────────────────────────
const LEVEL_META = [
  { label: 'Mumtaz (Tartil)', emoji: '🌟', color: '#d4af37', stroke: '#d4af37' },
  { label: 'Mahir',           emoji: '✅', color: '#10b981', stroke: '#10b981' },
  { label: 'Menengah',        emoji: '📈', color: '#f59e0b', stroke: '#f59e0b' },
  { label: 'Dasar',           emoji: '📚', color: '#3b82f6', stroke: '#3b82f6' },
  { label: 'Pemula',          emoji: '🌱', color: '#8b5cf6', stroke: '#8b5cf6' },
  { label: 'Belum Tes',       emoji: '⏳', color: '#475569', stroke: '#64748b' },
]

// ── SVG Donut Chart ───────────────────────────────────────
function DonutChart({ segments, total }) {
  const size   = 200
  const cx     = size / 2
  const cy     = size / 2
  const R      = 72   // outer radius
  const rInner = 46   // inner (hole) radius
  const [hovered, setHovered] = useState(null)

  // Build arc paths from segments
  let cumAngle = -90 // start at top
  const arcs = segments
    .filter((s) => s.count > 0)
    .map((s) => {
      const angle = (s.count / total) * 360
      const startAngle = cumAngle
      cumAngle += angle
      return { ...s, startAngle, angle }
    })

  const polarToXY = (angleDeg, r) => {
    const rad = (angleDeg * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }

  const describeArc = (startAngle, angle, r) => {
    if (angle >= 360) {
      // Full circle
      return `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx + r - 0.001} ${cy}`
    }
    const endAngle = startAngle + angle
    const start = polarToXY(startAngle, r)
    const end   = polarToXY(endAngle, r)
    const large = angle > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`
  }

  const describeSlice = (startAngle, angle) => {
    if (angle >= 360) {
      return `M ${cx + R} ${cy} A ${R} ${R} 0 1 1 ${cx + R - 0.001} ${cy}
              L ${cx + rInner - 0.001} ${cy} A ${rInner} ${rInner} 0 1 0 ${cx + rInner} ${cy} Z`
    }
    const endAngle = startAngle + angle
    const outer1 = polarToXY(startAngle, R)
    const outer2 = polarToXY(endAngle,   R)
    const inner1 = polarToXY(startAngle, rInner)
    const inner2 = polarToXY(endAngle,   rInner)
    const large = angle > 180 ? 1 : 0
    return `
      M ${outer1.x} ${outer1.y}
      A ${R} ${R} 0 ${large} 1 ${outer2.x} ${outer2.y}
      L ${inner2.x} ${inner2.y}
      A ${rInner} ${rInner} 0 ${large} 0 ${inner1.x} ${inner1.y}
      Z
    `
  }

  const hoveredSeg = hovered !== null ? arcs[hovered] : null

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Donut */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="drop-shadow-lg"
        >
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth={R - rInner} />

          {/* Segments */}
          {arcs.map((s, i) => (
            <path
              key={s.label}
              d={describeSlice(s.startAngle, s.angle)}
              fill={s.color}
              opacity={hovered === null || hovered === i ? 1 : 0.3}
              style={{
                cursor: 'pointer',
                transition: 'opacity 0.2s, transform 0.2s',
                transformOrigin: `${cx}px ${cy}px`,
                transform: hovered === i ? 'scale(1.05)' : 'scale(1)',
                filter: hovered === i ? `drop-shadow(0 0 8px ${s.color}99)` : 'none',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* Gap lines between segments */}
          {arcs.map((s) => {
            const p = polarToXY(s.startAngle, R + 2)
            const q = polarToXY(s.startAngle, rInner - 2)
            return (
              <line
                key={`gap-${s.label}`}
                x1={p.x} y1={p.y} x2={q.x} y2={q.y}
                stroke="#0b0f19" strokeWidth="1.5"
              />
            )
          })}

          {/* Center text */}
          <text x={cx} y={cy - 10} textAnchor="middle" fontSize="26" fontWeight="800"
                fill={hoveredSeg ? hoveredSeg.color : '#f8fafc'}
                style={{ transition: 'fill 0.2s' }}>
            {hoveredSeg ? hoveredSeg.count : total}
          </text>
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9" fontWeight="600"
                fill={hoveredSeg ? hoveredSeg.color : '#64748b'}
                style={{ letterSpacing: '0.08em', transition: 'fill 0.2s' }}>
            {hoveredSeg ? hoveredSeg.label.split(' ')[0].toUpperCase() : 'TOTAL MURID'}
          </text>
          {hoveredSeg && (
            <text x={cx} y={cy + 20} textAnchor="middle" fontSize="9"
                  fill="#475569">
              {((hoveredSeg.count / total) * 100).toFixed(1)}%
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="w-full space-y-2">
        {arcs.map((s, i) => {
          const pct = ((s.count / total) * 100).toFixed(1)
          return (
            <div
              key={s.label}
              className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200"
              style={{
                background: hovered === i ? `${s.color}15` : 'rgba(30,41,59,0.4)',
                border: `1px solid ${hovered === i ? s.color + '40' : 'rgba(255,255,255,0.05)'}`,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Color dot */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: s.color, boxShadow: `0 0 6px ${s.color}80` }}
              />
              <span className="text-xs flex-1" style={{ color: '#94a3b8' }}>
                {s.emoji} {s.label}
              </span>
              <span className="text-xs font-bold flex-shrink-0" style={{ color: s.color }}>
                {s.count}
              </span>
              <span className="text-[10px] flex-shrink-0 w-12 text-right" style={{ color: '#475569' }}>
                {pct}%
              </span>
              {/* Bar */}
              <div className="w-16 h-1.5 rounded-full overflow-hidden flex-shrink-0"
                   style={{ background: 'rgba(15,23,42,0.8)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: s.color,
                    transition: 'width 0.8s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────
const KPI_VARIANTS = {
  indigo: { cls: 'kpi-indigo', iconBg: 'rgba(99,102,241,0.18)', iconColor: '#818cf8', valueCls: 'text-indigo-300', glow: 'rgba(99,102,241,0.15)' },
  blue:   { cls: 'kpi-blue',   iconBg: 'rgba(59,130,246,0.18)', iconColor: '#60a5fa', valueCls: 'text-blue-300',   glow: 'rgba(59,130,246,0.15)' },
  gold:   { cls: 'kpi-gold',   iconBg: 'rgba(212,175,55,0.18)', iconColor: '#d4af37', valueCls: 'text-yellow-300', glow: 'rgba(212,175,55,0.15)' },
}

function KpiCard({ icon: Icon, label, value, sub, variant = 'indigo' }) {
  const v = KPI_VARIANTS[variant]
  return (
    <div className={`kpi-card ${v.cls} animate-in`}>
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: v.glow, filter: 'blur(28px)', transform: 'translate(30%,-30%)' }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>
            {label}
          </p>
          <p className={`text-4xl font-black ${v.valueCls}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs mt-1.5" style={{ color: '#475569' }}>{sub}</p>}
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
             style={{ background: v.iconBg }}>
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
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-base font-bold text-white"
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
             style={{ background: 'rgba(11,15,25,0.3)', border: '1px dashed rgba(100,116,139,0.3)' }}>
          <p className="text-xs" style={{ color: '#334155' }}>⏳ Belum ada tes</p>
        </div>
      )}

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Link to={`/test/new?murid=${murid.id}`} id={`test-new-btn-${murid.id}`}
              className="btn-primary flex-1 text-center text-xs py-2">
          Tes Baru
        </Link>
        <Link to={`/students/${murid.id}/history`} id={`history-btn-${murid.id}`}
              className="btn-secondary flex-1 text-center text-xs py-2">
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
  const [stats, setStats]         = useState({ total: 0, tesHariIni: 0, rataRata: null })
  const [levelDist, setLevelDist] = useState([])
  const [page, setPage]           = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // ── Fetch global stats + level distribution ──
  const fetchStats = async () => {
    // KPI stats
    const { data: kpiData } = await supabase.rpc('get_dashboard_stats')
    const row = Array.isArray(kpiData) ? kpiData[0] : kpiData
    setStats({
      total:      row?.total_murid ?? 0,
      tesHariIni: row?.tes_hari_ini ?? 0,
      rataRata:   row?.rata_rata_skor != null ? Number(row.rata_rata_skor).toFixed(1) : null,
    })

    // Level distribution: last test per student
    const [{ count: totalMurid }, { data: distData }] = await Promise.all([
      supabase.from('murid').select('*', { count: 'exact', head: true }),
      supabase.from('last_test_per_murid').select('level'),
    ])

    const counts = {}
    for (const { level } of (distData || [])) {
      counts[level] = (counts[level] || 0) + 1
    }
    const testedCount = (distData || []).length
    const belumTes    = (totalMurid || 0) - testedCount

    const dist = LEVEL_META.map((lv) => ({
      ...lv,
      count: lv.label === 'Belum Tes' ? Math.max(0, belumTes) : (counts[lv.label] || 0),
    }))
    setLevelDist(dist)
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

  // Total for donut (exclude zero segments from display but keep for calc)
  const chartTotal = levelDist.reduce((s, d) => s + d.count, 0)

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Page header ── */}
      <div className="animate-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[10px] font-arabic mb-1" style={{ color: '#334155' }}>الحمد لله</div>
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
        <KpiCard icon={Users}       label="Total Murid"    value={stats.total}         sub="Murid terdaftar"     variant="indigo" />
        <KpiCard icon={ClipboardList} label="Tes Hari Ini" value={stats.tesHariIni}    sub="Penilaian dilakukan" variant="blue" />
        <KpiCard icon={TrendingUp}  label="Rata-rata Skor" value={stats.rataRata ?? '—'} sub="Dari semua tes"   variant="gold" />
      </div>

      {/* ── Chart + Distribusi Level ── */}
      {chartTotal > 0 && (
        <div className="card p-6 animate-in">
          <h2 className="section-title flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5" style={{ color: '#d4af37' }} />
            Distribusi Kondisi Murid
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Donut chart */}
            <div className="flex justify-center">
              <DonutChart segments={levelDist} total={chartTotal} />
            </div>

            {/* Summary cards per level */}
            <div className="grid grid-cols-2 gap-3">
              {levelDist.map((lv) => {
                if (lv.count === 0) return null
                const pct = ((lv.count / chartTotal) * 100).toFixed(1)
                return (
                  <div
                    key={lv.label}
                    className="rounded-2xl p-3 text-center transition-all duration-200"
                    style={{
                      background: `${lv.color}12`,
                      border: `1px solid ${lv.color}30`,
                    }}
                  >
                    <div className="text-xl mb-1">{lv.emoji}</div>
                    <p className="text-[11px] font-bold leading-tight" style={{ color: lv.color }}>
                      {lv.label}
                    </p>
                    <p className="text-2xl font-black mt-1" style={{ color: lv.color }}>
                      {lv.count}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>
                      {pct}%
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Search + Student Grid ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h2 className="section-title flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: '#d4af37' }} />
            Daftar Murid
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: '#475569' }} />
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
                <button id="dashboard-prev-page-btn"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="btn-secondary p-2 disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm px-2" style={{ color: '#94a3b8' }}>
                  {page} / {totalPages}
                </span>
                <button id="dashboard-next-page-btn"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="btn-secondary p-2 disabled:opacity-40">
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
