import React from 'react'
import { LEVELS } from '../utils/scoring'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getRomanMonth(monthIndex) {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  return roman[monthIndex] || 'VIII'
}

function getLevelBadgeStyle(levelLabel) {
  const map = {
    'Mumtaz (Tartil)': {
      bg: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
      text: '#fde68a',
      border: '#d97706',
      label: 'MUMTAZ (TARTIL)',
      emoji: '🌟',
      sub: 'Istimewa / Sangat Baik',
    },
    'Mahir': {
      bg: 'linear-gradient(135deg, #14532d 0%, #052e16 100%)',
      text: '#bbf7d0',
      border: '#16a34a',
      label: 'MAHIR',
      emoji: '✅',
      sub: 'Lancar & Memenuhi Tajwid',
    },
    'Menengah': {
      bg: 'linear-gradient(135deg, #7c2d12 0%, #431407 100%)',
      text: '#fed7aa',
      border: '#ea580c',
      label: 'MENENGAH',
      emoji: '📈',
      sub: 'Cukup Baik & Perlu Latihan',
    },
    'Dasar': {
      bg: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
      text: '#bfdbfe',
      border: '#3b82f6',
      label: 'DASAR',
      emoji: '📚',
      sub: 'Tahap Pembinaan Awal',
    },
    'Pemula': {
      bg: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
      text: '#e2e8f0',
      border: '#6b7280',
      label: 'PEMULA',
      emoji: '🌱',
      sub: 'Bimbingan Intensif',
    },
  }
  return map[levelLabel] || map['Pemula']
}

function parseNotes(catatanStr) {
  if (!catatanStr || !catatanStr.trim()) {
    return [
      'Makhraj huruf dan hukum tajwid telah diuji sesuai standar rubrik tilawah.',
      'Tingkatkan kebiasaan membaca Al-Qur\'an secara istiqomah setiap hari 🌟',
    ]
  }

  const rawList = catatanStr
    .split(/[;\n|]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (rawList.length === 0) return [catatanStr.trim()]
  return rawList.slice(0, 4)
}

// ── SVG Corner Arabesques ────────────────────────────────────────────────────
const CornerFlourish = ({ style }) => (
  <svg width="85" height="85" viewBox="0 0 85 85" fill="none" style={style}>
    <path d="M0 0 L85 0 L85 7 L7 7 L7 85 L0 85 Z" fill="#c9a227" />
    <path d="M11 11 L75 11 L75 15 L15 15 L15 75 L11 75 Z" fill="#14532d" />
    <circle cx="28" cy="28" r="10" stroke="#c9a227" strokeWidth="2" fill="none" />
    <circle cx="28" cy="28" r="5" fill="#c9a227" />
    <path d="M18 28 L38 28 M28 18 L28 38" stroke="#c9a227" strokeWidth="1.5" />
    <circle cx="48" cy="18" r="2" fill="#c9a227" />
    <circle cx="18" cy="48" r="2" fill="#c9a227" />
  </svg>
)

// ── Score Bar Component ──────────────────────────────────────────────────────
function ScoreMiniBar({ label, score, weight }) {
  const pct = Math.min(100, Math.max(0, score || 0))
  const color = score >= 91 ? '#d97706' : score >= 76 ? '#15803d' : score >= 61 ? '#ea580c' : '#2563eb'

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '11px', color: '#334155', fontWeight: 700 }}>
          {label} <span style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 600 }}>({weight}%)</span>
        </span>
        <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
          {score} <span style={{ fontSize: '9px', color: '#94a3b8' }}>/100</span>
        </span>
      </div>
      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px' }} />
      </div>
    </div>
  )
}

/**
 * Official Authentic School Stamp Component
 * Circular ink seal with school logo, Dinas Pendidikan, and SMPN 2 Glagah
 */
function OfficialSchoolStamp() {
  return (
    <div
      style={{
        position: 'absolute',
        left: '-15px',
        bottom: '-10px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        border: '2.5px dashed #2563eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.85,
        transform: 'rotate(-10deg)',
        pointerEvents: 'none',
        boxSizing: 'border-box',
        padding: '4px',
        boxShadow: 'inset 0 0 10px rgba(37,99,235,0.15)',
      }}
    >
      {/* Inner circular boundary */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '1.5px solid #2563eb',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <span
          style={{
            fontSize: '6.5px',
            fontWeight: 900,
            color: '#1d4ed8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1,
            marginBottom: '2px',
          }}
        >
          PEMERINTAH BANYUWANGI
        </span>

        <img
          src="/logo-smpn2glagah.png"
          alt="Stamp Logo"
          style={{
            width: '32px',
            height: '32px',
            objectFit: 'contain',
            filter: 'contrast(1.2) drop-shadow(0 0 1px rgba(37,99,235,0.8))',
          }}
        />

        <span
          style={{
            fontSize: '6.5px',
            fontWeight: 900,
            color: '#1d4ed8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1,
            marginTop: '2px',
          }}
        >
          SMPN 2 GLAGAH
        </span>
      </div>
    </div>
  )
}

/**
 * CertificateTemplate
 *
 * Renders an official, authoritative, and beautiful A4-landscape certificate
 * complete with transparent school logo, formal kop, official certificate number,
 * detailed scores, evaluation notes, authentic stamp, and signatures.
 */
export default function CertificateTemplate({ result, id = 'certificate-template' }) {
  if (!result) return null

  const levelBadge = getLevelBadgeStyle(result.level)
  const notesList  = parseNotes(result.catatan)

  // Generate formal certificate number
  const testDate    = result.tanggal_tes ? new Date(result.tanggal_tes) : new Date()
  const yearStr     = testDate.getFullYear()
  const romanMonth  = getRomanMonth(testDate.getMonth())
  const rawId       = result.id ? String(result.id) : ''
  const numericSeed = rawId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const paddedNo    = String((numericSeed % 900) + 100).padStart(3, '0')
  const certNumber  = `421.3 / BQ-${paddedNo} / SMPN.2.GLG / ${romanMonth} / ${yearStr}`

  return (
    <div
      id={id}
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        visibility: 'hidden',
        width: '1122px',   // A4 landscape @ 96dpi
        height: '794px',
        backgroundColor: '#fffefb',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        boxSizing: 'border-box',
        overflow: 'hidden',
        zIndex: -999,
        pointerEvents: 'none',
        color: '#0f172a',
      }}
    >
      {/* ── Outer Decorative Multi-Border Frame ── */}
      <div
        style={{
          position: 'absolute',
          inset: '12px',
          border: '4.5px solid #14532d',
          borderRadius: '10px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '18px',
          border: '1.5px solid #c9a227',
          borderRadius: '6px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '24px',
          border: '0.75px dashed rgba(201,162,39,0.6)',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Corner Flourishes ── */}
      <CornerFlourish style={{ position: 'absolute', top: '16px', left: '16px' }} />
      <CornerFlourish style={{ position: 'absolute', top: '16px', right: '16px', transform: 'rotate(90deg)' }} />
      <CornerFlourish style={{ position: 'absolute', bottom: '16px', left: '16px', transform: 'rotate(270deg)' }} />
      <CornerFlourish style={{ position: 'absolute', bottom: '16px', right: '16px', transform: 'rotate(180deg)' }} />

      {/* ── Subtle Islamic Geometry Watermark ── */}
      <div
        style={{
          position: 'absolute',
          inset: '40px',
          opacity: 0.035,
          backgroundImage: "radial-gradient(#14532d 1px, transparent 1px)",
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Large Faded School Logo Watermark Center ── */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '52%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '320px',
          opacity: 0.04,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/logo-smpn2glagah.png"
          alt="Watermark"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* ── Inner Content Container ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '28px 52px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* ══════════════════════════════════════════════════════════
            HEADER SECTION: Logo & School Letterhead
            ══════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '2px' }}>
          <img
            src="/logo-smpn2glagah.png"
            alt="Logo SMPN 2 Glagah"
            style={{
              width: '74px',
              height: '74px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.18))',
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', color: '#475569', margin: 0, textTransform: 'uppercase' }}>
              Pemerintah Kabupaten Banyuwangi · Dinas Pendidikan
            </p>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#14532d',
              margin: '1px 0',
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: '0.04em',
            }}>
              SMP NEGERI 2 GLAGAH
            </h1>
            <p style={{ fontSize: '10px', color: '#64748b', margin: 0, letterSpacing: '0.02em', fontWeight: 500 }}>
              Jl. Raya Glagah, Kec. Glagah, Kab. Banyuwangi, Jawa Timur · Kode Pos 68432 · Web: smpn2glagah.sch.id
            </p>
          </div>
          <img
            src="/logo-smpn2glagah.png"
            alt="Logo SMPN 2 Glagah"
            style={{
              width: '74px',
              height: '74px',
              objectFit: 'contain',
              opacity: 0, // balanced invisible spacer
            }}
          />
        </div>

        {/* Header Divider Line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '2px 0 4px 0' }}>
          <div style={{ height: '1.5px', background: 'linear-gradient(to right, transparent, #c9a227)', width: '240px' }} />
          <span style={{ color: '#c9a227', fontSize: '14px' }}>❖</span>
          <div style={{ height: '1.5px', background: 'linear-gradient(to left, transparent, #c9a227)', width: '240px' }} />
        </div>

        {/* Bismillah Calligraphy */}
        <p
          style={{
            fontFamily: "'Amiri', Georgia, serif",
            fontSize: '15px',
            color: '#14532d',
            textAlign: 'center',
            margin: '0 0 2px 0',
            letterSpacing: '0.04em',
          }}
        >
          بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
        </p>

        {/* ══════════════════════════════════════════════════════════
            TITLE & BANNER + OFFICIAL CERTIFICATE NUMBER
            ══════════════════════════════════════════════════════════ */}
        <div style={{ textAlign: 'center', margin: '0 0 2px 0' }}>
          <h2 style={{
            fontSize: '25px',
            fontWeight: 900,
            color: '#14532d',
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: '0.14em',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            SERTIFIKAT KELULUSAN
          </h2>

          {/* Emerald & Gold Ribbon Banner */}
          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #0f3922 100%)',
            border: '1.5px solid #c9a227',
            borderRadius: '24px',
            padding: '5px 38px',
            margin: '3px 0 2px 0',
            boxShadow: '0 2px 10px rgba(20,83,45,0.25)',
          }}>
            <p style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#fef3c7',
              letterSpacing: '0.16em',
              margin: 0,
              textTransform: 'uppercase',
            }}>
              TES KEMAMPUAN BACA AL-QUR'AN
            </p>
          </div>

          {/* Official Certificate Number */}
          <p style={{
            fontSize: '10.5px',
            color: '#475569',
            fontWeight: 700,
            margin: '3px 0 0 0',
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
          }}>
            Nomor: {certNumber}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RECIPIENT SECTION
            ══════════════════════════════════════════════════════════ */}
        <div style={{ textAlign: 'center', margin: '2px 0 6px 0' }}>
          <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 2px 0', fontStyle: 'italic' }}>
            Diberikan dengan penuh apresiasi dan kehormatan kepada:
          </p>
          <div style={{ display: 'inline-block', borderBottom: '2.5px solid #c9a227', paddingBottom: '3px', paddingLeft: '28px', paddingRight: '28px' }}>
            <h3 style={{
              fontSize: '27px',
              fontWeight: 900,
              color: '#14532d',
              fontFamily: "'Playfair Display', Georgia, serif",
              margin: 0,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}>
              {result.murid?.nama || result.nama_murid || '-'}
            </h3>
          </div>
          <p style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', margin: '3px 0 0 0' }}>
            Kelas: {result.murid?.kelas || result.kelas_murid || '-'}
            {result.murid?.nisn || result.nisn_murid ? `  ·  NISN: ${result.murid?.nisn || result.nisn_murid}` : ''}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TWO-COLUMN BODY (Scores & Details on Left, Level & Notes on Right)
            ══════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch', margin: '0 0 6px 0' }}>

          {/* LEFT BOX: Uraian & Rincian Nilai */}
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.92)',
              border: '1.5px solid rgba(20,83,45,0.25)',
              borderRadius: '12px',
              padding: '12px 18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: '#14532d', letterSpacing: '0.06em' }}>
                  Rincian Penilaian Asesmen
                </span>
                <span style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 600 }}>
                  {formatDate(result.tanggal_tes)}
                </span>
              </div>

              {/* Ayat yang dibaca */}
              {result.ayat_dibaca && (
                <div style={{
                  background: 'rgba(201,162,39,0.1)',
                  border: '1px solid rgba(201,162,39,0.35)',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  marginBottom: '8px',
                }}>
                  <p style={{ fontSize: '9px', color: '#92400e', margin: 0, fontWeight: 800, textTransform: 'uppercase' }}>
                    Materi Surat &amp; Ayat yang Diuji:
                  </p>
                  <p style={{ fontSize: '11.5px', color: '#78350f', margin: 0, fontWeight: 800, fontStyle: 'italic' }}>
                    📖 {result.ayat_dibaca}
                  </p>
                </div>
              )}

              {/* Mini Score Bars */}
              <ScoreMiniBar label="Makharijul Huruf (Artikulasi)" score={result.skor_makhraj} weight={35} />
              <ScoreMiniBar label="Kaidah Hukum Tajwid" score={result.skor_tajwid} weight={40} />
              <ScoreMiniBar label="Kelancaran, Irama &amp; Adab" score={result.skor_kelancaran} weight={25} />
            </div>

            {/* Total Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '6px',
              borderTop: '1.5px dashed rgba(20,83,45,0.3)',
              marginTop: '4px',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#14532d' }}>Total Skor Akhir</span>
              <span style={{ fontSize: '17px', fontWeight: 900, color: '#14532d', fontFamily: 'monospace' }}>
                {result.skor_total} <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>/ 100</span>
              </span>
            </div>
          </div>

          {/* RIGHT BOX: Predikat & Catatan Hasil Ujian */}
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.92)',
              border: '1.5px solid rgba(20,83,45,0.25)',
              borderRadius: '12px',
              padding: '12px 18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Level Badge Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: levelBadge.bg,
                border: `1.5px solid ${levelBadge.border}`,
                borderRadius: '10px',
                padding: '6px 14px',
                marginBottom: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>
                <div>
                  <p style={{ fontSize: '8.5px', color: levelBadge.text, opacity: 0.9, margin: 0, textTransform: 'uppercase', fontWeight: 800 }}>
                    Predikat Capaian:
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: 900, color: levelBadge.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>
                    {levelBadge.emoji} {result.level}
                  </p>
                  <p style={{ fontSize: '8.5px', color: levelBadge.text, opacity: 0.8, margin: 0, fontStyle: 'italic' }}>
                    {levelBadge.sub}
                  </p>
                </div>
                {/* Score badge */}
                <div style={{
                  background: 'rgba(255,255,255,0.22)',
                  border: '1.5px solid rgba(255,255,255,0.45)',
                  borderRadius: '10px',
                  padding: '4px 14px',
                  textAlign: 'center',
                  minWidth: '68px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '8px', color: levelBadge.text, fontWeight: 800, opacity: 0.9, letterSpacing: '0.06em' }}>SKOR</span>
                  <span style={{
                    fontSize: '23px',
                    fontWeight: 900,
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    lineHeight: 1.1,
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  }}>{result.skor_total}</span>
                </div>
              </div>

              {/* Catatan Hasil Ujian Box */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                <p style={{ fontSize: '10px', fontWeight: 800, color: '#15803d', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Catatan &amp; Bimbingan Evaluasi Penguji:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {notesList.map((note, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '10.5px', color: '#1e293b', lineHeight: 1.35, fontWeight: 600 }}>
                      <span style={{ color: '#d97706', fontSize: '9.5px', marginTop: '1px' }}>•</span>
                      <span style={{ flex: 1 }}>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '9px', color: '#64748b', margin: '4px 0 0 0', fontStyle: 'italic', textAlign: 'right' }}>
              *Dinyatakan sah memenuhi standar asesmen kompetensi baca Al-Qur'an
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            SIGNATURES & OFFICIAL SEAL SECTION
            ══════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px 4px 10px', position: 'relative' }}>

          {/* Left Signature: Kepala Sekolah (SRIATUN, S.Pd.) with Stamped Seal */}
          <div style={{ width: '250px', textAlign: 'center', position: 'relative' }}>
            <p style={{ fontSize: '10.5px', color: '#475569', margin: 0 }}>Mengetahui,</p>
            <p style={{ fontSize: '11.5px', fontWeight: 800, color: '#14532d', margin: '1px 0 40px 0' }}>
              Kepala SMP Negeri 2 Glagah
            </p>

            {/* Official Ink Stamp Layered over signature */}
            <OfficialSchoolStamp />

            <p style={{
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0',
              textDecoration: 'underline',
              letterSpacing: '0.02em',
              position: 'relative',
              zIndex: 2,
            }}>
              SRIATUN, S.Pd.
            </p>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '1px 0 0 0', fontWeight: 600, position: 'relative', zIndex: 2 }}>
              NIP. 197006061999032006
            </p>
          </div>

          {/* Center: Official School Golden Medallion Seal */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fef08a 0%, #d4af37 50%, #b45309 100%)',
                border: '2.5px solid #78350f',
                boxShadow: '0 4px 14px rgba(180,83,9,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <img
                src="/logo-smpn2glagah.png"
                alt="Seal"
                style={{ width: '44px', height: '44px', objectFit: 'contain' }}
              />
            </div>
            <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#78350f', letterSpacing: '0.12em', marginTop: '3px', textTransform: 'uppercase' }}>
              SMPN 2 GLAGAH SEAL
            </span>
          </div>

          {/* Right Signature: Guru PAI */}
          <div style={{ width: '250px', textAlign: 'center' }}>
            <p style={{ fontSize: '10.5px', color: '#475569', margin: 0 }}>
              Banyuwangi, {formatDate(result.tanggal_tes)}
            </p>
            <p style={{ fontSize: '11.5px', fontWeight: 800, color: '#14532d', margin: '1px 0 40px 0' }}>
              Guru Penguji / PAI
            </p>
            <p style={{
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0',
              textDecoration: 'underline',
              letterSpacing: '0.02em',
            }}>
              {result.guru_penguji || 'Guru PAI'}
            </p>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '1px 0 0 0', fontWeight: 600 }}>
              Guru Pendidikan Agama Islam
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
