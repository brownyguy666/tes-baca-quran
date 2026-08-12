import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CRITERIA, LEVELS } from '../utils/scoring'
import { generateCertificatePDF } from '../utils/pdfGenerator'
import CertificateTemplate from '../components/CertificateTemplate'
import {
  Download, ArrowLeft, Calendar, User, BookOpen,
  FileText, Loader2, CheckCircle, Star,
} from 'lucide-react'
import toast from 'react-hot-toast'

function ScoreBar({ label, score, weight }) {
  const pct = score
  const getColor = (s) => {
    if (s >= 91) return 'from-amber-600 to-amber-400'
    if (s >= 76) return 'from-green-700 to-green-500'
    if (s >= 61) return 'from-orange-700 to-orange-500'
    if (s >= 41) return 'from-blue-800 to-blue-500'
    return 'from-gray-700 to-gray-500'
  }
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-islamic-300 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-islamic-600">bobot {(weight * 100).toFixed(0)}%</span>
          <span className="font-bold text-islamic-100">{score}</span>
        </div>
      </div>
      <div className="h-2.5 bg-islamic-900/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor(score)} score-bar-fill`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function TestResult() {
  const { id }        = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 text-islamic-500 animate-spin" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center py-20">
        <p className="text-islamic-400">Data tidak ditemukan</p>
        <Link to="/dashboard" className="btn-secondary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
      </div>
    )
  }

  const level = LEVELS.find((l) => l.label === result.level) || LEVELS[LEVELS.length - 1]
  const levelColorMap = {
    'Mumtaz (Tartil)': 'from-amber-900/70 to-yellow-900/70 border-amber-600',
    'Mahir':           'from-green-900/70 to-emerald-900/70 border-green-600',
    'Menengah':        'from-orange-900/60 to-orange-950/60 border-orange-600',
    'Dasar':           'from-blue-900/60 to-blue-950/60 border-blue-700',
    'Pemula':          'from-gray-800/60 to-gray-900/60 border-gray-600',
  }
  const levelCls = levelColorMap[result.level] || levelColorMap['Pemula']

  const scores = [
    { key: 'makhraj',    label: 'Makhraj',   score: result.skor_makhraj,    weight: 0.35 },
    { key: 'tajwid',     label: 'Tajwid',    score: result.skor_tajwid,     weight: 0.40 },
    { key: 'kelancaran', label: 'Kelancaran', score: result.skor_kelancaran, weight: 0.25 },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3 animate-in">
        <Link
          to={`/students/${result.murid_id}/history`}
          className="flex items-center gap-1.5 text-sm text-islamic-400 hover:text-islamic-200 transition-colors"
          id="back-to-history-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Riwayat Tes
        </Link>
        <span className="text-islamic-700">·</span>
        <span className="text-sm text-islamic-500">{result.murid?.nama}</span>
      </div>

      {/* Success banner */}
      <div className="card p-4 flex items-center gap-3 bg-green-900/30 border-green-700/40 animate-in">
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
        <p className="text-sm text-green-300">Hasil tes telah tersimpan dan siap dicetak sebagai sertifikat.</p>
      </div>

      {/* Main result card */}
      <div className={`card p-6 bg-gradient-to-br ${levelCls} border animate-in space-y-6`}>

        {/* Student + level */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-white/10 backdrop-blur-sm">
            <span className="text-3xl">{level.emoji}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white">
              {result.murid?.nama || '-'}
            </h1>
            <p className="text-sm text-white/60">
              Kelas {result.murid?.kelas} · {result.murid?.nisn || 'No NISN'}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-2xl px-6 py-2">
            <Star className="w-4 h-4 text-yellow-300" />
            <span className="font-bold text-white">{result.level}</span>
          </div>
        </div>

        {/* Score big number */}
        <div className="text-center">
          <p className="text-7xl font-black text-white leading-none">{result.skor_total}</p>
          <p className="text-white/50 text-sm mt-1">Skor Total Tertimbang</p>
        </div>

        <div className="ornament-line" />

        {/* Score breakdown */}
        <div className="space-y-4">
          {scores.map(({ key, label, score, weight }) => (
            <ScoreBar key={key} label={label} score={score} weight={weight} />
          ))}
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in">
        <div className="card p-4 space-y-2">
          <div className="flex items-center gap-2 text-islamic-400 text-xs font-semibold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            Tanggal Tes
          </div>
          <p className="text-islamic-100 font-semibold">
            {new Date(result.tanggal_tes).toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>

        <div className="card p-4 space-y-2">
          <div className="flex items-center gap-2 text-islamic-400 text-xs font-semibold uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            Guru Penguji
          </div>
          <p className="text-islamic-100 font-semibold">{result.guru_penguji || '-'}</p>
        </div>

        {result.ayat_dibaca && (
          <div className="card p-4 space-y-2">
            <div className="flex items-center gap-2 text-islamic-400 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Surat / Ayat Dibaca
            </div>
            <p className="text-islamic-100 font-semibold italic">{result.ayat_dibaca}</p>
          </div>
        )}

        {result.catatan && (
          <div className="card p-4 space-y-2">
            <div className="flex items-center gap-2 text-islamic-400 text-xs font-semibold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              Catatan Guru
            </div>
            <p className="text-islamic-200 text-sm leading-relaxed">{result.catatan}</p>
          </div>
        )}
      </div>

      {/* PDF Download */}
      <div className="card p-6 space-y-4 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-islamic-100">Sertifikat PDF</p>
            <p className="text-xs text-islamic-500 mt-0.5">
              Format A4 landscape, siap cetak atau kirim ke murid/orang tua
            </p>
          </div>
          <button
            id="download-pdf-btn"
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="btn-gold flex items-center gap-2"
          >
            {pdfLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              : <><Download className="w-4 h-4" /> Unduh Sertifikat</>
            }
          </button>
        </div>
      </div>

      {/* Hidden certificate template for PDF capture */}
      <CertificateTemplate result={result} id="certificate-template" />
    </div>
  )
}
