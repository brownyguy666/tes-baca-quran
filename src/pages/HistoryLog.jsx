import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LEVELS } from '../utils/scoring'
import {
  FileText, Search, Filter, Calendar, ArrowLeft,
  ChevronLeft, ChevronRight, Loader2, User, Download,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'

const PAGE_SIZE = 30

function LevelBadge({ level }) {
  const styleMap = {
    'Mumtaz (Tartil)': 'level-mumtaz',
    'Mahir':           'level-mahir',
    'Menengah':        'level-menengah',
    'Dasar':           'level-dasar',
    'Pemula':          'level-pemula',
  }
  const l = LEVELS.find((x) => x.label === level)
  return (
    <span className={`badge-level ${styleMap[level] || 'level-pemula'}`}>
      {l?.emoji} {level || '—'}
    </span>
  )
}

export default function HistoryLog() {
  const [tests, setTests]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [filterDate, setFilterDate]   = useState('')
  const [classes, setClasses]         = useState([])
  const [page, setPage]               = useState(1)
  const [total, setTotal]             = useState(0)

  // Fetch distinct classes for filter dropdown
  useEffect(() => {
    supabase.from('murid').select('kelas').order('kelas').then(({ data }) => {
      const unique = [...new Set((data || []).map((r) => r.kelas))].filter(Boolean)
      setClasses(unique)
    })
  }, [])

  const fetchTests = async (pg = 1) => {
    setLoading(true)
    const from = (pg - 1) * PAGE_SIZE
    const to   = from + PAGE_SIZE - 1

    let query = supabase
      .from('hasil_tes')
      .select('*, murid:murid_id(nama, kelas, nisn)', { count: 'exact' })
      .order('tanggal_tes', { ascending: false })
      .order('created_at', { ascending: false })

    if (filterDate) query = query.eq('tanggal_tes', filterDate)

    const { data, error, count } = await query.range(from, to)
    if (error) { toast.error('Gagal memuat data'); setLoading(false); return }

    // Client-side filter for search + kelas
    let rows = data || []
    if (search.trim()) {
      const s = search.trim().toLowerCase()
      rows = rows.filter(
        (t) =>
          t.murid?.nama?.toLowerCase().includes(s) ||
          t.guru_penguji?.toLowerCase().includes(s) ||
          t.murid?.kelas?.toLowerCase().includes(s)
      )
    }
    if (filterKelas) {
      rows = rows.filter((t) => t.murid?.kelas === filterKelas)
    }

    setTests(rows)
    setTotal(count || 0)
    setLoading(false)
  }

  useEffect(() => { setPage(1) }, [search, filterKelas, filterDate])
  useEffect(() => { fetchTests(page) }, [page, filterDate])

  const filtered = tests.filter((t) => {
    const s = search.trim().toLowerCase()
    const matchSearch = !s ||
      t.murid?.nama?.toLowerCase().includes(s) ||
      t.guru_penguji?.toLowerCase().includes(s) ||
      t.murid?.kelas?.toLowerCase().includes(s)
    const matchKelas  = !filterKelas || t.murid?.kelas === filterKelas
    return matchSearch && matchKelas
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleReset = () => {
    setSearch(''); setFilterKelas(''); setFilterDate(''); setPage(1)
  }

  const handleDelete = async (testId, studentName) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus data tes ${studentName || ''}?\n\nTindakan ini tidak dapat dibatalkan.`
    )
    if (!confirmDelete) return

    const { error } = await supabase.from('hasil_tes').delete().eq('id', testId)
    if (error) {
      toast.error('Gagal menghapus data tes: ' + error.message)
      return
    }

    toast.success('Data tes berhasil dihapus! 🗑️')
    setTests((prev) => prev.filter((t) => t.id !== testId))
    setTotal((prev) => Math.max(0, prev - 1))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-in">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-3 transition-colors"
          style={{ color: '#475569' }}
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <h1 className="section-title flex items-center gap-2">
          <FileText className="w-6 h-6" style={{ color: '#d4af37' }} />
          Riwayat / Log Penilaian
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>
          Log aktivitas penilaian seluruh murid secara kronologis
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 animate-in">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: '#475569' }} />
            <input
              id="history-search"
              type="text"
              placeholder="Cari nama murid / penguji…"
              className="input-field pl-10 py-2.5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Kelas filter */}
          <select
            id="history-filter-kelas"
            className="input-field w-full sm:w-44 py-2.5"
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {classes.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>

          {/* Date filter */}
          <input
            id="history-filter-date"
            type="date"
            className="input-field w-full sm:w-44 py-2.5"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />

          <button
            className="btn-secondary py-2.5 px-4 whitespace-nowrap"
            onClick={handleReset}
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#334155' }} />
          <p className="text-sm" style={{ color: '#475569' }}>Memuat log penilaian…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: '#334155' }} />
          <p style={{ color: '#64748b' }}>Tidak ada data yang sesuai filter</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card overflow-hidden animate-in">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Tanggal', 'Murid', 'Kelas', 'Penguji', 'Makhraj', 'Tajwid', 'Kelancaran', 'Total', 'Level', 'Aksi']
                      .map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3.5 text-left text-[11px] font-black uppercase tracking-widest"
                          style={{ color: '#334155', whiteSpace: 'nowrap' }}
                        >
                          {h}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr
                      key={t.id}
                      id={`log-row-${t.id}`}
                      className="transition-colors"
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                    >
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#64748b' }}>
                        {new Date(t.tanggal_tes).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,0.25)', color: '#818cf8' }}
                          >
                            {(t.murid?.nama || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium" style={{ color: '#cbd5e1' }}>
                            {t.murid?.nama || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: '#64748b' }}>
                        {t.murid?.kelas || '—'}
                      </td>
                      <td className="px-4 py-3" style={{ color: '#64748b' }}>
                        {t.guru_penguji || '—'}
                      </td>
                      {[t.skor_makhraj, t.skor_tajwid, t.skor_kelancaran].map((s, si) => (
                        <td key={si} className="px-4 py-3 text-center font-mono"
                            style={{ color: '#94a3b8' }}>
                          {s ?? '—'}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        <span className="text-base font-black" style={{ color: '#f8fafc' }}>
                          {t.skor_total}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <LevelBadge level={t.level} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/test/result/${t.id}`}
                            className="btn-secondary text-xs py-1.5 px-3"
                            id={`view-log-${t.id}`}
                          >
                            Detail
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id, t.murid?.nama)}
                            className="p-1.5 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                            title="Hapus data tes ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: '#475569' }}>
              Total {total} entri
            </p>
            <div className="flex items-center gap-2">
              <button
                className="btn-secondary p-2 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                id="history-prev-btn"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm px-2" style={{ color: '#94a3b8' }}>
                {page} / {totalPages}
              </span>
              <button
                className="btn-secondary p-2 disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                id="history-next-btn"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
