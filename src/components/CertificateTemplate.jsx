import { LEVELS } from '../utils/scoring'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getLevelBadgeStyle(levelLabel) {
  const map = {
    'Mumtaz (Tartil)': { bg: '#78350f', text: '#fde68a', border: '#d97706', label: 'MUMTAZ (TARTIL)', emoji: '🌟' },
    'Mahir':           { bg: '#14532d', text: '#bbf7d0', border: '#16a34a', label: 'MAHIR',            emoji: '✅' },
    'Menengah':        { bg: '#78350f', text: '#fed7aa', border: '#ea580c', label: 'MENENGAH',         emoji: '📈' },
    'Dasar':           { bg: '#1e3a5f', text: '#bfdbfe', border: '#3b82f6', label: 'DASAR',            emoji: '📚' },
    'Pemula':          { bg: '#374151', text: '#e2e8f0', border: '#6b7280', label: 'PEMULA',           emoji: '🌱' },
  }
  return map[levelLabel] || map['Pemula']
}

function parseNotes(catatanStr) {
  if (!catatanStr || !catatanStr.trim()) {
    return [
      'Makhraj dan kaidah tajwid telah diuji sesuai rubrik standar.',
      'Pertahankan bacaan dan tingkatkan kecintaan tilawah Al-Qur\'an secara istiqomah 🌟',
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
  <svg width="70" height="70" viewBox="0 0 70 70" fill="none" style={style}>
    <path d="M0 0 L70 0 L70 6 L6 6 L6 70 L0 70 Z" fill="#c9a227" />
    <path d="M10 10 L60 10 L60 13 L13 13 L13 60 L10 60 Z" fill="#14532d" />
    <circle cx="22" cy="22" r="8" stroke="#c9a227" strokeWidth="1.5" fill="none" />
    <circle cx="22" cy="22" r="4" fill="#c9a227" />
    <path d="M14 22 L30 22 M22 14 L22 30" stroke="#c9a227" strokeWidth="1" />
  </svg>
)

// ── Score Bar Component ──────────────────────────────────────────────────────
function ScoreMiniBar({ label, score, weight }) {
  const pct = Math.min(100, Math.max(0, score || 0))
  const color = score >= 91 ? '#d97706' : score >= 76 ? '#15803d' : score >= 61 ? '#ea580c' : '#2563eb'

  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
        <span style={{ fontSize: '11px', color: '#334155', fontWeight: 600 }}>
          {label} <span style={{ fontSize: '9px', color: '#64748b' }}>({weight}%)</span>
        </span>
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
          {score}
        </span>
      </div>
      <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px' }} />
      </div>
    </div>
  )
}

/**
 * CertificateTemplate
 *
 * Renders an official, authoritative, and beautiful A4-landscape certificate
 * complete with school logo, formal kop, detailed scores, evaluation notes,
 * and signatures for Kepala Sekolah & Guru PAI.
 */
export default function CertificateTemplate({ result, id = 'certificate-template' }) {
  if (!result) return null

  const levelBadge = getLevelBadgeStyle(result.level)
  const notesList  = parseNotes(result.catatan)
  const docNo      = result.id ? result.id.slice(0, 8).toUpperCase() : 'SMPN2GLG'
  const yearStr    = new Date(result.tanggal_tes || Date.now()).getFullYear()

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
        backgroundColor: '#fffdf9',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        boxSizing: 'border-box',
        overflow: 'hidden',
        zIndex: -1,
        color: '#0f172a',
      }}
    >
      {/* ── Outer Double Border Frame ── */}
      <div
        style={{
          position: 'absolute',
          inset: '12px',
          border: '4px solid #14532d',
          borderRadius: '8px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '18px',
          border: '1.5px solid #c9a227',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '24px',
          border: '0.75px dashed rgba(201,162,39,0.5)',
          borderRadius: '3px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Corner Flourishes ── */}
      <CornerFlourish style={{ position: 'absolute', top: '16px', left: '16px' }} />
      <CornerFlourish style={{ position: 'absolute', top: '16px', right: '16px', transform: 'rotate(90deg)' }} />
      <CornerFlourish style={{ position: 'absolute', bottom: '16px', left: '16px', transform: 'rotate(270deg)' }} />
      <CornerFlourish style={{ position: 'absolute', bottom: '16px', right: '16px', transform: 'rotate(180deg)' }} />

      {/* ── Watermark Background Pattern ── */}
      <div
        style={{
          position: 'absolute',
          inset: '40px',
          opacity: 0.03,
          backgroundImage: "radial-gradient(#14532d 1px, transparent 1px)",
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Inner Content Container ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '32px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* ══════════════════════════════════════════════════════════
            HEADER SECTION: Logo & School Letterhead
            ══════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', marginBottom: '4px' }}>
          <img
            src="/school-logo.png"
            alt="Logo SMPN 2 Glagah"
            style={{
              width: '68px',
              height: '68px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#475569', margin: 0, textTransform: 'uppercase' }}>
              Pemerintah Kabupaten Banyuwangi · Dinas Pendidikan
            </p>
            <h1 style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#14532d',
              margin: '1px 0',
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: '0.04em',
            }}>
              SMP NEGERI 2 GLAGAH
            </h1>
            <p style={{ fontSize: '9.5px', color: '#64748b', margin: 0, letterSpacing: '0.02em' }}>
              Jl. Raya Glagah, Kec. Glagah, Kab. Banyuwangi, Jawa Timur · Website: smpn2glagah.sch.id
            </p>
          </div>
          <img
            src="/school-logo.png"
            alt="Logo SMPN 2 Glagah"
            style={{
              width: '68px',
              height: '68px',
              objectFit: 'contain',
              opacity: 0, // balanced spacer
            }}
          />
        </div>

        {/* Header Divider Line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '2px 0 6px 0' }}>
          <div style={{ height: '1.5px', background: 'linear-gradient(to right, transparent, #c9a227)', width: '220px' }} />
          <span style={{ color: '#c9a227', fontSize: '14px' }}>❖</span>
          <div style={{ height: '1.5px', background: 'linear-gradient(to left, transparent, #c9a227)', width: '220px' }} />
        </div>

        {/* ══════════════════════════════════════════════════════════
            TITLE & BANNER
            ══════════════════════════════════════════════════════════ */}
        <div style={{ textAlign: 'center', margin: '0 0 2px 0' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 900,
            color: '#14532d',
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: '0.12em',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            SERTIFIKAT KELULUSAN
          </h2>

          {/* Emerald & Gold Ribbon Banner */}
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #0f3922 100%)',
            border: '1.5px solid #c9a227',
            borderRadius: '20px',
            padding: '4px 28px',
            margin: '4px 0 2px 0',
            boxShadow: '0 2px 10px rgba(20,83,45,0.25)',
          }}>
            <p style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#fef3c7',
              letterSpacing: '0.15em',
              margin: 0,
              textTransform: 'uppercase',
            }}>
              TES KEMAMPUAN BACA AL-QUR'AN
            </p>
          </div>

          <p style={{ fontSize: '9px', color: '#64748b', margin: '2px 0 0 0', fontStyle: 'italic' }}>
            Nomor: 421.3 / BQ-{docNo} / SMPN2GLG / {yearStr}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RECIPIENT SECTION
            ══════════════════════════════════════════════════════════ */}
        <div style={{ textAlign: 'center', margin: '2px 0 6px 0' }}>
          <p style={{ fontSize: '10.5px', color: '#475569', margin: '0 0 2px 0', fontStyle: 'italic' }}>
            Diberikan kepada:
          </p>
          <div style={{ display: 'inline-block', borderBottom: '2px solid #c9a227', paddingBottom: '2px', paddingLeft: '24px', paddingRight: '24px' }}>
            <h3 style={{
              fontSize: '26px',
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
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#334155', margin: '3px 0 0 0' }}>
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
              background: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(20,83,45,0.25)',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#14532d', letterSpacing: '0.06em' }}>
                  Rincian Penilaian Asesmen
                </span>
                <span style={{ fontSize: '9.5px', color: '#64748b' }}>
                  {formatDate(result.tanggal_tes)}
                </span>
              </div>

              {/* Ayat yang dibaca */}
              {result.ayat_dibaca && (
                <div style={{
                  background: 'rgba(201,162,39,0.08)',
                  border: '1px solid rgba(201,162,39,0.3)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  marginBottom: '8px',
                }}>
                  <p style={{ fontSize: '9px', color: '#92400e', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>
                    Materi Surat / Ayat yang Diuji:
                  </p>
                  <p style={{ fontSize: '11px', color: '#78350f', margin: 0, fontWeight: 700, fontStyle: 'italic' }}>
                    📖 {result.ayat_dibaca}
                  </p>
                </div>
              )}

              {/* Mini Score Bars */}
              <ScoreMiniBar label="Makharijul Huruf" score={result.skor_makhraj} weight={35} />
              <ScoreMiniBar label="Kaidah Tajwid" score={result.skor_tajwid} weight={40} />
              <ScoreMiniBar label="Kelancaran & Adab" score={result.skor_kelancaran} weight={25} />
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
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#14532d' }}>Total Skor Akhir</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#14532d', fontFamily: 'monospace' }}>
                {result.skor_total} <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>/ 100</span>
              </span>
            </div>
          </div>

          {/* RIGHT BOX: Predikat & Catatan Hasil Ujian */}
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(20,83,45,0.25)',
              borderRadius: '12px',
              padding: '12px 16px',
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
                borderRadius: '8px',
                padding: '6px 12px',
                marginBottom: '8px',
              }}>
                <div>
                  <p style={{ fontSize: '8.5px', color: levelBadge.text, opacity: 0.85, margin: 0, textTransform: 'uppercase', fontWeight: 700 }}>
                    Predikat Capaian:
                  </p>
                  <p style={{ fontSize: '15px', fontWeight: 900, color: levelBadge.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>
                    {levelBadge.emoji} {result.level}
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '2px 8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '9px', color: levelBadge.text, fontWeight: 700 }}>Skor: {result.skor_total}</span>
                </div>
              </div>

              {/* Catatan Hasil Ujian Box */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                <p style={{ fontSize: '9.5px', fontWeight: 800, color: '#15803d', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Catatan &amp; Bimbingan Evaluasi Guru:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {notesList.map((note, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', fontSize: '10.5px', color: '#1e293b', lineHeight: 1.35, fontWeight: 600 }}>
                      <span style={{ color: '#d97706', fontSize: '9px', marginTop: '1px' }}>•</span>
                      <span style={{ flex: 1 }}>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '8.5px', color: '#64748b', margin: '4px 0 0 0', fontStyle: 'italic', textAlign: 'right' }}>
              *Dinyatakan sah memenuhi standar penilaian baca Al-Qur'an
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            SIGNATURES & OFFICIAL SEAL SECTION
            ══════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px 4px 10px' }}>

          {/* Left Signature: Kepala Sekolah (SRIATUN, S.Pd.) */}
          <div style={{ width: '240px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', color: '#475569', margin: 0 }}>Mengetahui,</p>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#14532d', margin: '1px 0 42px 0' }}>
              Kepala SMP Negeri 2 Glagah
            </p>
            <p style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0',
              textDecoration: 'underline',
              letterSpacing: '0.02em',
            }}>
              SRIATUN, S.Pd.
            </p>
            <p style={{ fontSize: '9.5px', color: '#64748b', margin: '1px 0 0 0' }}>
              NIP. .........................................
            </p>
          </div>

          {/* Center: Official School Golden Medallion Seal */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fef08a 0%, #d4af37 50%, #b45309 100%)',
                border: '2px solid #78350f',
                boxShadow: '0 4px 12px rgba(180,83,9,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <img
                src="/school-logo.png"
                alt="Seal"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
            </div>
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#78350f', letterSpacing: '0.1em', marginTop: '2px', textTransform: 'uppercase' }}>
              SEAL OF EXCELLENCE
            </span>
          </div>

          {/* Right Signature: Guru PAI */}
          <div style={{ width: '240px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', color: '#475569', margin: 0 }}>
              Banyuwangi, {formatDate(result.tanggal_tes)}
            </p>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#14532d', margin: '1px 0 42px 0' }}>
              Guru Penguji / PAI
            </p>
            <p style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0',
              textDecoration: 'underline',
              letterSpacing: '0.02em',
            }}>
              {result.guru_penguji || 'Guru PAI'}
            </p>
            <p style={{ fontSize: '9.5px', color: '#64748b', margin: '1px 0 0 0' }}>
              Guru Pendidikan Agama Islam
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
