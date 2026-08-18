import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { LEVELS } from '../utils/scoring'
import * as XLSX from 'xlsx'
import {
  BarChart3, Filter, Download, FileSpreadsheet,
  Printer, ChevronDown, Loader2, TrendingUp,
  GraduationCap, Calendar, UserCheck, Sparkles, CheckCircle,
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

// ── Native Excel Export (.xlsx) via SheetJS ─────────────────
function exportExcel(rows, kelas) {
  try {
    const wb = XLSX.utils.book_new()

    // Build worksheet data with header
    const wsData = [
      ['SMP NEGERI 2 GLAGAH - BANYUWANGI'],
      ['REKAPITULASI HASIL TES KEMAMPUAN BACA AL-QUR\'AN'],
      [`Kelas: ${kelas || 'Semua Kelas'} | Tanggal Unduh: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`],
      [], // blank line
      [
        'No',
        'NISN',
        'Nama Murid',
        'Kelas',
        'Tanggal Tes',
        'Surat / Ayat yang Dibaca',
        'Skor Makhraj (35%)',
        'Skor Tajwid (40%)',
        'Skor Kelancaran (25%)',
        'Total Nilai',
        'Predikat Level',
        'Guru Penguji',
        'Catatan / Evaluasi',
      ],
      ...rows.map((t, i) => [
        i + 1,
        t.murid?.nisn || '-',
        t.murid?.nama || '',
        t.murid?.kelas || '',
        t.tanggal_tes || '',
        t.ayat_dibaca || '',
        Number(t.skor_makhraj) || 0,
        Number(t.skor_tajwid) || 0,
        Number(t.skor_kelancaran) || 0,
        Number(t.skor_total) || 0,
        t.level || '',
        t.guru_penguji || '',
        t.catatan || '',
      ]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 14 }, // NISN
      { wch: 28 }, // Nama
      { wch: 10 }, // Kelas
      { wch: 14 }, // Tanggal
      { wch: 26 }, // Surat/Ayat
      { wch: 18 }, // Makhraj
      { wch: 18 }, // Tajwid
      { wch: 20 }, // Kelancaran
      { wch: 12 }, // Total
      { wch: 18 }, // Level
      { wch: 26 }, // Penguji
      { wch: 35 }, // Catatan
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Penilaian')
    const fileName = `Rekap_Baca_Quran_SMPN2Glagah_${kelas ? `Kelas_${kelas}` : 'Semua_Kelas'}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
    toast.success('File Excel (.xlsx) berhasil diunduh! 📊')
  } catch (err) {
    console.error(err)
    toast.error('Gagal membuat file Excel')
  }
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
    <div className="max-w-5xl w-full mx-auto space-y-6 min-w-0">
      {/* Header (Hidden on print) */}
      <div className="animate-in print:hidden">
        <h1 className="section-title flex items-center gap-2">
          <BarChart3 className="w-6 h-6" style={{ color: '#d4af37' }} />
          Rekap &amp; Laporan Nilai
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>
          Distribusi capaian level, statistik kelas, cetak rapor, dan unduh Excel resmi
        </p>
      </div>

      {/* ── Filter Card (Hidden on print) ── */}
      <div className="card p-5 space-y-4 animate-in print:hidden">
        <h2 className="font-semibold text-sm flex items-center gap-2" style={{ color: '#cbd5e1' }}>
          <Filter className="w-4 h-4" style={{ color: '#d4af37' }} />
          Filter Rekapitulasi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label" htmlFor="filter-kelas">Pilih Kelas</label>
            <select
              id="filter-kelas"
              className="input-field"
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
            >
              <option value="">Semua Kelas</option>
              {classes.map((k) => (
                <option key={k} value={k}>Kelas {k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="filter-from">Dari Tanggal</label>
            <input
              id="filter-from"
              type="date"
              className="input-field"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="filter-to">Sampai Tanggal</label>
            <input
              id="filter-to"
              type="date"
              className="input-field"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <button
            id="generate-report-btn"
            className="btn-primary flex items-center gap-2"
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            <span>{loading ? 'Memuat Data…' : 'Generate Laporan'}</span>
          </button>
        </div>
      </div>

      {/* ── Results Area (Screen View) ── */}
      {fetched && (
        <>
          {/* KPI Summary (Hidden on print) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in print:hidden">
            <div className="kpi-card kpi-indigo">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#475569' }}>
                Total Tes Terdata
              </p>
              <p className="text-3xl font-black text-indigo-300">{data.length}</p>
              <p className="text-xs mt-1" style={{ color: '#475569' }}>
                {filterKelas ? `Kelas ${filterKelas}` : 'Semua kelas'}
              </p>
            </div>
            <div className="kpi-card kpi-gold">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#475569' }}>
                Rata-rata Skor
              </p>
              <p className="text-3xl font-black text-yellow-300">{avgScore}</p>
              <p className="text-xs mt-1" style={{ color: '#475569' }}>Skor tertimbang</p>
            </div>
            <div className="kpi-card kpi-blue">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#475569' }}>
                Level Terbanyak
              </p>
              <p className="text-2xl font-black text-blue-300 truncate">
                {bestLevel.emoji} {bestLevel.label.split(' ')[0]}
              </p>
              <p className="text-xs mt-1" style={{ color: '#475569' }}>
                {dist[bestLevel.label] || 0} murid
              </p>
            </div>
          </div>

          {/* Chart card (Hidden on print) */}
          <div className="card p-6 space-y-4 animate-in print:hidden">
            <h2 className="font-semibold flex items-center gap-2" style={{ color: '#cbd5e1' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#d4af37' }} />
              Distribusi Level Bacaan
            </h2>
            <LevelChart dist={dist} total={data.length} />
          </div>

          {/* Action Bar (Hidden on print) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in print:hidden">
            <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>
              Ditemukan <span style={{ color: '#f8fafc' }}>{data.length}</span> rekam penilaian
              {filterKelas && ` untuk Kelas ${filterKelas}`}
            </p>
            <div className="flex gap-2.5 flex-wrap">
              <button
                id="export-excel-btn"
                className="btn-gold flex items-center gap-2 text-xs py-2.5"
                onClick={() => exportExcel(data, filterKelas)}
                disabled={data.length === 0}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Download Excel (.xlsx)
              </button>
              <button
                id="print-report-btn"
                className="btn-secondary flex items-center gap-2 text-xs py-2.5"
                onClick={() => window.print()}
                disabled={data.length === 0}
              >
                <Printer className="w-4 h-4" style={{ color: '#3b82f6' }} />
                Cetak Lembar Resmi
              </button>
            </div>
          </div>

          {/* Data preview on screen */}
          {data.length > 0 && (
            <>
              {/* ── Mobile Card List (Mobile only) ── */}
              <div className="block md:hidden space-y-3 animate-in print:hidden">
                {data.slice(0, 30).map((t, i) => (
                  <div key={t.id} className="card p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-100 truncate">
                          {i + 1}. {t.murid?.nama || '—'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Kelas {t.murid?.kelas || '—'} {t.murid?.nisn ? `· NISN: ${t.murid.nisn}` : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-lg font-black text-amber-300">{t.skor_total}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-white/5">
                      <span
                        className="badge-level text-[10px]"
                        style={{
                          background: LEVEL_META.find((l) => l.label === t.level)?.bg || 'rgba(71,85,105,0.3)',
                          color: LEVEL_META.find((l) => l.label === t.level)?.color || '#94a3b8',
                          border: `1px solid ${LEVEL_META.find((l) => l.label === t.level)?.color || '#64748b'}40`,
                        }}
                      >
                        {t.level}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">M:{t.skor_makhraj}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">T:{t.skor_tajwid}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">K:{t.skor_kelancaran}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {data.length > 30 && (
                  <p className="text-xs text-center py-2 text-slate-400">
                    Menampilkan 30 dari {data.length} hasil. Download Excel untuk data lengkap.
                  </p>
                )}
              </div>

              {/* ── Desktop Table (Desktop only) ── */}
              <div className="hidden md:block card overflow-hidden animate-in print:hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        {['No', 'Nama', 'Kelas', 'NISN', 'Tanggal', 'Makhraj', 'Tajwid', 'Kelancaran', 'Total', 'Level']
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
                          <td className="px-4 py-2.5 text-xs font-mono" style={{ color: '#64748b' }}>
                            {t.murid?.nisn || '—'}
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
                            <span className="font-black text-amber-300">{t.skor_total}</span>
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
                      Menampilkan 50 dari {data.length} baris. Klik <strong>Download Excel</strong> untuk semua data.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════
              PRINTABLE TEMPLATE (Only visible when printing window.print)
              ══════════════════════════════════════════════════════════ */}
          <div className="hidden print:block text-black bg-white p-8 font-sans">
            {/* Kop Surat Resmi Sekolah */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h3 className="text-sm uppercase font-bold tracking-wider m-0">
                Pemerintah Kabupaten Banyuwangi · Dinas Pendidikan
              </h3>
              <h1 className="text-xl uppercase font-black tracking-wide my-1">
                SMP NEGERI 2 GLAGAH
              </h1>
              <p className="text-xs text-gray-700 m-0">
                Jl. Raya Glagah, Kecamatan Glagah, Kabupaten Banyuwangi, Jawa Timur
              </p>
              <p className="text-xs text-gray-700 m-0">
                Laman Resmi: smpn2glagah.sch.id · Email: info@smpn2glagah.sch.id
              </p>
            </div>

            {/* Document Title */}
            <div className="text-center mb-6">
              <h2 className="text-base font-bold uppercase underline tracking-wider mb-1">
                REKAPITULASI HASIL TES KEMAMPUAN BACA AL-QUR'AN
              </h2>
              <p className="text-xs text-gray-700">
                Tahun Ajaran {new Date().getFullYear()}/{new Date().getFullYear() + 1}
                {filterKelas ? ` — Kelas: ${filterKelas}` : ' — Semua Kelas'}
              </p>
            </div>

            {/* Print Table */}
            <table className="w-full text-xs border-collapse border border-black mb-8">
              <thead>
                <tr className="bg-gray-100 font-bold text-center">
                  <th className="border border-black p-2 w-8">No</th>
                  <th className="border border-black p-2 w-28">NISN</th>
                  <th className="border border-black p-2 text-left">Nama Peserta Didik</th>
                  <th className="border border-black p-2 w-16">Kelas</th>
                  <th className="border border-black p-2 w-24">Tanggal</th>
                  <th className="border border-black p-2 w-16">Makhraj</th>
                  <th className="border border-black p-2 w-16">Tajwid</th>
                  <th className="border border-black p-2 w-16">Lancar</th>
                  <th className="border border-black p-2 w-16 bg-gray-200">Total</th>
                  <th className="border border-black p-2 w-28">Predikat Level</th>
                </tr>
              </thead>
              <tbody>
                {data.map((t, i) => (
                  <tr key={t.id} className="text-center">
                    <td className="border border-black p-1.5">{i + 1}</td>
                    <td className="border border-black p-1.5 font-mono">{t.murid?.nisn || '-'}</td>
                    <td className="border border-black p-1.5 text-left font-semibold">{t.murid?.nama || '-'}</td>
                    <td className="border border-black p-1.5">{t.murid?.kelas || '-'}</td>
                    <td className="border border-black p-1.5">{t.tanggal_tes || '-'}</td>
                    <td className="border border-black p-1.5">{t.skor_makhraj}</td>
                    <td className="border border-black p-1.5">{t.skor_tajwid}</td>
                    <td className="border border-black p-1.5">{t.skor_kelancaran}</td>
                    <td className="border border-black p-1.5 font-bold bg-gray-50">{t.skor_total}</td>
                    <td className="border border-black p-1.5 font-semibold">{t.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Area */}
            <div className="flex justify-between items-start text-xs pt-4">
              <div className="text-center w-64">
                <p className="m-0">Mengetahui,</p>
                <p className="font-semibold m-0 mb-16">Kepala SMP Negeri 2 Glagah</p>
                <p className="font-bold underline m-0">( .................................................... )</p>
                <p className="text-[11px] text-gray-600 m-0">NIP. .........................................</p>
              </div>
              <div className="text-center w-64">
                <p className="m-0">Banyuwangi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-semibold m-0 mb-16">Guru Penguji / PAI</p>
                <p className="font-bold underline m-0">{data[0]?.guru_penguji || '( .................................................... )'}</p>
                <p className="text-[11px] text-gray-600 m-0">Guru Pendidikan Agama Islam</p>
              </div>
            </div>
          </div>
        </>
      )}

      {!fetched && !loading && (
        <div className="card p-16 text-center animate-in print:hidden">
          <BarChart3 className="w-14 h-14 mx-auto mb-4" style={{ color: '#1e293b' }} />
          <p className="font-medium" style={{ color: '#475569' }}>
            Pilih kelas/tanggal dan klik <span style={{ color: '#d4af37' }}>Generate Laporan</span> untuk melihat data &amp; ekspor
          </p>
        </div>
      )}
    </div>
  )
}
