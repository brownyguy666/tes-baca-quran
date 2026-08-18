import { useState, useMemo } from 'react'
import { SURAHS } from '../utils/surahs'
import { getSummary, LEVELS } from '../utils/scoring'
import QuranViewer from '../components/QuranViewer'
import AudioAssessmentRecorder from '../components/AudioAssessmentRecorder'
import CertificateTemplate from '../components/CertificateTemplate'
import { generateCertificatePDF } from '../utils/pdfGenerator'
import {
  Sparkles, BookOpen, User, CheckCircle, Award,
  RotateCcw, Download, Loader2, ChevronDown, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'

// Quick preset Surahs for fast supervisor evaluation
const QUICK_SURAHS = [
  { surahNo: 1,   name: 'Al-Fatihah', from: 1, to: 7,  badge: 'Surat Pembuka' },
  { surahNo: 112, name: 'Al-Ikhlas',  from: 1, to: 4,  badge: 'Tauhid' },
  { surahNo: 113, name: 'Al-Falaq',   from: 1, to: 5,  badge: 'Mu\'awwidzatain' },
  { surahNo: 114, name: 'An-Nas',     from: 1, to: 6,  badge: 'Mu\'awwidzatain' },
  { surahNo: 108, name: 'Al-Kautsar', from: 1, to: 3,  badge: 'Pendek' },
  { surahNo: 109, name: 'Al-Kafirun', from: 1, to: 6,  badge: 'Tajwid Mad' },
]

export default function DemoAssessment() {
  const [studentName, setStudentName] = useState('Siswa Uji Coba (Demo)')
  const [isEditingName, setIsEditingName] = useState(false)
  const [surahNo, setSurahNo]         = useState(1)
  const [ayatDari, setAyatDari]       = useState(1)
  const [ayatSampai, setAyatSampai]   = useState(7)

  // AI Evaluation result state
  const [evalResult, setEvalResult]   = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const selectedSurah = useMemo(
    () => SURAHS.find((s) => s.nomor === Number(surahNo)) || SURAHS[0],
    [surahNo]
  )

  const handleSelectQuickSurah = (item) => {
    setSurahNo(item.surahNo)
    setAyatDari(item.from)
    setAyatSampai(item.to)
    setEvalResult(null)
  }

  const handleSurahChange = (no) => {
    const s = SURAHS.find((x) => x.nomor === Number(no))
    setSurahNo(Number(no))
    setAyatDari(1)
    setAyatSampai(s ? Math.min(7, s.jumlahAyat) : 1)
    setEvalResult(null)
  }

  const scores = evalResult
    ? {
        skor_makhraj: evalResult.makhraj,
        skor_tajwid: evalResult.tajwid,
        skor_kelancaran: evalResult.kelancaran,
      }
    : null

  const summary = scores ? getSummary(scores) : null

  const handleDownloadDemoCert = async () => {
    if (!summary) return
    setIsDownloading(true)
    try {
      await generateCertificatePDF('demo-cert-template', `sertifikat-demo-${studentName.replace(/\s+/g, '-')}`)
      toast.success('Sertifikat demo berhasil diunduh! 🎓')
    } catch (err) {
      console.error(err)
      toast.error('Gagal membuat sertifikat PDF: ' + err.message)
    } finally {
      setIsDownloading(false)
    }
  }

  const demoTestRecord = summary
    ? {
        id: 'DEMO-PREVIEW',
        murid_id: 'demo-student',
        surat_nomor: surahNo,
        surat_nama: selectedSurah.latin,
        ayat_dari: ayatDari,
        ayat_sampai: ayatSampai,
        ayat_dibaca: `QS. ${selectedSurah.latin}: ${ayatDari}-${ayatSampai}`,
        skor_makhraj: evalResult.makhraj,
        skor_tajwid: evalResult.tajwid,
        skor_kelancaran: evalResult.kelancaran,
        skor_total: summary.total,
        level: summary.level,
        catatan: evalResult.catatan || 'Evaluasi otomatis berbasis AI Gemini.',
        tanggal_tes: new Date().toISOString().split('T')[0],
        murid: {
          id: 'demo-student',
          nama: studentName,
          kelas: '7-A',
          nisn: '1234567890',
        },
      }
    : null

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 min-w-0">
      {/* ── Banner Header Demo ── */}
      <div
        className="card p-5 sm:p-6 rounded-2xl animate-in space-y-3 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.98) 100%)',
          border: '1px solid rgba(212,175,55,0.35)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 20px rgba(212,175,55,0.08)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                color: '#0b0f19',
                boxShadow: '0 4px 15px rgba(212,175,55,0.4)',
              }}
            >
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold font-display text-amber-100">
                  Mode Uji Coba AI Penilai Tilawah
                </h1>
                <span
                  className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(99,102,241,0.25)',
                    border: '1px solid rgba(99,102,241,0.4)',
                    color: '#c7d2fe',
                  }}
                >
                  Pengawas Kemenag / Tamu
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Uji langsung kemampuan AI dalam mengenali bacaan ayat, tajwid, makhraj, dan kelancaran
              </p>
            </div>
          </div>
        </div>

        {/* Student Name Bar */}
        <div
          className="flex items-center justify-between p-3 rounded-xl gap-3 flex-wrap"
          style={{ background: 'rgba(11,15,25,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <User className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-xs text-slate-400">Nama Peserta / Siswa:</span>
            {isEditingName ? (
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                autoFocus
                className="input-field py-1 px-2.5 text-xs font-bold w-48"
              />
            ) : (
              <span className="text-xs font-bold text-slate-100 truncate">
                {studentName}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsEditingName((v) => !v)}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline"
          >
            {isEditingName ? 'Selesai' : 'Ganti Nama'}
          </button>
        </div>
      </div>

      {/* ── Pilih Surat & Ayat ── */}
      <div className="card p-4 sm:p-5 space-y-4 animate-in">
        <h2 className="font-semibold text-sm sm:text-base flex items-center gap-2 text-slate-200">
          <BookOpen className="w-4 h-4 text-amber-400" />
          1. Pilih Surat &amp; Ayat yang Akan Dibaca
        </h2>

        {/* Quick Presets */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 mb-2">Pilihan Cepat Surat Favorit:</p>
          <div className="flex items-center gap-2 flex-wrap">
            {QUICK_SURAHS.map((item) => {
              const isSelected = surahNo === item.surahNo && ayatDari === item.from && ayatSampai === item.to
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectQuickSurah(item)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(212,175,55,0.15))' : 'rgba(30,41,59,0.7)',
                    border: `1px solid ${isSelected ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.08)'}`,
                    color: isSelected ? '#fef3c7' : '#94a3b8',
                    boxShadow: isSelected ? '0 0 12px rgba(212,175,55,0.2)' : 'none',
                  }}
                >
                  {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                  <span>{item.name} ({item.from}–{item.to})</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom Surat Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="label text-xs">Pilih Semua Surat (1-114)</label>
            <select
              className="input-field text-xs sm:text-sm py-2"
              value={surahNo}
              onChange={(e) => handleSurahChange(e.target.value)}
            >
              {SURAHS.map((s) => (
                <option key={s.nomor} value={s.nomor}>
                  {s.nomor}. {s.latin} ({s.jumlahAyat} ayat)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label text-xs">Ayat Dari</label>
            <input
              type="number"
              min="1"
              max={selectedSurah.jumlahAyat}
              value={ayatDari}
              onChange={(e) => setAyatDari(Math.min(selectedSurah.jumlahAyat, Math.max(1, Number(e.target.value))))}
              className="input-field text-xs sm:text-sm py-2"
            />
          </div>

          <div>
            <label className="label text-xs">Ayat Sampai</label>
            <input
              type="number"
              min={ayatDari}
              max={selectedSurah.jumlahAyat}
              value={ayatSampai}
              onChange={(e) => setAyatSampai(Math.min(selectedSurah.jumlahAyat, Math.max(ayatDari, Number(e.target.value))))}
              className="input-field text-xs sm:text-sm py-2"
            />
          </div>
        </div>

        {/* Quran Text Viewer */}
        <QuranViewer
          surahNo={surahNo}
          ayatDari={ayatDari}
          ayatSampai={ayatSampai}
          surahInfo={selectedSurah}
        />
      </div>

      {/* ── AI Voice Recorder Studio (No manual sliders!) ── */}
      <div className="space-y-4">
        <h2 className="font-semibold text-sm sm:text-base flex items-center gap-2 text-slate-200">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          2. Rekam Suara &amp; Analisis Otomatis AI
        </h2>

        <AudioAssessmentRecorder
          surahNo={surahNo}
          surahName={selectedSurah?.latin || `Surat ke-${surahNo}`}
          ayatDari={ayatDari}
          ayatSampai={ayatSampai}
          onApplyEvaluation={({ makhraj, tajwid, kelancaran, catatan, detailedNotes }) => {
            setEvalResult({
              makhraj,
              tajwid,
              kelancaran,
              catatan,
              detailedNotes,
            })
          }}
        />
      </div>

      {/* ── Hasil Penilaian Demo ── */}
      {summary && evalResult && (
        <div
          className="card p-5 sm:p-6 rounded-2xl animate-in space-y-5"
          style={{
            background: 'linear-gradient(135deg, rgba(30,58,138,0.3) 0%, rgba(15,23,42,0.95) 100%)',
            border: '1px solid rgba(99,102,241,0.4)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.15)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg,#6366f1,#4338ca)',
                  color: '#fff',
                }}
              >
                {summary.levelEmoji}
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-indigo-300">Hasil Penilaian Tilawah</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-100">
                  {summary.level} <span className="text-amber-400 font-mono">({summary.total}/100)</span>
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadDemoCert}
              disabled={isDownloading}
              className="btn-gold flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 px-4 shadow-lg w-full sm:w-auto"
            >
              {isDownloading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Membuat PDF…</>
              ) : (
                <><Award className="w-4 h-4" /> Cetak Sertifikat Demo</>
              )}
            </button>
          </div>

          {/* Breakdown Score Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
              <p className="text-[11px] font-bold text-indigo-300">Makhraj (35%)</p>
              <p className="text-2xl font-black text-indigo-400 mt-1">{evalResult.makhraj}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
              <p className="text-[11px] font-bold text-amber-300">Tajwid (40%)</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{evalResult.tajwid}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <p className="text-[11px] font-bold text-emerald-300">Kelancaran (25%)</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{evalResult.kelancaran}</p>
            </div>
          </div>

          {/* Notes */}
          {evalResult.catatan && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                Catatan Evaluasi Penguji (AI):
              </p>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {evalResult.catatan}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden Certificate Template for PDF Generation */}
      {demoTestRecord && (
        <CertificateTemplate
          result={demoTestRecord}
          id="demo-cert-template"
        />
      )}
    </div>
  )
}
