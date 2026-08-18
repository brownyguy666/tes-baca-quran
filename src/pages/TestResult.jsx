import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CRITERIA, LEVELS } from '../utils/scoring'
import { generateCertificatePDF } from '../utils/pdfGenerator'
import CertificateTemplate from '../components/CertificateTemplate'
import {
  Download, ArrowLeft, Calendar, User, BookOpen,
  FileText, Loader2, CheckCircle, Star, Trash2,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'

function ScoreBar({ label, score, weight }) {
  const pct = Math.min(100, Math.max(0, score))
  const getColor = (s) => {
    if (s >= 91) return 'linear-gradient(90deg, #d97706, #fbbf24)'
    if (s >= 76) return 'linear-gradient(90deg, #059669, #34d399)'
    if (s >= 61) return 'linear-gradient(90deg, #ea580c, #fb923c)'
    if (s >= 41) return 'linear-gradient(90deg, #2563eb, #60a5fa)'
    return 'linear-gradient(90deg, #4b5563, #9ca3af)'
  }
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-semibold" style={{ color: '#cbd5e1' }}>{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px]" style={{ color: '#64748b' }}>bobot {(weight * 100).toFixed(0)}%</span>
          <span className="font-bold font-mono" style={{ color: '#f8fafc' }}>{score}</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(15,23,42,0.8)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: getColor(score) }}
        />
      </div>
    </div>
  )
}

export default function TestResult() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  useEffect(() => {
    fetchResult()
  }, [id])

  const fetchResult = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('hasil_tes')
      .select('*, murid(*)')
      .eq('id', id)
      .single()

    if (error || !data) {
      toast.error('Data tes tidak ditemukan')
    } else {
      setResult(data)
    }
    setLoading(false)
  }

  const handleDownloadPDF = async () => {
    setPdfLoading(true)
    try {
      const filename = `sertifikat-${result.murid?.nama?.replace(/\s+/g, '-') || 'murid'}-${result.tanggal_tes}`
      await generateCertificatePDF('certificate-template', filename)
      toast.success('Sertifikat berhasil diunduh!')
    } catch (err) {
      console.error(err)
      toast.error('Gagal generate PDF: ' + err.message)
    } finally {
      setPdfLoading(false)
    }
  }

  const handleDeleteTest = async () => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus hasil tes ini (${result.murid?.nama || 'Murid'} - Skor ${result.skor_total})?\n\nTindakan ini tidak dapat dibatalkan.`
    )
    if (!confirmDelete) return

    setDeleting(true)
    const { error } = await supabase.from('hasil_tes').delete().eq('id', id)
    if (error) {
      toast.error('Gagal menghapus tes: ' + error.message)
      setDeleting(false)
      return
    }

    toast.success('Hasil tes berhasil dihapus! 🗑️')
    if (result.murid_id) {
      navigate(`/students/${result.murid_id}/history`)
    } else {
      navigate('/history')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#d4af37' }} />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center py-20">
        <p style={{ color: '#64748b' }}>Data tidak ditemukan</p>
        <Link to="/dashboard" className="btn-secondary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
      </div>
    )
  }

  const level = LEVELS.find((l) => l.label === result.level) || LEVELS[LEVELS.length - 1]
  const levelStyleMap = {
    'Mumtaz (Tartil)': { bg: 'linear-gradient(135deg, rgba(120,53,15,0.7), rgba(41,20,5,0.8))', border: '#d97706', glow: '#d97706' },
    'Mahir':           { bg: 'linear-gradient(135deg, rgba(20,83,45,0.7), rgba(5,46,22,0.8))',   border: '#16a34a', glow: '#16a34a' },
    'Menengah':        { bg: 'linear-gradient(135deg, rgba(120,53,15,0.6), rgba(67,26,7,0.7))',   border: '#ea580c', glow: '#ea580c' },
    'Dasar':           { bg: 'linear-gradient(135deg, rgba(30,58,138,0.6), rgba(15,23,42,0.8))',  border: '#3b82f6', glow: '#3b82f6' },
    'Pemula':          { bg: 'linear-gradient(135deg, rgba(51,65,85,0.6), rgba(15,23,42,0.8))',   border: '#64748b', glow: '#64748b' },
  }
  const lStyle = levelStyleMap[result.level] || levelStyleMap['Pemula']

  const scores = [
    { key: 'makhraj',    label: 'Makhraj',   score: result.skor_makhraj,    weight: 0.35 },
    { key: 'tajwid',     label: 'Tajwid',    score: result.skor_tajwid,     weight: 0.40 },
    { key: 'kelancaran', label: 'Kelancaran', score: result.skor_kelancaran, weight: 0.25 },
  ]

  return (
    <div className="max-w-3xl w-full mx-auto space-y-5 md:space-y-6 min-w-0">
      {/* Top action bar */}
      <div className="flex items-center justify-between animate-in gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to={`/students/${result.murid_id}/history`}
            className="flex items-center gap-1.5 text-sm hover:text-amber-300 transition-colors flex-shrink-0"
            style={{ color: '#94a3b8' }}
            id="back-to-history-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Riwayat Tes</span>
          </Link>
          <span className="hidden sm:inline" style={{ color: '#334155' }}>·</span>
          <span className="text-sm font-semibold truncate" style={{ color: '#cbd5e1' }}>
            {result.murid?.nama}
          </span>
        </div>

        {/* Delete Test Button */}
        <button
          type="button"
          onClick={handleDeleteTest}
          disabled={deleting}
          className="text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
          style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
          }}
          title="Hapus hasil tes ini dari sistem"
        >
          {deleting ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Menghapus…</>
          ) : (
            <><Trash2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Hapus Tes</span></>
          )}
        </button>
      </div>

      {/* Success banner */}
      <div
        className="card p-3.5 sm:p-4 flex items-center gap-3 animate-in"
        style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
      >
        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <p className="text-xs sm:text-sm text-emerald-300">
          Hasil tes telah tersimpan dan siap dicetak sebagai sertifikat resmi.
        </p>
      </div>

      {/* Main result card */}
      <div
        className="card p-5 sm:p-8 border animate-in space-y-6"
        style={{
          background: lStyle.bg,
          borderColor: `${lStyle.border}60`,
          boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${lStyle.glow}20`,
        }}
      >
        {/* Student + level */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="text-3xl">{level.emoji}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {result.murid?.nama || '-'}
            </h1>
            <p className="text-sm text-white/70 mt-0.5">
              Kelas {result.murid?.kelas} · NISN {result.murid?.nisn || '-'}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-2xl px-6 py-2">
            <Star className="w-4 h-4 text-amber-300" />
            <span className="font-bold text-white">{result.level}</span>
          </div>
        </div>

        {/* Score big number */}
        <div className="text-center">
          <p className="text-5xl sm:text-7xl font-black text-white leading-none">{result.skor_total}</p>
          <p className="text-white/60 text-xs mt-1.5">Skor Total Tertimbang</p>
        </div>

        <div className="h-px bg-white/10" />

        {/* Score breakdown */}
        <div className="space-y-4">
          {scores.map(({ key, label, score, weight }) => (
            <ScoreBar key={key} label={label} score={score} weight={weight} />
          ))}
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in">
        <div className="card p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            Tanggal Tes
          </div>
          <p className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>
            {new Date(result.tanggal_tes).toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>

        <div className="card p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
            <User className="w-3.5 h-3.5 text-indigo-400" />
            Guru Penguji
          </div>
          <p className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>{result.guru_penguji || '-'}</p>
        </div>

        {result.ayat_dibaca && (
          <div className="card p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Surat / Ayat Dibaca
            </div>
            <p className="font-semibold text-sm italic" style={{ color: '#fef3c7' }}>{result.ayat_dibaca}</p>
          </div>
        )}

        {result.catatan && (
          <div className="card p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Catatan Evaluasi Guru
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>{result.catatan}</p>
          </div>
        )}
      </div>

      {/* PDF Download & WhatsApp Share */}
      <div className="card p-4 md:p-6 space-y-4 animate-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-semibold text-base" style={{ color: '#f8fafc' }}>Sertifikat &amp; Laporan Nilai</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              Format A4 landscape resmi berkop sekolah, siap cetak atau bagikan langsung ke nomor WhatsApp wali murid
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                const text = `*LAPORAN HASIL TES BACA AL-QURAN*\n*SMP NEGERI 2 GLAGAH*\n\n` +
                  `👤 *Nama Siswa:* ${result.murid?.nama} (${result.murid?.kelas || '-'})\n` +
                  `📖 *Materi Uji:* ${result.ayat_dibaca || `QS. Surat ke-${result.surat_nomor}`}\n` +
                  `📅 *Tanggal Tes:* ${result.tanggal_tes}\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `🗣️ *Makhraj (35%):* ${result.skor_makhraj}/100\n` +
                  `⚖️ *Tajwid (40%):* ${result.skor_tajwid}/100\n` +
                  `🌊 *Kelancaran (25%):* ${result.skor_kelancaran}/100\n` +
                  `🏆 *Total Skor:* ${result.skor_total}/100\n` +
                  `🎖️ *Predikat:* ${result.level}\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `📝 *Catatan Evaluasi Guru:*\n${result.catatan || 'Bacaan telah dinilai dan memenuhi standar kompetensi.'}\n\n` +
                  `_Sistem Penilaian Tilawah SMPN 2 Glagah_`
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
              }}
              className="btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm py-3 px-4 flex-1 sm:flex-initial"
              title="Kirim laporan nilai ke WhatsApp Wali Murid"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Kirim ke WA</span>
            </button>

            <button
              id="download-pdf-btn"
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="btn-gold flex items-center justify-center gap-2 text-xs sm:text-sm py-3 px-5 flex-1 sm:flex-initial shadow-md"
            >
              {pdfLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan PDF…</>
                : <><Download className="w-4 h-4" /> Unduh Sertifikat</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Hidden certificate template for PDF capture */}
      <CertificateTemplate result={result} id="certificate-template" />
    </div>
  )
}
