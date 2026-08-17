import { CRITERIA, LEVELS } from '../utils/scoring'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getLevelStyle(levelLabel) {
  const l = LEVELS.find((x) => x.label === levelLabel)
  if (!l) return { bg: '#4b5563', text: '#d1d5db', border: '#6b7280' }
  const map = {
    'Mumtaz (Tartil)': { bg: '#78350f', text: '#fde68a', border: '#d97706' },
    'Mahir':           { bg: '#14532d', text: '#bbf7d0', border: '#16a34a' },
    'Menengah':        { bg: '#78350f', text: '#fed7aa', border: '#ea580c' },
    'Dasar':           { bg: '#1e3a5f', text: '#bfdbfe', border: '#3b82f6' },
    'Pemula':          { bg: '#374151', text: '#d1d5db', border: '#6b7280' },
  }
  return map[levelLabel] || map['Pemula']
}

// Islamic SVG ornament (corner)
const CornerOrnament = ({ style }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={style}>
    <path d="M0 0 L60 0 L60 8 L8 8 L8 60 L0 60 Z" fill="#c9a227" opacity="0.6" />
    <path d="M0 0 L60 0 L60 4 L4 4 L4 60 L0 60 Z" fill="#c9a227" opacity="0.9" />
    <circle cx="16" cy="16" r="6" stroke="#c9a227" strokeWidth="1.5" fill="none" opacity="0.7" />
    <path d="M10 16 L22 16 M16 10 L16 22" stroke="#c9a227" strokeWidth="1" opacity="0.5" />
  </svg>
)

const OrnamentalBorder = () => (
  <div style={{
    position: 'absolute', inset: '12px',
    border: '1.5px solid rgba(201,162,39,0.4)',
    borderRadius: '4px',
    pointerEvents: 'none',
  }} />
)

// Score bar component for certificate
function ScoreBar({ label, score, maxScore = 100 }) {
  const pct = (score / maxScore) * 100
  const getBarColor = (score) => {
    if (score >= 91) return '#f59e0b'
    if (score >= 76) return '#22c55e'
    if (score >= 61) return '#f97316'
    if (score >= 41) return '#60a5fa'
    return '#9ca3af'
  }

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1a5c38' }}>{score}</span>
      </div>
      <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: getBarColor(score),
          borderRadius: '3px',
        }} />
      </div>
    </div>
  )
}

/**
 * CertificateTemplate
 *
 * Renders a hidden A4-landscape certificate ready for html2canvas capture.
 * Props:
 *   result  — hasil_tes row joined with murid
 *   id      — DOM id for the capture target (default: 'certificate-template')
 */
export default function CertificateTemplate({ result, id = 'certificate-template' }) {
  if (!result) return null

  const levelStyle = getLevelStyle(result.level)

  const scores = [
    { key: 'makhraj',    label: 'Makhraj',    score: result.skor_makhraj },
    { key: 'tajwid',     label: 'Tajwid',      score: result.skor_tajwid },
    { key: 'kelancaran', label: 'Kelancaran',  score: result.skor_kelancaran },
  ]

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
        fontFamily: "'Plus Jakarta Sans', 'system-ui', sans-serif",
        backgroundColor: '#fdf8f0',
        overflow: 'hidden',
      }}
    >
      {/* ── Background layers ─────────────────────────────── */}
      {/* Top-left green band */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '8px',
        background: 'linear-gradient(90deg, #14532d, #16a34a, #c9a227, #16a34a, #14532d)',
      }} />
      {/* Bottom green band */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px',
        background: 'linear-gradient(90deg, #14532d, #16a34a, #c9a227, #16a34a, #14532d)',
      }} />

      {/* Subtle background pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 10% 50%, rgba(22,163,74,0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 90% 50%, rgba(201,162,39,0.06) 0%, transparent 60%)
        `,
      }} />

      {/* Corner ornaments */}
      <CornerOrnament style={{ position: 'absolute', top: 12, left: 12 }} />
      <CornerOrnament style={{ position: 'absolute', top: 12, right: 12, transform: 'scaleX(-1)' }} />
      <CornerOrnament style={{ position: 'absolute', bottom: 12, left: 12, transform: 'scaleY(-1)' }} />
      <CornerOrnament style={{ position: 'absolute', bottom: 12, right: 12, transform: 'scale(-1)' }} />

      {/* Ornamental inner border */}
      <OrnamentalBorder />

      {/* ── Main Layout (2 columns) ──────────────────────── */}
      <div style={{
        position: 'absolute', inset: '28px 28px 28px 28px',
        display: 'flex', gap: '32px',
      }}>

        {/* LEFT column — main certificate content */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* School info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <img
              src="/school-logo.png"
              alt="Logo SMP Negeri 2 Glagah"
              style={{ width: '64px', height: '64px', objectFit: 'contain' }}
            />
            <div>
              <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                Lembaga Pendidikan
              </p>
              <p style={{ fontSize: '17px', fontWeight: 800, color: '#14532d', margin: '2px 0 0 0',
                fontFamily: "'Playfair Display', serif" }}>
                SMP Negeri 2 Glagah
              </p>
            </div>
          </div>

          {/* Ornament line */}
          <div style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #c9a227)' }} />
            <span style={{ color: '#c9a227', fontSize: '14px' }}>✦</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #c9a227)' }} />
          </div>

          {/* Arabic bismillah */}
          <p style={{
            fontFamily: "'Amiri', serif",
            fontSize: '18px',
            color: '#14532d',
            marginBottom: '6px',
            textAlign: 'center',
            direction: 'rtl',
          }}>
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>

          {/* Title */}
          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#14532d',
            fontFamily: "'Playfair Display', serif",
            textAlign: 'center',
            margin: '0 0 4px 0',
            letterSpacing: '0.02em',
          }}>
            SERTIFIKAT KEMAMPUAN
          </h1>
          <h2 style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#c9a227',
            textAlign: 'center',
            margin: '0 0 14px 0',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            MEMBACA AL-QUR'AN
          </h2>

          {/* Recipient */}
          <p style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', margin: '0 0 4px 0' }}>
            Diberikan kepada:
          </p>
          <div style={{
            background: 'linear-gradient(135deg, #14532d, #166534)',
            borderRadius: '12px',
            padding: '12px 32px',
            marginBottom: '10px',
            boxShadow: '0 4px 20px rgba(22,163,74,0.3)',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
              fontFamily: "'Playfair Display', serif",
              letterSpacing: '0.02em',
            }}>
              {result.murid?.nama || result.nama_murid || '-'}
            </p>
          </div>

          {/* Student details */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
            <div style={{
              background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)',
              borderRadius: '8px', padding: '6px 16px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '9px', color: '#6b7280', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Kelas</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#14532d', margin: '2px 0 0 0' }}>
                {result.murid?.kelas || result.kelas_murid || '-'}
              </p>
            </div>
            <div style={{
              background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)',
              borderRadius: '8px', padding: '6px 16px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '9px', color: '#6b7280', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>NISN</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#14532d', margin: '2px 0 0 0' }}>
                {result.murid?.nisn || result.nisn_murid || '-'}
              </p>
            </div>
            <div style={{
              background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)',
              borderRadius: '8px', padding: '6px 16px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '9px', color: '#6b7280', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Tanggal Tes</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#14532d', margin: '2px 0 0 0' }}>
                {formatDate(result.tanggal_tes)}
              </p>
            </div>
          </div>

          {/* Ayat dibaca */}
          {result.ayat_dibaca && (
            <div style={{
              background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.25)',
              borderRadius: '8px', padding: '6px 16px', marginBottom: '8px',
              textAlign: 'center', maxWidth: '460px', width: '100%',
            }}>
              <p style={{ fontSize: '9px', color: '#92400e', margin: '0 0 2px 0', fontWeight: 600, textTransform: 'uppercase' }}>
                Ayat / Surat yang Dibaca
              </p>
              <p style={{ fontSize: '12px', color: '#78350f', margin: 0, fontStyle: 'italic', fontWeight: 600 }}>
                {result.ayat_dibaca}
              </p>
            </div>
          )}

          {/* Catatan & Rekomendasi Guru */}
          <div style={{
            background: 'rgba(22,163,74,0.05)',
            border: '1px solid rgba(22,163,74,0.25)',
            borderRadius: '8px',
            padding: '8px 16px',
            marginBottom: '8px',
            textAlign: 'center',
            maxWidth: '460px',
            width: '100%',
          }}>
            <p style={{
              fontSize: '9px',
              color: '#15803d',
              margin: '0 0 3px 0',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Catatan &amp; Bimbingan Evaluasi Guru:
            </p>
            <p style={{
              fontSize: '11px',
              color: '#1e293b',
              margin: 0,
              fontStyle: 'italic',
              fontWeight: 600,
              lineHeight: 1.45,
            }}>
              {result.catatan
                ? `"${result.catatan}"`
                : '"Pertahankan kualitas bacaan dan terus tingkatkan kecintaan tilawah Al-Qur\'an secara istiqomah."'}
            </p>
          </div>

          {/* Closing text */}
          <p style={{ fontSize: '9.5px', color: '#6b7280', textAlign: 'center', margin: '2px 0 0 0', lineHeight: 1.5 }}>
            Telah menyelesaikan tes kemampuan membaca Al-Qur'an dengan hasil sebagaimana tertera di atas.
          </p>
        </div>

        {/* RIGHT column — scores & signature */}
        <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Level badge */}
          <div style={{
            background: levelStyle.bg,
            border: `2px solid ${levelStyle.border}`,
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: `0 0 20px ${levelStyle.border}40`,
          }}>
            <p style={{ fontSize: '9px', color: levelStyle.text, opacity: 0.7,
              margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Level Dicapai
            </p>
            <p style={{ fontSize: '20px', fontWeight: 800, color: levelStyle.text, margin: '0 0 8px 0',
              fontFamily: "'Playfair Display', serif" }}>
              {result.level}
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '6px 16px',
            }}>
              <span style={{ fontSize: '10px', color: levelStyle.text, opacity: 0.8 }}>Skor Total</span>
              <span style={{ fontSize: '22px', fontWeight: 900, color: levelStyle.text }}>
                {result.skor_total}
              </span>
            </div>
          </div>

          {/* Score breakdown */}
          <div style={{
            background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(22,163,74,0.2)',
            borderRadius: '12px', padding: '14px',
          }}>
            <p style={{ fontSize: '9px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', margin: '0 0 10px 0' }}>
              Rincian Penilaian
            </p>
            {scores.map(({ key, label, score }) => (
              <ScoreBar key={key} label={label} score={score} />
            ))}
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(22,163,74,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#374151', fontWeight: 700 }}>Total Tertimbang</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#14532d' }}>{result.skor_total}</span>
              </div>
              <p style={{ fontSize: '9px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                Makhraj(35%) + Tajwid(40%) + Kelancaran(25%)
              </p>
            </div>
          </div>

          {/* Signature */}
          <div style={{
            background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(22,163,74,0.2)',
            borderRadius: '12px', padding: '14px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '9px', color: '#6b7280', margin: '0 0 2px 0', fontWeight: 600 }}>
              Guru Penguji
            </p>
            <div style={{ height: '40px', marginBottom: '4px' }} /> {/* Signature space */}
            <div style={{ height: '1px', background: '#d1d5db', marginBottom: '4px' }} />
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#14532d', margin: 0 }}>
              {result.guru_penguji || '-'}
            </p>
            <p style={{ fontSize: '9px', color: '#6b7280', margin: '2px 0 0 0' }}>
              Guru Pendidikan Al-Qur'an
            </p>
          </div>

          {/* QR / stamp placeholder */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(22,163,74,0.05)', border: '1px dashed rgba(22,163,74,0.3)',
            borderRadius: '8px', padding: '8px',
          }}>
            <p style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
              📋 No. {result.id?.slice(0, 8).toUpperCase() || 'XXXXXXXX'}<br />
              <span style={{ color: '#9ca3af' }}>ID Dokumen Sertifikat</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
