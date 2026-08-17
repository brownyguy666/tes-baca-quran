import { BookOpen, Star, CheckCircle, TrendingUp, Mic, Zap } from 'lucide-react'

const CRITERIA_INFO = [
  {
    key: 'makhraj',
    icon: <Mic className="w-5 h-5" />,
    label: 'Makhraj Al-Huruf',
    weight: 35,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.25)',
    description: 'Ketepatan tempat keluarnya huruf hijaiyah sesuai kaidah tajwid',
    indicators: [
      'Ketepatan artikulasi setiap huruf hijaiyah',
      'Perbedaan huruf yang mirip (ض/ظ، س/ص/ث، ذ/ز/ظ)',
      'Sifat huruf: jahr, hams, syiddah, rakhawah, dll.',
      'Makhraj kelompok: halqiyah, syajariyah, syafawiyah, dll.',
    ],
  },
  {
    key: 'tajwid',
    icon: <BookOpen className="w-5 h-5" />,
    label: 'Ilmu Tajwid',
    weight: 40,
    color: '#d4af37',
    bg: 'rgba(212,175,55,0.12)',
    border: 'rgba(212,175,55,0.25)',
    description: 'Penerapan hukum-hukum bacaan Al-Quran sesuai kaidah tajwid',
    indicators: [
      'Mad (Mad Wajib, Jaiz, Lazim, dll.)',
      'Ghunnah (dengung pada nun/mim bertasydid)',
      'Idgham (billaghunnah & bighunnah)',
      'Ikhfa, Iqlab, Idhar',
      'Waqaf & Ibtida — tanda baca dan cara berhenti',
    ],
  },
  {
    key: 'kelancaran',
    icon: <Zap className="w-5 h-5" />,
    label: 'Kelancaran Membaca',
    weight: 25,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.25)',
    description: 'Kemampuan membaca dengan lancar, fasih, dan penuh keyakinan',
    indicators: [
      'Continuity — tidak terbata-bata tanpa alasan',
      'Fashohah — kejelasan dan ketegasan bacaan',
      'Ritme (tartil) — tidak terlalu cepat atau lambat',
      'Kepercayaan diri — tidak ragu-ragu',
    ],
  },
]

const LEVEL_TABLE = [
  { min: 91, max: 100, label: 'Mumtaz (Tartil)', emoji: '🌟',
    color: '#d4af37', bg: 'rgba(212,175,55,0.15)', border: 'rgba(212,175,55,0.35)',
    desc: 'Bacaan sangat sempurna, tartil, sesuai semua kaidah tajwid' },
  { min: 76, max: 90,  label: 'Mahir', emoji: '✅',
    color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)',
    desc: 'Bacaan sangat baik dengan sedikit kesalahan kecil' },
  { min: 61, max: 75,  label: 'Menengah', emoji: '📈',
    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)',
    desc: 'Bacaan baik, masih ada beberapa kesalahan yang perlu diperbaiki' },
  { min: 41, max: 60,  label: 'Dasar', emoji: '📚',
    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)',
    desc: 'Bacaan cukup, perlu bimbingan intensif pada beberapa aspek' },
  { min: 0,  max: 40,  label: 'Pemula', emoji: '🌱',
    color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.35)',
    desc: 'Masih dalam tahap awal, memerlukan bimbingan penuh dari guru' },
]

export default function Rubric() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h1 className="section-title flex items-center gap-2">
          <BookOpen className="w-6 h-6" style={{ color: '#d4af37' }} />
          Panduan & Rubrik Penilaian
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>
          Matriks indikator dan pedoman penilaian baca Al-Quran
        </p>
        <div
          className="mt-3 px-4 py-2.5 rounded-xl inline-block text-sm"
          style={{
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.2)',
            color: '#fef3c7',
            fontFamily: 'Amiri, serif',
          }}
        >
          بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
        </div>
      </div>

      {/* Formula */}
      <div
        className="card p-5 animate-in"
        style={{ border: '1px solid rgba(212,175,55,0.2)' }}
      >
        <h2 className="font-bold mb-4" style={{ color: '#e2e8f0' }}>
          📐 Formula Penilaian
        </h2>
        <div
          className="text-center text-lg font-mono py-4 rounded-xl mb-4"
          style={{
            background: 'rgba(11,15,25,0.7)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: '#f8fafc',
          }}
        >
          <span style={{ color: '#818cf8' }}>Makhraj</span>
          <span style={{ color: '#475569' }}> × 35%</span>
          {' + '}
          <span style={{ color: '#d4af37' }}>Tajwid</span>
          <span style={{ color: '#475569' }}> × 40%</span>
          {' + '}
          <span style={{ color: '#34d399' }}>Kelancaran</span>
          <span style={{ color: '#475569' }}> × 25%</span>
          {' = '}
          <span className="font-black" style={{ color: '#f8fafc' }}>Skor Total</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {CRITERIA_INFO.map((c) => (
            <div
              key={c.key}
              className="rounded-xl p-3 text-center"
              style={{ background: c.bg, border: `1px solid ${c.border}` }}
            >
              <div className="flex items-center justify-center mb-1.5"
                   style={{ color: c.color }}>
                {c.icon}
              </div>
              <p className="text-xs font-bold" style={{ color: c.color }}>{c.label}</p>
              <p className="text-2xl font-black mt-1" style={{ color: c.color }}>{c.weight}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Criteria detail */}
      <div className="space-y-4 animate-in">
        <h2 className="font-bold" style={{ color: '#e2e8f0' }}>
          🎯 Indikator Per Kriteria
        </h2>
        {CRITERIA_INFO.map((c) => (
          <div
            key={c.key}
            className="card p-5"
            style={{ borderLeft: `3px solid ${c.color}` }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: c.bg, color: c.color }}
              >
                {c.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold" style={{ color: c.color }}>{c.label}</h3>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
                  >
                    Bobot {c.weight}%
                  </span>
                </div>
                <p className="text-sm mb-3" style={{ color: '#64748b' }}>{c.description}</p>
                <ul className="space-y-1.5">
                  {c.indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                                   style={{ color: c.color }} />
                      <span style={{ color: '#94a3b8' }}>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Level table */}
      <div className="space-y-4 animate-in">
        <h2 className="font-bold" style={{ color: '#e2e8f0' }}>
          🏅 Tabel Level Skor
        </h2>
        <div className="space-y-3">
          {LEVEL_TABLE.map((lv) => (
            <div
              key={lv.label}
              className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-200"
              style={{ background: lv.bg, border: `1px solid ${lv.border}` }}
            >
              <div
                className="text-2xl w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${lv.color}20`, fontSize: '1.4rem' }}
              >
                {lv.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <span className="font-bold text-base" style={{ color: lv.color }}>
                    {lv.label}
                  </span>
                  <span
                    className="font-mono text-sm font-black px-3 py-0.5 rounded-full"
                    style={{
                      background: `${lv.color}20`,
                      color: lv.color,
                      border: `1px solid ${lv.border}`,
                    }}
                  >
                    {lv.min === 0 ? '0' : lv.min}–{lv.max}
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#64748b' }}>{lv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div
        className="card p-5 animate-in"
        style={{ border: '1px solid rgba(59,130,246,0.2)' }}
      >
        <p className="text-xs" style={{ color: '#64748b' }}>
          <span className="font-bold" style={{ color: '#60a5fa' }}>📌 Catatan:</span>{' '}
          Bobot penilaian mengacu pada kurikulum PAI SMP Negeri 2 Glagah.
          Setiap kriteria dinilai dalam rentang 0–100.
          Skor total dihitung otomatis oleh sistem menggunakan formula di atas.
          Guru penguji dapat mengacu pada panduan ini selama sesi penilaian berlangsung.
        </p>
      </div>
    </div>
  )
}
