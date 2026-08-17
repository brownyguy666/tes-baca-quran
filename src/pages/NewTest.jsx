import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CRITERIA, getSummary, buildTestRecord, LEVELS } from '../utils/scoring'
import { SURAHS } from '../utils/surahs'
import {
  ClipboardList, ChevronDown, ChevronUp, Save, Loader2,
  Info, AlertCircle, CheckCircle, User, Check, GraduationCap,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Step Progress Bar ─────────────────────────────────────
function StepBar({ current }) {
  const steps = ['Pilih Murid', 'Info Tes', 'Penilaian']
  return (
    <div className="flex items-center gap-0 mb-8 animate-in">
      {steps.map((label, i) => {
        const idx = i + 1
        const done    = idx < current
        const active  = idx === current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                           transition-all duration-400 flex-shrink-0"
                style={{
                  background: done
                    ? 'linear-gradient(135deg,#d4af37,#f59e0b)'
                    : active
                      ? 'linear-gradient(135deg,#6366f1,#4f46e5)'
                      : 'rgba(30,41,59,0.8)',
                  border: done || active
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.1)',
                  color: done || active ? '#fff' : '#475569',
                  boxShadow: active ? '0 0 16px rgba(99,102,241,0.45)' : 'none',
                }}
              >
                {done ? <Check className="w-4 h-4" /> : idx}
              </div>
              <span
                className="text-[11px] font-semibold mt-1.5 whitespace-nowrap"
                style={{ color: done ? '#d4af37' : active ? '#818cf8' : '#334155' }}
              >
                {label}
              </span>
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-400"
                style={{
                  background: done
                    ? 'linear-gradient(to right,#d4af37,#f59e0b)'
                    : 'rgba(51,65,85,0.8)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Score Input ───────────────────────────────────────────
function ScoreInput({ criterion, value, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const numVal = parseFloat(value) || 0

  const getScoreColor = (s) => {
    if (s >= 91) return '#fbbf24'
    if (s >= 76) return '#34d399'
    if (s >= 61) return '#fb923c'
    if (s >= 41) return '#60a5fa'
    return '#94a3b8'
  }
  const getBarGradient = (s) => {
    if (s >= 91) return 'linear-gradient(to right,#b45309,#fbbf24)'
    if (s >= 76) return 'linear-gradient(to right,#047857,#34d399)'
    if (s >= 61) return 'linear-gradient(to right,#c2410c,#fb923c)'
    if (s >= 41) return 'linear-gradient(to right,#1d4ed8,#60a5fa)'
    return 'linear-gradient(to right,#334155,#94a3b8)'
  }
  const getLevelLabel = (s) => {
    if (s >= 91) return 'Sempurna ✨'
    if (s >= 76) return 'Sangat Baik ✅'
    if (s >= 61) return 'Baik 📈'
    if (s >= 41) return 'Cukup 📚'
    return 'Perlu Latihan 🌱'
  }

  const currentGuidance = criterion.guidance.find((g) => {
    const [min, max] = g.range.split('–').map(Number)
    return numVal >= min && numVal <= max
  })

  return (
    <div className="card p-5 space-y-4 animate-in" id={`score-input-${criterion.key}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{criterion.icon}</span>
          <div>
            <h3 className="font-bold text-base" style={{ color: '#e2e8f0' }}>
              {criterion.label}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
              {criterion.description}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span
            className="text-4xl font-black transition-colors duration-200"
            style={{ color: getScoreColor(numVal) }}
          >
            {Math.round(numVal)}
          </span>
          <p className="text-[10px]" style={{ color: '#334155' }}>/ 100</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden"
           style={{ background: 'rgba(30,41,59,0.8)' }}>
        <div
          className="h-full rounded-full score-bar-fill"
          style={{
            width: `${Math.max(0, Math.min(100, numVal))}%`,
            background: getBarGradient(numVal),
          }}
        />
      </div>

      {/* Live predikat label */}
      <div
        className="text-center text-xs font-bold py-1.5 rounded-lg transition-all duration-300"
        style={{
          color: getScoreColor(numVal),
          background: `${getScoreColor(numVal)}18`,
          border: `1px solid ${getScoreColor(numVal)}30`,
        }}
      >
        {getLevelLabel(numVal)}
      </div>

      {/* Slider */}
      <div className="space-y-1.5">
        <input
          type="range"
          id={`slider-${criterion.key}`}
          min="0" max="100" step="1"
          value={Math.round(numVal)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
        <div className="flex justify-between text-[10px]" style={{ color: '#334155' }}>
          <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
      </div>

      {/* Number input */}
      <div className="flex items-center gap-3">
        <label className="text-xs flex-shrink-0" style={{ color: '#64748b' }}>
          Nilai tepat:
        </label>
        <input
          type="number"
          id={`number-${criterion.key}`}
          min="0" max="100" step="0.5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field w-24 py-1.5 text-center text-sm font-bold"
        />
        <span className="text-xs" style={{ color: '#475569' }}>/ 100</span>
        <span className="text-xs font-semibold ml-auto" style={{ color: '#d4af37' }}>
          Bobot {(criterion.weight * 100).toFixed(0)}%
        </span>
      </div>

      {/* Guidance badge */}
      {currentGuidance && (
        <div
          className="flex items-start gap-2 p-3 rounded-xl"
          style={{
            background: 'rgba(11,15,25,0.6)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#d4af37' }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: '#fef3c7' }}>
              {currentGuidance.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              {currentGuidance.desc}
            </p>
          </div>
        </div>
      )}

      {/* Toggle full guide */}
      <button
        type="button"
        id={`guidance-toggle-${criterion.key}`}
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1.5 text-xs transition-colors"
        style={{ color: '#475569' }}
      >
        {expanded
          ? <ChevronUp className="w-3 h-3" />
          : <ChevronDown className="w-3 h-3" />}
        Panduan penilaian lengkap
      </button>

      {expanded && (
        <div className="space-y-2 animate-in">
          {criterion.guidance.map((g) => (
            <div
              key={g.range}
              className="flex items-start gap-3 p-2.5 rounded-lg"
              style={{
                background: 'rgba(11,15,25,0.5)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                className="text-[10px] font-mono flex-shrink-0 pt-0.5 w-12"
                style={{ color: '#d4af37' }}
              >
                {g.range}
              </span>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#cbd5e1' }}>{g.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Score Summary (sticky) ────────────────────────────────
function ScoreSummary({ scores }) {
  const summary = useMemo(() => {
    const mapped = {}
    CRITERIA.forEach((c) => { mapped[c.key] = scores[`skor_${c.key}`] })
    return getSummary(mapped)
  }, [scores])

  if (!summary) {
    return (
      <div className="card p-6 flex items-center gap-3" style={{ color: '#475569' }}>
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm">Isi semua skor untuk melihat hasil otomatis</p>
      </div>
    )
  }

  const { totalScore, level } = summary

  const ringColor = {
    'Mumtaz (Tartil)': '#d4af37',
    'Mahir':           '#10b981',
    'Menengah':        '#f59e0b',
    'Dasar':           '#3b82f6',
    'Pemula':          '#64748b',
  }[level.label] || '#64748b'

  return (
    <div
      className="rounded-2xl p-6 animate-in"
      id="score-summary"
      style={{
        background: 'rgba(30,41,59,0.85)',
        border: `1px solid ${ringColor}40`,
        boxShadow: `0 0 30px ${ringColor}20, inset 0 0 40px rgba(0,0,0,0.3)`,
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#10b981' }}>
          Hasil Penilaian
        </span>
      </div>

      {/* Score ring */}
      <div className="text-center mb-4">
        <div
          className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-3"
          style={{
            background: `conic-gradient(${ringColor} ${totalScore * 3.6}deg, rgba(30,41,59,0.8) 0deg)`,
            padding: '3px',
          }}
        >
          <div
            className="w-full h-full rounded-full flex flex-col items-center justify-center"
            style={{ background: '#0b0f19' }}
          >
            <span className="text-4xl font-black" style={{ color: ringColor }}>
              {totalScore}
            </span>
            <span className="text-[10px]" style={{ color: '#475569' }}>/ 100</span>
          </div>
        </div>

        <div
          className="rounded-xl py-2.5 px-4"
          style={{
            background: `${ringColor}18`,
            border: `1px solid ${ringColor}35`,
          }}
        >
          <p className="text-lg font-bold" style={{ color: ringColor }}>
            {level.emoji} {level.label}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-xs mt-4" style={{ color: '#64748b' }}>
        {CRITERIA.map((c) => {
          const val = parseFloat(scores[`skor_${c.key}`]) || 0
          return (
            <div key={c.key} className="flex justify-between">
              <span>{c.label} × {(c.weight * 100).toFixed(0)}%</span>
              <span className="font-semibold" style={{ color: '#94a3b8' }}>
                {(val * c.weight).toFixed(1)}
              </span>
            </div>
          )
        })}
        <div
          className="flex justify-between font-bold pt-2 mt-1"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            color: '#f8fafc',
          }}
        >
          <span>Total</span>
          <span style={{ color: ringColor }}>{totalScore}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function NewTest() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const { profile }    = useAuth()

  const [students, setStudents]     = useState([])
  const [classes, setClasses]       = useState([])
  const [selectedKelas, setSelectedKelas] = useState('')
  const [selectedId, setSelectedId] = useState(searchParams.get('murid') || '')
  const [loading, setLoading]       = useState(false)
  const [saving, setSaving]         = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const [scores, setScores] = useState({
    skor_makhraj: '0', skor_tajwid: '0', skor_kelancaran: '0',
  })
  const [extras, setExtras] = useState({
    tanggal_tes: today, ayat_dibaca: '', catatan: '',
  })

  // Surah + range state
  const [surahNo, setSurahNo]       = useState('')
  const [ayatDari, setAyatDari]     = useState('1')
  const [ayatSampai, setAyatSampai] = useState('1')

  const selectedSurah = SURAHS.find((s) => String(s.no) === String(surahNo))

  // Sync computed ayat_dibaca whenever surah/range changes
  useEffect(() => {
    if (!selectedSurah) {
      setExtras((p) => ({ ...p, ayat_dibaca: '' }))
      return
    }
    const range = ayatDari === ayatSampai
      ? `ayat ${ayatDari}`
      : `ayat ${ayatDari}–${ayatSampai}`
    setExtras((p) => ({
      ...p,
      ayat_dibaca: `${selectedSurah.latin} (${range})`,
    }))
  }, [surahNo, ayatDari, ayatSampai])

  const handleSurahChange = (e) => {
    const no = e.target.value
    setSurahNo(no)
    const surah = SURAHS.find((s) => String(s.no) === no)
    setAyatDari('1')
    setAyatSampai(surah ? String(surah.ayat) : '1')
  }

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = async () => {
    setLoading(true)
    const { data } = await supabase.from('murid').select('*').order('nama')
    const rows = data || []
    setStudents(rows)
    // Derive distinct sorted classes
    const uniqueKelas = [...new Set(rows.map((m) => m.kelas).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b, 'id', { numeric: true })
    )
    setClasses(uniqueKelas)

    // If a murid was pre-selected via query param, auto-set kelas
    const preId = searchParams.get('murid')
    if (preId) {
      const pre = rows.find((m) => m.id === preId)
      if (pre?.kelas) setSelectedKelas(pre.kelas)
    }
    setLoading(false)
  }

  // Students filtered by selected class
  const filteredStudents = selectedKelas
    ? students.filter((s) => s.kelas === selectedKelas)
    : students

  const selectedStudent = students.find((s) => s.id === selectedId)

  const handleScoreChange = (key, value) => {
    if (value === '') {
      setScores((prev) => ({ ...prev, [`skor_${key}`]: '' }))
      return
    }
    const clamped = Math.max(0, Math.min(100, parseFloat(value) || 0))
    setScores((prev) => ({ ...prev, [`skor_${key}`]: String(clamped) }))
  }

  const summary = useMemo(() => {
    const mapped = {}
    CRITERIA.forEach((c) => { mapped[c.key] = scores[`skor_${c.key}`] })
    return getSummary(mapped)
  }, [scores])

  // Determine current step
  const currentStep = !selectedKelas ? 1 : !selectedId ? 1 : !extras.ayat_dibaca ? 2 : 3

  const handleSave = async (e) => {
    e.preventDefault()
    if (!selectedId) { toast.error('Pilih murid terlebih dahulu'); return }
    if (!summary)    { toast.error('Isi semua skor penilaian'); return }

    setSaving(true)
    const record = buildTestRecord({
      muridId: selectedId,
      formData: { ...scores, ...extras },
      guruPenguji: profile?.name || profile?.email || 'Guru',
    })
    const { data, error } = await supabase.from('hasil_tes').insert([record]).select().single()
    if (error) {
      toast.error('Gagal menyimpan hasil tes')
      setSaving(false)
      return
    }
    toast.success('Hasil tes berhasil disimpan! 🎉')
    navigate(`/test/result/${data.id}`)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-in">
        <h1 className="section-title flex items-center gap-2">
          <ClipboardList className="w-6 h-6" style={{ color: '#d4af37' }} />
          Tes Baru
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>
          Isi penilaian saat mendengarkan murid membaca Al-Quran
        </p>
      </div>

      {/* Step Progress Bar */}
      <StepBar current={currentStep} />

      <form onSubmit={handleSave} className="space-y-6" id="new-test-form">
        {/* Step 1 — Pilih Kelas & Murid */}
        <div className="card p-5 space-y-4 animate-in">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: '#cbd5e1' }}>
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: selectedId
                  ? 'linear-gradient(135deg,#d4af37,#f59e0b)'
                  : 'rgba(99,102,241,0.3)',
                border: selectedId ? 'none' : '1px solid rgba(99,102,241,0.5)',
                color: selectedId ? '#0b0f19' : '#818cf8',
              }}
            >
              {selectedId ? <Check className="w-3 h-3" /> : '1'}
            </span>
            Pilih Kelas &amp; Murid
          </h2>

          {/* ── Pilih Kelas ── */}
          <div>
            <label className="label" htmlFor="select-kelas">Kelas *</label>
            {loading ? (
              <div className="input-field flex items-center gap-2" style={{ color: '#475569' }}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Memuat data…</span>
              </div>
            ) : (
              <select
                id="select-kelas"
                className="input-field"
                value={selectedKelas}
                onChange={(e) => {
                  setSelectedKelas(e.target.value)
                  setSelectedId('') // reset murid saat ganti kelas
                }}
                required
              >
                <option value="">-- Pilih kelas --</option>
                {classes.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            )}
          </div>

          {/* Kelas badge indicator */}
          {selectedKelas && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm animate-in"
              style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.18)',
              }}
            >
              <GraduationCap className="w-4 h-4" style={{ color: '#818cf8' }} />
              <span style={{ color: '#94a3b8' }}>Kelas</span>
              <span className="font-bold" style={{ color: '#c7d2fe' }}>{selectedKelas}</span>
              <span className="ml-auto text-xs" style={{ color: '#475569' }}>
                {filteredStudents.length} murid
              </span>
            </div>
          )}

          {/* ── Pilih Murid (muncul setelah kelas dipilih) ── */}
          {selectedKelas && (
            <div className="animate-in">
              <label className="label" htmlFor="select-murid">Nama Murid *</label>
              <select
                id="select-murid"
                className="input-field"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                required
              >
                <option value="">-- Pilih murid di kelas {selectedKelas} --</option>
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama}{s.nisn ? ` (NISN: ${s.nisn})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedStudent && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl animate-in"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.25)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                  color: '#fff',
                }}
              >
                {selectedStudent.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>
                  {selectedStudent.nama}
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  Kelas {selectedStudent.kelas} · NISN {selectedStudent.nisn || '—'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2 — Info Tes */}
        <div className="card p-5 space-y-4 animate-in">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: '#cbd5e1' }}>
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: selectedSurah
                  ? 'linear-gradient(135deg,#d4af37,#f59e0b)'
                  : 'rgba(99,102,241,0.3)',
                border: selectedSurah ? 'none' : '1px solid rgba(99,102,241,0.5)',
                color: selectedSurah ? '#0b0f19' : '#818cf8',
              }}
            >
              {selectedSurah ? <Check className="w-3 h-3" /> : '2'}
            </span>
            Informasi Tes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="tanggal-tes">Tanggal Tes *</label>
              <input
                id="tanggal-tes" type="date" className="input-field"
                value={extras.tanggal_tes}
                onChange={(e) => setExtras((p) => ({ ...p, tanggal_tes: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* ── Surah + Ayat picker ── */}
          <div>
            <label className="label" htmlFor="select-surah">Surat yang Dibaca</label>
            <select
              id="select-surah"
              className="input-field"
              value={surahNo}
              onChange={handleSurahChange}
            >
              <option value="">-- Pilih surat --</option>
              {SURAHS.map((s) => (
                <option key={s.no} value={s.no}>
                  {s.no}. {s.latin} ({s.ar}) — {s.ayat} ayat
                </option>
              ))}
            </select>
          </div>

          {selectedSurah && (
            <div className="space-y-3 animate-in">
              {/* Surah info badge */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: 'rgba(212,175,55,0.08)',
                  border: '1px solid rgba(212,175,55,0.2)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{
                    background: 'rgba(212,175,55,0.15)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    color: '#d4af37',
                  }}
                >
                  {selectedSurah.no}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: '#fef3c7' }}>
                    {selectedSurah.latin}
                  </p>
                  <p className="text-xs font-arabic" style={{ color: '#d4af37' }}>
                    {selectedSurah.ar}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#475569' }}>
                    {selectedSurah.ayat} ayat · Juz {selectedSurah.juz}
                  </p>
                </div>
                <div
                  className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                  style={{
                    background: 'rgba(212,175,55,0.12)',
                    color: '#fcd34d',
                  }}
                >
                  Q.S. {selectedSurah.no}
                </div>
              </div>

              {/* Ayat range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="ayat-dari">Ayat Dari</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="ayat-dari"
                      type="number"
                      min="1"
                      max={selectedSurah.ayat}
                      className="input-field text-center font-bold"
                      value={ayatDari}
                      onChange={(e) => {
                        const v = Math.max(1, Math.min(selectedSurah.ayat, Number(e.target.value)))
                        setAyatDari(String(v))
                        if (Number(ayatSampai) < v) setAyatSampai(String(v))
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="ayat-sampai">Ayat Sampai</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="ayat-sampai"
                      type="number"
                      min={ayatDari}
                      max={selectedSurah.ayat}
                      className="input-field text-center font-bold"
                      value={ayatSampai}
                      onChange={(e) => {
                        const v = Math.max(Number(ayatDari), Math.min(selectedSurah.ayat, Number(e.target.value)))
                        setAyatSampai(String(v))
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div
                className="text-sm text-center py-2.5 rounded-xl font-semibold"
                style={{
                  background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  color: '#fef3c7',
                }}
              >
                📖 {extras.ayat_dibaca}
              </div>
            </div>
          )}

          <div>
            <label className="label" htmlFor="catatan-guru">Catatan Guru (opsional)</label>
            <textarea
              id="catatan-guru" rows={2}
              className="input-field resize-none"
              placeholder="Catatan tambahan mengenai bacaan murid…"
              value={extras.catatan}
              onChange={(e) => setExtras((p) => ({ ...p, catatan: e.target.value }))}
            />
          </div>
        </div>

        {/* Step 3 — Penilaian */}
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: '#cbd5e1' }}>
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: summary
                  ? 'linear-gradient(135deg,#d4af37,#f59e0b)'
                  : 'rgba(99,102,241,0.3)',
                border: summary ? 'none' : '1px solid rgba(99,102,241,0.5)',
                color: summary ? '#0b0f19' : '#818cf8',
              }}
            >
              {summary ? <Check className="w-3 h-3" /> : '3'}
            </span>
            Penilaian per Kriteria
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              {CRITERIA.map((criterion) => (
                <ScoreInput
                  key={criterion.key}
                  criterion={criterion}
                  value={scores[`skor_${criterion.key}`]}
                  onChange={(val) => handleScoreChange(criterion.key, val)}
                />
              ))}
            </div>

            {/* Sticky summary */}
            <div className="lg:sticky lg:top-4 h-fit space-y-4">
              <ScoreSummary scores={scores} />

              <button
                type="submit"
                id="save-test-btn"
                className="btn-gold w-full py-3.5 text-base font-bold"
                disabled={saving || !summary || !selectedId}
              >
                {saving
                  ? <><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Menyimpan…</>
                  : <><Save className="w-5 h-5 inline mr-2" />Simpan Hasil Tes</>
                }
              </button>

              {/* Level legend */}
              <div className="card p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#334155' }}>
                  Tabel Level Skor
                </p>
                {LEVELS.map((l) => (
                  <div key={l.label} className="flex items-center justify-between text-xs">
                    <span style={{ color: '#94a3b8' }}>{l.emoji} {l.label}</span>
                    <span
                      className="font-mono text-[11px] px-2 py-0.5 rounded-md"
                      style={{ background: 'rgba(30,41,59,0.8)', color: '#64748b' }}
                    >
                      {l.min}–{l.max}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
