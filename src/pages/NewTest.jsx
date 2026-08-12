import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CRITERIA, getSummary, buildTestRecord, LEVELS } from '../utils/scoring'
import {
  ClipboardList, ChevronDown, ChevronUp, Save, Loader2,
  Info, AlertCircle, CheckCircle, User,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Subcomponents ────────────────────────────────────────────────────────────

function ScoreInput({ criterion, value, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const numVal = parseFloat(value) || 0

  const getScoreColor = (score) => {
    if (score >= 91) return 'text-amber-400'
    if (score >= 76) return 'text-green-400'
    if (score >= 61) return 'text-orange-400'
    if (score >= 41) return 'text-blue-400'
    return 'text-gray-400'
  }

  const getBarWidth = (score) => `${Math.max(0, Math.min(100, score))}%`
  const getBarColor = (score) => {
    if (score >= 91) return 'from-amber-500 to-yellow-400'
    if (score >= 76) return 'from-green-600 to-emerald-400'
    if (score >= 61) return 'from-orange-600 to-orange-400'
    if (score >= 41) return 'from-blue-700 to-blue-400'
    return 'from-gray-600 to-gray-500'
  }

  const currentGuidance = criterion.guidance.find((g) => {
    const [min, max] = g.range.split('–').map(Number)
    return numVal >= min && numVal <= max
  })

  return (
    <div className="card p-5 space-y-4 animate-in" id={`score-input-${criterion.key}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{criterion.icon}</span>
          <div>
            <h3 className="font-bold text-islamic-100 text-base">{criterion.label}</h3>
            <p className="text-xs text-islamic-500 mt-0.5">{criterion.description}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-3xl font-black ${getScoreColor(numVal)}`}>{Math.round(numVal)}</span>
          <p className="text-[10px] text-islamic-600">/ 100</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-islamic-900/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getBarColor(numVal)} score-bar-fill`}
          style={{ width: getBarWidth(numVal) }}
        />
      </div>

      {/* Range slider */}
      <div className="space-y-2">
        <input
          type="range"
          id={`slider-${criterion.key}`}
          min="0"
          max="100"
          step="1"
          value={Math.round(numVal)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-islamic-600">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* Number input */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-islamic-400 flex-shrink-0">Nilai tepat:</label>
        <input
          type="number"
          id={`number-${criterion.key}`}
          min="0"
          max="100"
          step="0.5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field w-24 py-1.5 text-center text-sm font-bold"
        />
        <span className="text-xs text-islamic-500">/ 100</span>
        <span className="text-xs font-semibold text-gold-500 ml-auto">
          Bobot {(criterion.weight * 100).toFixed(0)}%
        </span>
      </div>

      {/* Current guidance */}
      {currentGuidance && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-islamic-900/40 border border-islamic-800/40">
          <Info className="w-3.5 h-3.5 text-gold-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-gold-400">{currentGuidance.label}</p>
            <p className="text-xs text-islamic-400 mt-0.5">{currentGuidance.desc}</p>
          </div>
        </div>
      )}

      {/* Guidance toggle */}
      <button
        type="button"
        id={`guidance-toggle-${criterion.key}`}
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1.5 text-xs text-islamic-500 hover:text-islamic-300 transition-colors"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Panduan penilaian
      </button>

      {expanded && (
        <div className="space-y-2 animate-in">
          {criterion.guidance.map((g) => (
            <div
              key={g.range}
              className="flex items-start gap-3 p-2.5 rounded-lg bg-islamic-900/30 border border-islamic-800/30"
            >
              <span className="text-[10px] font-mono text-gold-600 flex-shrink-0 pt-0.5 w-12">{g.range}</span>
              <div>
                <p className="text-xs font-semibold text-islamic-300">{g.label}</p>
                <p className="text-[10px] text-islamic-500">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ScoreSummary({ scores }) {
  // scores has skor_* prefix keys; getSummary expects unprefixed keys (makhraj, tajwid, kelancaran)
  const summary = useMemo(() => {
    const mapped = {}
    CRITERIA.forEach((c) => { mapped[c.key] = scores[`skor_${c.key}`] })
    return getSummary(mapped)
  }, [scores])

  if (!summary) {
    return (
      <div className="card p-6 flex items-center gap-3 text-islamic-500">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm">Isi semua skor untuk melihat hasil otomatis</p>
      </div>
    )
  }

  const { totalScore, level } = summary
  const levelColorMap = {
    'Mumtaz (Tartil)': 'from-amber-900/60 to-yellow-900/60 border-amber-600',
    'Mahir':           'from-green-900/60 to-emerald-900/60 border-green-600',
    'Menengah':        'from-orange-900/60 to-orange-950/60 border-orange-600',
    'Dasar':           'from-blue-900/60 to-blue-950/60 border-blue-700',
    'Pemula':          'from-gray-800/60 to-gray-900/60 border-gray-600',
  }
  const cls = levelColorMap[level.label] || levelColorMap['Pemula']

  return (
    <div className={`card p-6 bg-gradient-to-br ${cls} border animate-in`} id="score-summary">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-4 h-4 text-green-400" />
        <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Hasil Penilaian</span>
      </div>

      <div className="text-center mb-4">
        <p className="text-5xl font-black text-white mb-1">{totalScore}</p>
        <p className="text-sm text-white/60">Skor Total</p>
      </div>

      <div className="text-center bg-white/10 rounded-xl py-3 px-4 mb-4">
        <p className="text-lg font-bold text-white">{level.emoji} {level.label}</p>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-xs text-white/70">
        {CRITERIA.map((c) => {
          const val = parseFloat(scores[`skor_${c.key}`]) || 0
          return (
            <div key={c.key} className="flex justify-between">
              <span>{c.label} × {(c.weight * 100).toFixed(0)}%</span>
              <span className="font-semibold">{(val * c.weight).toFixed(1)}</span>
            </div>
          )
        })}
        <div className="border-t border-white/20 pt-1 mt-1 flex justify-between font-bold text-white">
          <span>Total</span>
          <span>{totalScore}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function NewTest() {
  const [searchParams] = useSearchParams()
  const navigate        = useNavigate()
  const { profile }     = useAuth()

  const [students, setStudents]     = useState([])
  const [selectedId, setSelectedId] = useState(searchParams.get('murid') || '')
  const [loading, setLoading]       = useState(false)
  const [saving, setSaving]         = useState(false)

  const today = new Date().toISOString().split('T')[0]

  // Form state — default 0 so sliders register immediately (user adjusts from 0 up)
  const [scores, setScores] = useState({
    skor_makhraj: '0',
    skor_tajwid: '0',
    skor_kelancaran: '0',
  })
  const [extras, setExtras] = useState({
    tanggal_tes: today,
    ayat_dibaca: '',
    catatan: '',
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    const { data } = await supabase.from('murid').select('*').order('nama')
    setStudents(data || [])
    setLoading(false)
  }

  const selectedStudent = students.find((s) => s.id === selectedId)

  const handleScoreChange = (key, value) => {
    // If value is empty string (user cleared number input), keep it empty so "all filled" check works
    if (value === '') {
      setScores((prev) => ({ ...prev, [`skor_${key}`]: '' }))
      return
    }
    const clamped = Math.max(0, Math.min(100, parseFloat(value) || 0))
    setScores((prev) => ({ ...prev, [`skor_${key}`]: String(clamped) }))
  }

  // Map skor_* prefix keys to unprefixed for getSummary
  const summary = useMemo(() => {
    const mapped = {}
    CRITERIA.forEach((c) => { mapped[c.key] = scores[`skor_${c.key}`] })
    return getSummary(mapped)
  }, [scores])

  const handleSave = async (e) => {
    e.preventDefault()

    if (!selectedId) {
      toast.error('Pilih murid terlebih dahulu')
      return
    }
    if (!summary) {
      toast.error('Isi semua skor penilaian')
      return
    }

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
          <ClipboardList className="w-6 h-6 text-gold-400" />
          Tes Baru
        </h1>
        <p className="text-sm text-islamic-400 mt-1">
          Isi penilaian saat mendengarkan murid membaca Al-Quran
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6" id="new-test-form">
        {/* Step 1: Pilih murid */}
        <div className="card p-5 space-y-4 animate-in">
          <h2 className="font-semibold text-islamic-200 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gold-700/50 border border-gold-600 text-gold-300
                             text-xs flex items-center justify-center font-bold">1</span>
            Pilih Murid
          </h2>

          <div>
            <label className="label" htmlFor="select-murid">Nama Murid *</label>
            <select
              id="select-murid"
              className="input-field"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
            >
              <option value="">-- Pilih murid --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} — Kelas {s.kelas}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-islamic-800/40 border border-islamic-700/40 animate-in">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-islamic-600 to-islamic-800
                              flex items-center justify-center text-sm font-bold text-gold-300">
                {selectedStudent.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-islamic-100 text-sm">{selectedStudent.nama}</p>
                <p className="text-xs text-islamic-400">Kelas {selectedStudent.kelas} · NISN {selectedStudent.nisn || '-'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Info tes */}
        <div className="card p-5 space-y-4 animate-in">
          <h2 className="font-semibold text-islamic-200 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gold-700/50 border border-gold-600 text-gold-300
                             text-xs flex items-center justify-center font-bold">2</span>
            Informasi Tes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="tanggal-tes">Tanggal Tes *</label>
              <input
                id="tanggal-tes"
                type="date"
                className="input-field"
                value={extras.tanggal_tes}
                onChange={(e) => setExtras((p) => ({ ...p, tanggal_tes: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="ayat-dibaca">Surat / Ayat yang Dibaca</label>
              <input
                id="ayat-dibaca"
                type="text"
                className="input-field"
                placeholder="Contoh: Al-Fatihah 1–7, Al-Baqarah"
                value={extras.ayat_dibaca}
                onChange={(e) => setExtras((p) => ({ ...p, ayat_dibaca: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="catatan-guru">Catatan Guru (opsional)</label>
            <textarea
              id="catatan-guru"
              rows={2}
              className="input-field resize-none"
              placeholder="Catatan tambahan mengenai bacaan murid…"
              value={extras.catatan}
              onChange={(e) => setExtras((p) => ({ ...p, catatan: e.target.value }))}
            />
          </div>
        </div>

        {/* Step 3: Penilaian */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gold-700/50 border border-gold-600 text-gold-300
                             text-xs flex items-center justify-center font-bold">3</span>
            <h2 className="font-semibold text-islamic-200">Penilaian per Kriteria</h2>
          </div>

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
            <div className="lg:sticky lg:top-8 h-fit space-y-4">
              <ScoreSummary scores={scores} />

              <button
                type="submit"
                id="save-test-btn"
                className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-base font-bold"
                disabled={saving || !summary || !selectedId}
              >
                {saving
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan…</>
                  : <><Save className="w-5 h-5" /> Simpan Hasil Tes</>
                }
              </button>

              {/* Level legend */}
              <div className="card p-4 space-y-2">
                <p className="text-[10px] font-bold text-islamic-500 uppercase tracking-wider">Tabel Level</p>
                {LEVELS.map((l) => (
                  <div key={l.label} className="flex items-center justify-between text-xs">
                    <span>{l.emoji} {l.label}</span>
                    <span className="text-islamic-500">{l.min}–{l.max}</span>
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
