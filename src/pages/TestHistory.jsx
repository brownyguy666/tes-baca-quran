import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LEVELS } from '../utils/scoring'
import { generateCertificatePDF } from '../utils/pdfGenerator'
import CertificateTemplate from '../components/CertificateTemplate'
import {
  ArrowLeft, Download, Calendar, BookOpen, ClipboardList,
  Loader2, TrendingUp, Star, Plus, Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'

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

function HistoryItem({ tes, murid, onDownload, onDelete, isDownloading }) {
  return (
    <div
      id={`history-item-${tes.id}`}
      className="card p-5 space-y-4 animate-in transition-all duration-200"
      style={{ ':hover': { borderColor: 'rgba(212,175,55,0.25)' } }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <LevelBadge level={tes.level} />
            <span className="text-2xl font-black" style={{ color: '#f8fafc' }}>
              {tes.skor_total}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
            <Calendar className="w-3 h-3" />
            {new Date(tes.tanggal_tes).toLocaleDateString('id-ID', {
              weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </div>
          {tes.ayat_dibaca && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
              <BookOpen className="w-3 h-3" />
              <span className="italic">{tes.ayat_dibaca}</span>
            </div>
          )}
          {tes.guru_penguji && (
            <div className="text-xs" style={{ color: '#334155' }}>
              Penguji: {tes.guru_penguji}
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            to={`/test/result/${tes.id}`}
            id={`view-result-${tes.id}`}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Star className="w-3 h-3" /> Detail
          </Link>
          <button
            id={`download-cert-${tes.id}`}
            onClick={() => onDownload(tes, murid)}
            disabled={isDownloading}
            className="btn-gold text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            {isDownloading
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <Download className="w-3 h-3" />}
            PDF
          </button>
          <button
            id={`delete-test-${tes.id}`}
            onClick={() => onDelete(tes.id)}
            className="p-1.5 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
            title="Hapus hasil tes ini"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Makhraj',    score: tes.skor_makhraj,    color: '#818cf8' },
          { label: 'Tajwid',    score: tes.skor_tajwid,     color: '#d4af37' },
          { label: 'Kelancaran', score: tes.skor_kelancaran, color: '#34d399' },
        ].map(({ label, score, color }) => (
          <div
            key={label}
            className="rounded-xl p-2.5 text-center"
            style={{
              background: 'rgba(11,15,25,0.5)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p className="text-[10px] font-medium mb-0.5" style={{ color: '#475569' }}>{label}</p>
            <p className="text-base font-black" style={{ color }}>{score}</p>
          </div>
        ))}
      </div>

      {tes.catatan && (
        <p className="text-xs italic pt-2"
           style={{ color: '#475569', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          📝 {tes.catatan}
        </p>
      )}

      <CertificateTemplate result={{ ...tes, murid }} id={`cert-tmpl-${tes.id}`} />
    </div>
  )
}

export default function TestHistory() {
  const { id: muridId }              = useParams()
  const [murid, setMurid]            = useState(null)
  const [tests, setTests]            = useState([])
  const [loading, setLoading]        = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => { fetchData() }, [muridId])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: muridData }, { data: tesData }] = await Promise.all([
      supabase.from('murid').select('*').eq('id', muridId).single(),
      supabase.from('hasil_tes').select('*').eq('murid_id', muridId)
               .order('tanggal_tes', { ascending: false }),
    ])
    setMurid(muridData)
    setTests(tesData || [])
    setLoading(false)
  }

  const handleDownload = async (tes, muridData) => {
    setDownloadingId(tes.id)
    try {
      const filename = `sertifikat-${muridData?.nama?.replace(/\s+/g, '-') || 'murid'}-${tes.tanggal_tes}`
      await generateCertificatePDF(`cert-tmpl-${tes.id}`, filename)
      toast.success('Sertifikat berhasil diunduh!')
    } catch (err) {
      console.error(err)
      toast.error('Gagal generate PDF: ' + err.message)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (testId) => {
    const confirmDelete = window.confirm(
      'Apakah Anda yakin ingin menghapus rekam hasil tes ini?\n\nTindakan ini tidak dapat dibatalkan.'
    )
    if (!confirmDelete) return

    const { error } = await supabase.from('hasil_tes').delete().eq('id', testId)
    if (error) {
      toast.error('Gagal menghapus tes: ' + error.message)
      return
    }

    toast.success('Hasil tes berhasil dihapus! 🗑️')
    setTests((prev) => prev.filter((t) => t.id !== testId))
  }

  const avgScore = tests.length
    ? (tests.reduce((s, t) => s + (t.skor_total || 0), 0) / tests.length).toFixed(1)
    : '—'
  const bestTest = tests.reduce(
    (best, t) => (!best || t.skor_total > best.skor_total) ? t : best, null
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#334155' }} />
      </div>
    )
  }

  if (!murid) {
    return (
      <div className="text-center py-20">
        <p style={{ color: '#475569' }}>Murid tidak ditemukan</p>
        <Link to="/students" className="btn-secondary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm transition-colors animate-in"
        style={{ color: '#475569' }}
        id="back-to-dashboard-btn"
      >
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      {/* Student header */}
      <div className="card p-6 animate-in">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg,#6366f1,#4338ca)',
              color: '#fff',
            }}
          >
            {murid.nama.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold font-display" style={{ color: '#f8fafc' }}>
              {murid.nama}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#475569' }}>
              Kelas {murid.kelas} · NISN {murid.nisn || '—'}
            </p>
          </div>
          <Link
            to={`/test/new?murid=${murid.id}`}
            id="new-test-for-student-btn"
            className="btn-gold flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Tes Baru
          </Link>
        </div>

        {tests.length > 0 && (
          <div
            className="grid grid-cols-3 gap-3 mt-5 pt-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            {[
              { label: 'Total Tes', value: tests.length, color: '#818cf8' },
              { label: 'Rata-rata', value: avgScore, color: '#d4af37' },
              { label: 'Skor Terbaik', value: bestTest?.skor_total || '—', color: '#34d399' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black" style={{ color }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History list */}
      <div className="space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <ClipboardList className="w-5 h-5" style={{ color: '#d4af37' }} />
          Riwayat Tes
        </h2>

        {tests.length === 0 ? (
          <div className="card p-12 text-center">
            <TrendingUp className="w-10 h-10 mx-auto mb-3" style={{ color: '#1e293b' }} />
            <p className="font-medium" style={{ color: '#475569' }}>
              Belum ada riwayat tes
            </p>
            <p className="text-sm mt-1" style={{ color: '#334155' }}>
              Mulai tes pertama untuk murid ini
            </p>
            <Link
              to={`/test/new?murid=${murid.id}`}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Mulai Tes
            </Link>
          </div>
        ) : (
          tests.map((tes) => (
            <HistoryItem
              key={tes.id}
              tes={tes}
              murid={murid}
              onDownload={handleDownload}
              onDelete={handleDelete}
              isDownloading={downloadingId === tes.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
