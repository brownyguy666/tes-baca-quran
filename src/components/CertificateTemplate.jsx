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

function getPredikatInfo(totalScore, levelLabel) {
  const total = Number(totalScore) || 0
  if (total < 50 || (levelLabel && levelLabel.toLowerCase().includes('remidi'))) {
    return {
      label: 'Remidi (Wajib Mengulang)',
      tier: 'remidi',
      accentA: '#c47784',
      accentB: '#7c2432',
      isPassed: false,
    }
  }
  if (total >= 91 || (levelLabel && levelLabel.toLowerCase().includes('mumtaz'))) {
    return {
      label: '✦ Mumtaz (Tartil)',
      tier: 'mumtaz',
      accentA: '#f0d68a',
      accentB: '#a8791e',
      isPassed: true,
    }
  }
  if (total >= 76 || (levelLabel && levelLabel.toLowerCase().includes('mahir'))) {
    return {
      label: 'Mahir',
      tier: 'mahir',
      accentA: '#5cbb8e',
      accentB: '#0b4a38',
      isPassed: true,
    }
  }
  if (total >= 61 || (levelLabel && levelLabel.toLowerCase().includes('menengah'))) {
    return {
      label: 'Menengah',
      tier: 'menengah',
      accentA: '#dcb15c',
      accentB: '#9c6f1e',
      isPassed: true,
    }
  }
  return {
    label: 'Dasar (Cukup)',
    tier: 'dasar',
    accentA: '#c9a878',
    accentB: '#7a5230',
    isPassed: true,
  }
}

function parseNotes(catatanStr, isPassed) {
  if (!catatanStr || !catatanStr.trim()) {
    if (!isPassed) {
      return 'Nilai belum mencapai batas ketuntasan minimum (skor < 50). Wajib mengikuti bimbingan remidial bersama Guru PAI agar bacaan sesuai kaidah tartil.'
    }
    return 'Bacaan tergolong lancar dan memenuhi kaidah makharijul huruf serta tajwid standar. Tingkatkan kecintaan dan keistiqomahan membaca Al-Qur\'an setiap hari.'
  }
  return catatanStr.replace(/[;\n|]+/g, ' · ').trim()
}

// ── Corner SVGs ──────────────────────────────────────────────────────────────

const CornerTL = () => (
  <svg width="102" height="102" viewBox="0 0 140 140" style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 2 }}>
    <g fill="none" stroke="#b8862e" strokeWidth="1.1" opacity=".85">
      <path d="M0 46 L0 0 L46 0" />
      <path d="M0 58 L0 8 L58 8" strokeWidth=".6" opacity=".65" />
      <g transform="translate(30,30)">
        <circle r="17" />
        <rect x="-12" y="-12" width="24" height="24" />
        <rect x="-12" y="-12" width="24" height="24" transform="rotate(45)" />
        <circle r="2.4" fill="#b8862e" stroke="none" />
      </g>
    </g>
  </svg>
)

const CornerTR = () => (
  <svg width="102" height="102" viewBox="0 0 140 140" style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2, transform: 'scaleX(-1)' }}>
    <g fill="none" stroke="#b8862e" strokeWidth="1.1" opacity=".85">
      <path d="M0 46 L0 0 L46 0" />
      <path d="M0 58 L0 8 L58 8" strokeWidth=".6" opacity=".65" />
      <g transform="translate(30,30)">
        <circle r="17" />
        <rect x="-12" y="-12" width="24" height="24" />
        <rect x="-12" y="-12" width="24" height="24" transform="rotate(45)" />
        <circle r="2.4" fill="#b8862e" stroke="none" />
      </g>
    </g>
  </svg>
)

const CornerBL = () => (
  <svg width="102" height="102" viewBox="0 0 140 140" style={{ position: 'absolute', bottom: '8px', left: '8px', zIndex: 2, transform: 'scaleY(-1)' }}>
    <g fill="none" stroke="#b8862e" strokeWidth="1.1" opacity=".85">
      <path d="M0 46 L0 0 L46 0" />
      <path d="M0 58 L0 8 L58 8" strokeWidth=".6" opacity=".65" />
      <g transform="translate(30,30)">
        <circle r="17" />
        <rect x="-12" y="-12" width="24" height="24" />
        <rect x="-12" y="-12" width="24" height="24" transform="rotate(45)" />
        <circle r="2.4" fill="#b8862e" stroke="none" />
      </g>
    </g>
  </svg>
)

const CornerBR = () => (
  <svg width="102" height="102" viewBox="0 0 140 140" style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 2, transform: 'scale(-1,-1)' }}>
    <g fill="none" stroke="#b8862e" strokeWidth="1.1" opacity=".85">
      <path d="M0 46 L0 0 L46 0" />
      <path d="M0 58 L0 8 L58 8" strokeWidth=".6" opacity=".65" />
      <g transform="translate(30,30)">
        <circle r="17" />
        <rect x="-12" y="-12" width="24" height="24" />
        <rect x="-12" y="-12" width="24" height="24" transform="rotate(45)" />
        <circle r="2.4" fill="#b8862e" stroke="none" />
      </g>
    </g>
  </svg>
)

/**
 * CertificateTemplate
 *
 * Implements the user's custom HTML/CSS Islamic luxury certificate design.
 * Features vector Islamic geometry watermark, emerald/gold framing,
 * Kop Surat with logo, 8-point geometric star score medal, and clean signature spaces.
 */
export default function CertificateTemplate({ result, id = 'certificate-template' }) {
  if (!result) return null

  const totalScore = Number(result.skor_total) || 0
  const predikat = getPredikatInfo(totalScore, result.level)
  const isPassed = predikat.isPassed
  const notesText = parseNotes(result.catatan, isPassed)

  // Scores
  const skorMakhraj = Number(result.skor_makhraj) || 0
  const skorTajwid = Number(result.skor_tajwid) || 0
  const skorKelancaran = Number(result.skor_kelancaran) || 0

  // Generate formal certificate number
  const testDate = result.tanggal_tes ? new Date(result.tanggal_tes) : new Date()
  const yearStr = testDate.getFullYear()
  const romanMonth = getRomanMonth(testDate.getMonth())
  const rawId = result.id ? String(result.id) : ''
  const numericSeed = rawId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const paddedNo = String((numericSeed % 900) + 100).padStart(3, '0')
  const certNumber = `Nomor: 421.3 / BQ-${paddedNo} / SMPN.2.GLG / ${romanMonth} / ${yearStr}`
  const formattedDate = formatDate(result.tanggal_tes)
  const cleanAyat = (result.ayat_dibaca || '').replace(/^📖\s*/, '')

  return (
    <div
      id={id}
      style={{
        position: 'fixed',
        left: '0px',
        top: '0px',
        visibility: 'hidden',
        width: '1122px',   // A4 landscape @ 96dpi (297mm)
        height: '794px',   // A4 landscape @ 96dpi (210mm)
        backgroundColor: '#0b4a38',
        boxSizing: 'border-box',
        overflow: 'hidden',
        zIndex: -9999,
        pointerEvents: 'none',
        color: '#241f18',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}
    >
      {/* ── Outer Gold Hairline ── */}
      <div
        style={{
          position: 'absolute',
          inset: '9px',
          border: '1.3px solid #b8862e',
          opacity: 0.8,
          pointerEvents: 'none',
        }}
      />

      {/* ── Inner Frame (Parchment Texture) ── */}
      <div
        style={{
          position: 'absolute',
          inset: '17px',
          backgroundColor: '#fbf3e0',
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(184,134,46,.035) 0 2px, transparent 2px 26px),
            repeating-linear-gradient(-45deg, rgba(184,134,46,.035) 0 2px, transparent 2px 26px)
          `,
          border: '2.2px solid #b8862e',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Watermark Islamic 8-Point Star */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '560px',
            height: '560px',
            marginLeft: '-280px',
            marginTop: '-280px',
            opacity: 0.04,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <div style={{ position: 'absolute', inset: '80px', backgroundColor: '#8c6518' }} />
          <div style={{ position: 'absolute', inset: '80px', backgroundColor: '#8c6518', transform: 'rotate(45deg)' }} />
        </div>

        {/* 4 Corner Ornaments */}
        <CornerTL />
        <CornerTR />
        <CornerBL />
        <CornerBR />

        {/* ── Main Content Area ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            padding: '24px 60px 26px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Metadata */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '10.5px',
              letterSpacing: '0.02em',
              color: '#083328',
              opacity: 0.85,
              marginBottom: '2px',
            }}
          >
            <span>{certNumber}</span>
            <span>Banyuwangi, {formattedDate}</span>
          </div>

          {/* Kop Surat with School Logo */}
          <header style={{ textAlign: 'center', margin: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <img
                src="/logo-smpn2glagah.png"
                alt="Logo SMPN 2 Glagah"
                style={{ width: '48px', height: '48px', objectFit: 'contain' }}
              />
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  margin: 0,
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '9.5px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#0b4a38',
                  opacity: 0.8,
                  fontWeight: 600,
                }}>
                  Pemerintah Kabupaten Banyuwangi · Dinas Pendidikan
                </p>
                <h2 style={{
                  margin: '1px 0 0',
                  fontFamily: "'Marcellus', serif",
                  fontSize: '21px',
                  letterSpacing: '0.06em',
                  color: '#083328',
                  fontWeight: 900,
                }}>
                  SMP NEGERI 2 GLAGAH
                </h2>
                <p style={{
                  margin: '1px 0 0',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '9px',
                  letterSpacing: '0.03em',
                  color: '#5c5343',
                }}>
                  Kecamatan Glagah, Kabupaten Banyuwangi, Jawa Timur · NPSN 20525649 · Web: smpn2glagah.sch.id
                </p>
              </div>
            </div>
          </header>

          {/* Ornate Divider with Bismillah */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              maxWidth: '560px',
              margin: '2px 0 1px',
            }}
          >
            <div style={{ flex: 1, height: '1.3px', background: 'linear-gradient(90deg, transparent, #b8862e, transparent)' }} />
            <span style={{ fontFamily: "'Amiri', serif", fontSize: '18px', color: '#8c6518', whiteSpace: 'nowrap' }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
            <div style={{ flex: 1, height: '1.3px', background: 'linear-gradient(90deg, transparent, #b8862e, transparent)' }} />
          </div>

          {/* Title Block */}
          <div style={{ textAlign: 'center', margin: '0' }}>
            <p style={{
              margin: 0,
              fontFamily: "'Poppins', sans-serif",
              fontSize: '10.5px',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: '#8c6518',
              fontWeight: 700,
            }}>
              SERTIFIKAT
            </p>
            <h1 style={{
              margin: '1px 0 2px',
              fontFamily: "'Marcellus', serif",
              fontSize: '24px',
              letterSpacing: '0.02em',
              color: isPassed ? '#083328' : '#7c2432',
              lineHeight: 1.15,
              fontWeight: 900,
            }}>
              {isPassed ? 'Kemampuan Membaca Al-Qur\'an' : 'Hasil Evaluasi Tilawah Al-Qur\'an'}
            </h1>
            <p style={{
              margin: '0 0 2px',
              fontFamily: "'Amiri', serif",
              fontSize: '13px',
              color: '#0b4a38',
            }}>
              وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
              <span style={{
                display: 'block',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: '10.5px',
                color: '#6b6355',
                letterSpacing: '0.02em',
              }}>
                "...dan bacalah Al-Qur'an itu dengan tartil." — QS. Al-Muzzammil: 4
              </span>
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '13px', fontStyle: 'italic', color: '#5c5343' }}>
              Diberikan dengan penuh apresiasi kepada:
            </p>
          </div>

          {/* Recipient Section */}
          <div style={{ textAlign: 'center', margin: '0' }}>
            <h2 style={{
              margin: 0,
              fontFamily: "'Marcellus', serif",
              fontSize: '27px',
              letterSpacing: '0.05em',
              color: '#083328',
              position: 'relative',
              display: 'inline-block',
              paddingBottom: '4px',
              borderBottom: '1.5px solid #b8862e',
              textTransform: 'uppercase',
              fontWeight: 900,
            }}>
              {result.murid?.nama || result.nama_murid || '-'}
            </h2>
            <p style={{
              margin: '4px 0 0',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '11.5px',
              letterSpacing: '0.04em',
              color: '#0b4a38',
              fontWeight: 600,
            }}>
              Kelas <b style={{ color: '#083328' }}>{result.murid?.kelas || result.kelas_murid || '-'}</b> &middot; NISN <b style={{ color: '#083328' }}>{result.murid?.nisn || result.nisn_murid || '-'}</b>
            </p>
          </div>

          {/* Materi Ujian */}
          <p style={{ textAlign: 'center', margin: '0', fontSize: '12.5px', color: '#5c5343' }}>
            Atas kemampuannya membaca dengan baik dan benar surat serta ayat:
            <strong style={{
              display: 'block',
              marginTop: '2px',
              fontFamily: "'Marcellus', serif",
              fontSize: '15px',
              color: '#083328',
              letterSpacing: '0.02em',
            }}>
              📖 {cleanAyat ? `QS. ${cleanAyat}` : 'Al-Qur\'an'}
            </strong>
          </p>

          {/* Scores Grid & 8-Point Star Medal */}
          <div
            style={{
              width: '100%',
              maxWidth: '850px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              alignItems: 'center',
              gap: '20px',
              margin: '0',
            }}
          >
            {/* Makharijul Huruf */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{
                margin: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '10px',
                letterSpacing: '0.02em',
                color: '#083328',
                fontWeight: 700,
              }}>
                Makharijul Huruf
                <span style={{ fontSize: '9px', color: '#8c6518', backgroundColor: '#e8cd8a', borderRadius: '999px', padding: '1px 6px', fontWeight: 700 }}>
                  35%
                </span>
              </p>
              <div style={{ height: '7px', backgroundColor: '#efdfb8', border: '0.8px solid #b8862e', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, skorMakhraj))}%`, background: 'linear-gradient(90deg, #3e9e76, #0b4a38)', borderRadius: '999px' }} />
              </div>
              <p style={{ margin: 0, textAlign: 'right', fontFamily: "'Marcellus', serif", fontSize: '15px', color: '#083328', fontWeight: 900 }}>
                {skorMakhraj} <small style={{ fontFamily: "'Poppins', sans-serif", fontSize: '9px', color: '#8a8172' }}>/ 100</small>
              </p>
            </div>

            {/* Kaidah Tajwid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{
                margin: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '10px',
                letterSpacing: '0.02em',
                color: '#083328',
                fontWeight: 700,
              }}>
                Kaidah Tajwid
                <span style={{ fontSize: '9px', color: '#8c6518', backgroundColor: '#e8cd8a', borderRadius: '999px', padding: '1px 6px', fontWeight: 700 }}>
                  40%
                </span>
              </p>
              <div style={{ height: '7px', backgroundColor: '#efdfb8', border: '0.8px solid #b8862e', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, skorTajwid))}%`, background: 'linear-gradient(90deg, #3e9e76, #0b4a38)', borderRadius: '999px' }} />
              </div>
              <p style={{ margin: 0, textAlign: 'right', fontFamily: "'Marcellus', serif", fontSize: '15px', color: '#083328', fontWeight: 900 }}>
                {skorTajwid} <small style={{ fontFamily: "'Poppins', sans-serif", fontSize: '9px', color: '#8a8172' }}>/ 100</small>
              </p>
            </div>

            {/* Kelancaran & Adab */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{
                margin: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '10px',
                letterSpacing: '0.02em',
                color: '#083328',
                fontWeight: 700,
              }}>
                Kelancaran &amp; Adab
                <span style={{ fontSize: '9px', color: '#8c6518', backgroundColor: '#e8cd8a', borderRadius: '999px', padding: '1px 6px', fontWeight: 700 }}>
                  25%
                </span>
              </p>
              <div style={{ height: '7px', backgroundColor: '#efdfb8', border: '0.8px solid #b8862e', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, skorKelancaran))}%`, background: 'linear-gradient(90deg, #3e9e76, #0b4a38)', borderRadius: '999px' }} />
              </div>
              <p style={{ margin: 0, textAlign: 'right', fontFamily: "'Marcellus', serif", fontSize: '15px', color: '#083328', fontWeight: 900 }}>
                {skorKelancaran} <small style={{ fontFamily: "'Poppins', sans-serif", fontSize: '9px', color: '#8a8172' }}>/ 100</small>
              </p>
            </div>

            {/* 8-Point Star Medal */}
            <div style={{ position: 'relative', width: '100px', height: '100px', justifySelf: 'center' }}>
              {/* Star Layer 1 */}
              <div style={{
                position: 'absolute', inset: '16px',
                background: `linear-gradient(135deg, ${predikat.accentA}, ${predikat.accentB})`,
                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
              }} />
              {/* Star Layer 2 (Rotated 45deg) */}
              <div style={{
                position: 'absolute', inset: '16px',
                background: `linear-gradient(135deg, ${predikat.accentA}, ${predikat.accentB})`,
                transform: 'rotate(45deg)',
                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
              }} />
              {/* Center Disc */}
              <div style={{
                position: 'absolute', inset: '24px',
                borderRadius: '50%',
                backgroundColor: '#fbf3e0',
                border: '1.5px solid #b8862e',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: 'inset 0 0 0 1px #0b4a38',
                zIndex: 2,
              }}>
                <p style={{ margin: 0, fontFamily: "'Marcellus', serif", fontSize: '16px', color: '#083328', lineHeight: 1, fontWeight: 900 }}>
                  {totalScore}
                </p>
                <p style={{ margin: '1px 0 0', fontFamily: "'Poppins', sans-serif", fontSize: '7px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a8172', fontWeight: 700 }}>
                  SKOR AKHIR
                </p>
                <p style={{ margin: '1px 0 0', fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '7.5px', textTransform: 'uppercase', color: predikat.accentB, padding: '0 4px', lineHeight: 1.1 }}>
                  {predikat.label}
                </p>
              </div>
            </div>
          </div>

          {/* Catatan Evaluasi */}
          <p style={{
            maxWidth: '750px',
            textAlign: 'center',
            fontStyle: 'italic',
            fontSize: '12.5px',
            color: '#4b4335',
            lineHeight: 1.4,
            margin: '0',
          }}>
            <span style={{ fontFamily: "'Marcellus', serif", fontSize: '18px', color: '#b8862e', fontStyle: 'normal', verticalAlign: '-2px', marginRight: '4px' }}>&ldquo;</span>
            {notesText}
            <span style={{ fontFamily: "'Marcellus', serif", fontSize: '18px', color: '#b8862e', fontStyle: 'normal', verticalAlign: '-2px', marginLeft: '4px' }}>&rdquo;</span>
          </p>

          {/* Signatures Section (Clean, Elevated, No Stamp) */}
          <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', margin: '0' }}>
            {/* Left: Kepala Sekolah */}
            <div style={{ width: '45%', textAlign: 'center' }}>
              <p style={{ margin: '0 0 24px', fontFamily: "'Poppins', sans-serif", fontSize: '11px', color: '#083328', lineHeight: 1.4, fontWeight: 600 }}>
                Mengetahui,<br />Kepala SMP Negeri 2 Glagah
              </p>
              <p style={{
                margin: 0,
                fontFamily: "'Marcellus', serif",
                fontSize: '14.5px',
                letterSpacing: '0.02em',
                color: '#083328',
                borderTop: '1.2px solid #083328',
                display: 'inline-block',
                paddingTop: '3px',
                fontWeight: 900,
              }}>
                SRIATUN, S.Pd.
              </p>
              <p style={{ margin: '2px 0 0', fontFamily: "'Poppins', sans-serif", fontSize: '10px', color: '#5c5343', fontWeight: 600 }}>
                NIP. 197006061999032006
              </p>
            </div>

            {/* Right: Guru Penguji / PAI */}
            <div style={{ width: '45%', textAlign: 'center' }}>
              <p style={{ margin: '0 0 24px', fontFamily: "'Poppins', sans-serif", fontSize: '11px', color: '#083328', lineHeight: 1.4, fontWeight: 600 }}>
                Guru Penguji<br />Pendidikan Agama Islam
              </p>
              <p style={{
                margin: 0,
                fontFamily: "'Marcellus', serif",
                fontSize: '14.5px',
                letterSpacing: '0.02em',
                color: '#083328',
                borderTop: '1.2px solid #083328',
                display: 'inline-block',
                paddingTop: '3px',
                fontWeight: 900,
              }}>
                {result.guru_penguji || 'Guru PAI'}
              </p>
              <p style={{ margin: '2px 0 0', fontFamily: "'Poppins', sans-serif", fontSize: '10px', color: '#5c5343', fontWeight: 600 }}>
                Guru Penguji Baca Al-Qur'an
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
