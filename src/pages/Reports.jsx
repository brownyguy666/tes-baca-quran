import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { LEVELS } from '../utils/scoring'
import {
  BarChart3, Filter, Download, FileSpreadsheet,
  Printer, ChevronDown, Loader2, TrendingUp,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Level config ──────────────────────────────────────────
const LEVEL_META = [
  { label: 'Mumtaz (Tartil)', emoji: '🌟', color: '#d4af37', bg: 'rgba(212,175,55,0.18)' },
  { label: 'Mahir',           emoji: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.18)' },
  { label: 'Menengah',        emoji: '📈', color: '#f59e0b', bg: 'rgba(245,158,11,0.18)' },
  { label: 'Dasar',           emoji: '📚', color: '#3b82f6', bg: 'rgba(59,130,246,0.18)' },
  { label: 'Pemula',          emoji: '🌱', color: '#64748b', bg: 'rgba(100,116,139,0.18)' },
]

// ── Bar Chart ─────────────────────────────────────────────
function LevelChart({ dist, total }) {
  const max = Math.max(1, ...Object.values(dist))
  return (
    <div className="space-y-3">
      {LEVEL_META.map((lv) => {
        const count = dist[lv.label] || 0
        const pct   = total ? ((count / total) * 100).toFixed(1) : '0.0'
        const barW  = max ? (count / max) * 100 : 0
        return (
          <div key={lv.label} className="flex items-center gap-3">
            <div className="w-32 flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold"
                 style={{ color: lv.color }}>
              {lv.emoji} {lv.label.split(' ')[0]}
            </div>
            <div className="flex-1 h-8 rounded-xl overflow-hidden"
                 style={{ background: 'rgba(30,41,59,0.8)' }}>
              <div
                className="h-full rounded-xl flex items-center px-3 text-xs font-bold transition-all duration-1000"
                style={{
                  width: `${barW}%`,
                  background: lv.bg,
                  borderRight: `2px solid ${lv.color}`,
                  color: lv.color,
                  minWidth: count > 0 ? '2rem' : 0,
                }}
              >
                {count > 0 ? count : ''}
              </div>
            </div>
            <div className="w-14 text-right text-xs flex-shrink-0"
                 style={{ color: '#64748b' }}>
              {pct}%
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Export helpers ────────────────────────────────────────
function exportCSV(rows, kelas) {
  const headers = ['No', 'Nama', 'Kelas', 'NISN', 'Tanggal', 'Surat/Ayat',
                   'Makhraj', 'Tajwid', 'Kelancaran', 'Total', 'Level', 'Penguji', 'Catatan']
  const lines = [
    headers.join(','),
    ...rows.map((t, i) => [
      i + 1,
      `"${t.murid?.nama || ''}"`,
      t.murid?.kelas || '',
      t.murid?.nisn || '',
      t.tanggal_tes,
      `"${t.ayat_dibaca || ''}"`,
      t.skor_makhraj, t.skor_tajwid, t.skor_kelancaran, t.skor_total,
      `"${t.level || ''}"`,
      `"${t.guru_penguji || ''}"`,
      `"${(t.catatan || '').replace(/"/g, "'")}"`,
    ].join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `rekap-quran${kelas ? `-${kelas}` : ''}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('CSV berhasil diunduh!')
}

// ── Main Page ─────────────────────────────────────────────
export default function Reports() {
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(false)
  const [classes, setClasses]   = useState([])
  const [filterKelas, setFilterKelas] = useState('')
  const [dateFrom, setDateFrom]       = useState('')
  const [dateTo, setDateTo]           = useState('')
  const [fetched, setFetched]         = useState(false)

  // Fetch classes
  useEffect(() => {
    supabase.from('murid').select('kelas').order('kelas').then(({ data: d }) => {
      const unique = [...new Set((d || []).map((r) => r.kelas))].filter(Boolean)
      setClasses(unique)
    })
  }, [])

  const fetchReport = async () => {
    setLoading(true)
    let query = supabase
      .from('hasil_tes')
      .select('*, murid:murid_id(nama, kelas, nisn)')
      .order('tanggal_tes', { ascending: false })

    if (dateFrom) query = query.gte('tanggal_tes', dateFrom)
    if (dateTo)   query = query.lte('tanggal_tes', dateTo)

    const { data: rows, error } = await query
    if (error) { toast.error('Gagal memuat data'); setLoading(false); return }

    let filtered = rows || []
    if (filterKelas) filtered = filtered.filter((t) => t.murid?.kelas === filterKelas)

    setData(filtered)
    setFetched(true)
    setLoading(false)
  }

  // Level distribution
  const dist = LEVEL_META.reduce((acc, lv) => {
    acc[lv.label] = data.filter((t) => t.level === lv.label).length
    return acc
  }, {})

  const avgScore = data.length
    ? (data.reduce((s, t) => s + (t.skor_total || 0), 0) / data.length).toFixed(1)
    : '—'

  const bestLevel = LEVEL_META.find((lv) => dist[lv.label] > 0) || LEVEL_META[4]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-in">
        <h1 className="section-title flex items-center gap-2">
          <BarChart3 className="w-6 h-6" style={{ color: '#d4af37' }} />
          Rekap & Laporan
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>
          Distribusi level, statistik nilai, dan ekspor data
        </p>
      </div>

      {/* Filter panel */}
      <div className="card p-5 space-y-4 animate-in">
        <h2 className="font-semibold flex items-center gap-2 text-sm"
            style={{ color: '#94a3b8' }}>
          <Filter className="w-4 h-4" style={{ color: '#d4af37' }} />
          Filter Data
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Kelas</label>
            <select className="input-field py-2.5" value={filterKelas}
                    onChange={(e) => setFilterKelas(e.target.value)}>
              <option value="">Semua Kelas</option>
              {classes.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tanggal Mulai</label>
            <input type="date" className="input-field py-2.5"
                   value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">Tanggal Akhir</label>
            <input type="date" className="input-field py-2.5"
                   value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
        <button
          id="generate-report-btn"
          className="btn-primary flex items-center gap-2"
          onClick={fetchReport}
          disabled={loading}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Memuat…</>
            : <><TrendingUp className="w-4 h-4" />Generate Laporan</>
          }
        </button>
      </div>

      {fetched && !loading && (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in">
            {[
              { label: 'Total Tes', value: data.length, color: '#6366f1' },
              { label: 'Rata-rata Skor', value: avgScore, color: '#d4af37' },
              { label: 'Terbanyak',
                value: `${bestLevel.emoji} ${bestLevel.label.split(' ')[0]}`,
                color: bestLevel.color },
              { label: 'Kelas', value: filterKelas || 'Semua', color: '#10b981' },
            ].map((item) => (
              <div key={item.label} className="card p-4 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2"
                   style={{ color: '#334155' }}>{item.label}</p>
                <p className="text-2xl font-black" style={{ color: item.color }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="card p-6 animate-in">
            <h2 className="font-bold mb-5 flex items-center gap-2"
                style={{ color: '#e2e8f0' }}>
              <BarChart3 className="w-5 h-5" style={{ color: '#d4af37' }} />
              Distribusi Level Murid
            </h2>
            {data.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: '#475569' }}>
                Tidak ada data untuk filter yang dipilih
              </p>
            ) : (
              <LevelChart dist={dist} total={data.length} />
            )}
          </div>

          {/* Export buttons */}
          <div className="flex flex-wrap gap-3 animate-in">
            <button
              id="export-csv-btn"
              className="btn-secondary flex items-center gap-2"
              onClick={() => exportCSV(data, filterKelas)}
              disabled={data.length === 0}
            >
              <FileSpreadsheet className="w-4 h-4" style={{ color: '#10b981' }} />
              Export CSV / Excel
            </button>
            <button
              id="print-report-btn"
              className="btn-secondary flex items-center gap-2"
              onClick={() => window.print()}
              disabled={data.length === 0}
            >
              <Printer className="w-4 h-4" style={{ color: '#3b82f6' }} />
              Cetak Laporan
            </button>
          </div>

          {/* Data table */}
          {data.length > 0 && (
            <div className="card overflow-hidden animate-in">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['No','Nama','Kelas','Tanggal','Makhraj','Tajwid','Kelancaran','Total','Level']
                        .map((h) => (
                          <th key={h}
                              className="px-4 py-3.5 text-left text-[11px] font-black uppercase tracking-widest"
                              style={{ color: '#334155', whiteSpace: 'nowrap' }}>
                            {h}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 50).map((t, i) => (
                      <tr key={t.id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                          }}>
                        <td className="px-4 py-2.5 text-xs" style={{ color: '#475569' }}>{i+1}</td>
                        <td className="px-4 py-2.5 font-medium" style={{ color: '#cbd5e1' }}>
                          {t.murid?.nama || '—'}
                        </td>
                        <td className="px-4 py-2.5 text-xs" style={{ color: '#64748b' }}>
                          {t.murid?.kelas || '—'}
                        </td>
                        <td className="px-4 py-2.5 text-xs whitespace-nowrap" style={{ color: '#64748b' }}>
                          {new Date(t.tanggal_tes).toLocaleDateString('id-ID', {
                            day:'2-digit', month:'short', year:'numeric' })}
                        </td>
                        {[t.skor_makhraj, t.skor_tajwid, t.skor_kelancaran].map((s, si) => (
                          <td key={si} className="px-4 py-2.5 text-center font-mono text-xs"
                              style={{ color: '#94a3b8' }}>{s ?? '—'}</td>
                        ))}
                        <td className="px-4 py-2.5 text-center">
                          <span className="font-black" style={{ color: '#f8fafc' }}>{t.skor_total}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className="badge-level text-[10px]"
                            style={{
                              background: LEVEL_META.find((l)=>l.label===t.level)?.bg || 'rgba(71,85,105,0.3)',
                              color: LEVEL_META.find((l)=>l.label===t.level)?.color || '#94a3b8',
                              border: `1px solid ${LEVEL_META.find((l)=>l.label===t.level)?.color || '#64748b'}40`,
                            }}
                          >
                            {t.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 50 && (
                  <p className="text-xs text-center py-3" style={{ color: '#475569' }}>
                    Menampilkan 50 dari {data.length} baris. Export CSV untuk data lengkap.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {!fetched && !loading && (
        <div className="card p-16 text-center animate-in">
          <BarChart3 className="w-14 h-14 mx-auto mb-4" style={{ color: '#1e293b' }} />
          <p className="font-medium" style={{ color: '#475569' }}>
            Atur filter dan klik <span style={{ color: '#d4af37' }}>Generate Laporan</span> untuk melihat data
          </p>
        </div>
      )}
    </div>
  )
}
