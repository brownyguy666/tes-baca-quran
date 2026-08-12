import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LEVELS } from '../utils/scoring'
import { generateCertificatePDF } from '../utils/pdfGenerator'
import CertificateTemplate from '../components/CertificateTemplate'
import {
  ArrowLeft, Download, Calendar, BookOpen, ClipboardList,
  Loader2, TrendingUp, Star, Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'

function LevelBadge({ level }) {
  const colorMap = {
    'Mumtaz (Tartil)': 'bg-amber-900/50 text-amber-300 border-amber-700',
    'Mahir':           'bg-green-900/50 text-green-300 border-green-700',
    'Menengah':        'bg-orange-900/40 text-orange-300 border-orange-700',
    'Dasar':           'bg-blue-900/40 text-blue-300 border-blue-700',
    'Pemula':          'bg-gray-800/60 text-gray-300 border-gray-700',
  }
  const l = LEVELS.find((x) => x.label === level)
  const cls = colorMap[level] || colorMap['Pemula']
  return (
    <span className={`badge-level border ${cls}`}>
      {l?.emoji} {level || '-'}
    </span>
  )
}

function HistoryItem({ tes, murid, onDownload, downloadingId }) {
  const isDownloading = downloadingId === tes.id
  return (
    <div
      id={`history-item-${tes.id}`}
      className="card p-5 space-y-4 animate-in hover:border-islamic-600/50 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <LevelBadge level={tes.level} />
            <span className="text-2xl font-black text-islamic-100">{tes.skor_total}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-islamic-500">
            <Calendar className="w-3 h-3" />
            {new Date(tes.tanggal_tes).toLocaleDateString('id-ID', {
              weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </div>
          {tes.ayat_dibaca && (
            <div className="flex items-center gap-1.5 text-xs text-islamic-500">
              <BookOpen className="w-3 h-3" />
              <span className="italic">{tes.ayat_dibaca}</span>
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
              : <Download className="w-3 h-3" />
            }
            PDF
          </button>
        </div>
      </div>

      {/* Score breakdown mini */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Makhraj',    score: tes.skor_makhraj },
          { label: 'Tajwid',    score: tes.skor_tajwid },
          { label: 'Kelancaran', score: tes.skor_kelancaran },
        ].map(({ label, score }) => (
          <div key={label} className="bg-islamic-900/40 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-islamic-500 font-medium">{label}</p>
            <p className="text-base font-bold text-islamic-200 mt-0.5">{score}</p>
          </div>
        ))}
      </div>

      {tes.catatan && (
        <p className="text-xs text-islamic-500 italic border-t border-islamic-800/40 pt-2">
          📝 {tes.catatan}
        </p>
      )}

      {/* Hidden template for this specific test (for PDF) */}
      <div style={{ display: 'none' }}>
        <CertificateTemplate result={{ ...tes, murid }} id={`cert-tmpl-${tes.id}`} />
      </div>
    </div>
  )
}

export default function TestHistory() {
  const { id: muridId }   = useParams()
  const [murid, setMurid] = useState(null)
  const [tests, setTests] = useState([])
  const [loading, setLoading]       = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => { fetchData() }, [muridId])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: muridData }, { data: tesData }] = await Promise.all([
      supabase.from('murid').select('*').eq('id', muridId).single(),
      supabase.from('hasil_tes').select('*').eq('murid_id', muridId).order('tanggal_tes', { ascending: false }),
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
      toast.error('Gagal generate PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  // Simple stats
  const avgScore = tests.length
    ? (tests.reduce((s, t) => s + (t.skor_total || 0), 0) / tests.length).toFixed(1)
    : '-'
  const bestTest = tests.reduce((best, t) => (!best || t.skor_total > best.skor_total) ? t : best, null)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 text-islamic-500 animate-spin" />
      </div>
    )
  }

  if (!murid) {
    return (
      <div className="text-center py-20">
        <p className="text-islamic-400">Murid tidak ditemukan</p>
        <Link to="/students" className="btn-secondary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-islamic-400 hover:text-islamic-200 transition-colors animate-in"
        id="back-to-dashboard-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* Student header */}
      <div className="card p-6 animate-in">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-islamic-600 to-islamic-800
                          flex items-center justify-center text-xl font-black text-gold-300 shadow-glow-green">
            {murid.nama.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold font-display text-islamic-50">{murid.nama}</h1>
            <p className="text-sm text-islamic-400">Kelas {murid.kelas} · NISN {murid.nisn || '-'}</p>
          </div>
          <Link
            to={`/test/new?murid=${murid.id}`}
            id="new-test-for-student-btn"
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Tes Baru
          </Link>
        </div>

        {tests.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-islamic-800/40">
            <div className="text-center">
              <p className="text-2xl font-bold text-islamic-100">{tests.length}</p>
              <p className="text-xs text-islamic-500 mt-0.5">Total Tes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-islamic-100">{avgScore}</p>
              <p className="text-xs text-islamic-500 mt-0.5">Rata-rata</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-islamic-100">{bestTest?.skor_total || '-'}</p>
              <p className="text-xs text-islamic-500 mt-0.5">Skor Terbaik</p>
            </div>
          </div>
        )}
      </div>

      {/* History list */}
      <div className="space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-gold-400" />
          Riwayat Tes
        </h2>

        {tests.length === 0 ? (
          <div className="card p-12 text-center">
            <TrendingUp className="w-10 h-10 text-islamic-700 mx-auto mb-3" />
            <p className="text-islamic-400 font-medium">Belum ada riwayat tes</p>
            <p className="text-sm text-islamic-600 mt-1">Mulai tes pertama untuk murid ini</p>
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
              downloadingId={downloadingId}
            />
          ))
        )}
      </div>
    </div>
  )
}
