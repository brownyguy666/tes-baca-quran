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

function getActiveLevelKey(totalScore, levelLabel) {
  const score = Number(totalScore) || 0
  if (score < 50 || (levelLabel && levelLabel.toLowerCase().includes('remidi'))) {
    return 'remidi'
  }
  if (score >= 91 || (levelLabel && levelLabel.toLowerCase().includes('mumtaz'))) {
    return 'mumtaz'
  }
  if (score >= 76 || (levelLabel && levelLabel.toLowerCase().includes('mahir'))) {
    return 'mahir'
  }
  if (score >= 61 || (levelLabel && levelLabel.toLowerCase().includes('menengah'))) {
    return 'menengah'
  }
  return 'dasar'
}

function parseNotes(catatanStr, isPassed) {
  if (!catatanStr || !catatanStr.trim()) {
    if (!isPassed) {
      return 'Nilai belum mencapai batas ketuntasan minimum (skor < 50). Wajib mengikuti bimbingan remidial bersama Guru PAI.'
    }
    return 'Makhraj huruf dan kaidah tajwid telah diuji sesuai standar rubrik tilawah. Pertahankan kelancaran dan kecintaan membaca Al-Qur\'an secara istiqomah.'
  }
  return catatanStr.replace(/[;\n|]+/g, ' · ').trim()
}

// ── 4 Dedicated Corner Flourish SVGs (Ultra Sharp Vector Render) ──────────────

const CornerTopLeft = () => (
  <svg width="76" height="76" viewBox="0 0 76 76" fill="none" style={{ position: 'absolute', top: '14px', left: '14px' }}>
    <path d="M0 0 L76 0 L76 6 L6 6 L6 76 L0 76 Z" fill="#c9a227" />
    <path d="M10 10 L66 10 L66 13 L13 13 L13 66 L10 66 Z" fill="#14532d" />
    <circle cx="26" cy="26" r="8" stroke="#c9a227" strokeWidth="1.8" fill="none" />
    <circle cx="26" cy="26" r="4" fill="#c9a227" />
    <path d="M17 26 L35 26 M26 17 L26 35" stroke="#c9a227" strokeWidth="1.2" />
  </svg>
)

const CornerTopRight = () => (
  <svg width="76" height="76" viewBox="0 0 76 76" fill="none" style={{ position: 'absolute', top: '14px', right: '14px' }}>
    <path d="M76 0 L0 0 L0 6 L70 6 L70 76 L76 76 Z" fill="#c9a227" />
    <path d="M66 10 L10 10 L10 13 L63 13 L63 66 L66 66 Z" fill="#14532d" />
    <circle cx="50" cy="26" r="8" stroke="#c9a227" strokeWidth="1.8" fill="none" />
    <circle cx="50" cy="26" r="4" fill="#c9a227" />
    <path d="M41 26 L59 26 M50 17 L50 35" stroke="#c9a227" strokeWidth="1.2" />
  </svg>
)

const CornerBottomLeft = () => (
  <svg width="76" height="76" viewBox="0 0 76 76" fill="none" style={{ position: 'absolute', bottom: '14px', left: '14px' }}>
    <path d="M0 76 L76 76 L76 70 L6 70 L6 0 L0 0 Z" fill="#c9a227" />
    <path d="M10 66 L66 66 L66 63 L13 63 L13 10 L10 10 Z" fill="#14532d" />
    <circle cx="26" cy="50" r="8" stroke="#c9a227" strokeWidth="1.8" fill="none" />
    <circle cx="26" cy="50" r="4" fill="#c9a227" />
    <path d="M17 50 L35 50 M26 41 L26 59" stroke="#c9a227" strokeWidth="1.2" />
  </svg>
)

const CornerBottomRight = () => (
  <svg width="76" height="76" viewBox="0 0 76 76" fill="none" style={{ position: 'absolute', bottom: '14px', right: '14px' }}>
    <path d="M76 76 L0 76 L0 70 L70 70 L70 0 L76 0 Z" fill="#c9a227" />
    <path d="M66 66 L10 66 L10 63 L63 63 L63 10 L66 10 Z" fill="#14532d" />
    <circle cx="50" cy="50" r="8" stroke="#c9a227" strokeWidth="1.8" fill="none" />
    <circle cx="50" cy="50" r="4" fill="#c9a227" />
    <path d="M41 50 L59 50 M50 41 L50 59" stroke="#c9a227" strokeWidth="1.2" />
  </svg>
)

/**
 * CertificateTemplate (100% Dynamic Precision Vector & CSS Layout)
 *
 * All tables, labels, underlines, checkboxes, and seals are generated directly
 * via rock-solid HTML/CSS to guarantee 100% alignment without any misalignment.
 */
export default function CertificateTemplate({ result, id = 'certificate-template' }) {
  if (!result) return null

  const totalScore = Number(result.skor_total) || 0
  const isPassed = totalScore >= 50
  const activeLevel = getActiveLevelKey(totalScore, result.level)
  const notesText = parseNotes(result.catatan, isPassed)

  // Generate formal certificate number
  const testDate = result.tanggal_tes ? new Date(result.tanggal_tes) : new Date()
  const yearStr = testDate.getFullYear()
  const romanMonth = getRomanMonth(testDate.getMonth())
  const rawId = result.id ? String(result.id) : ''
  const numericSeed = rawId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const paddedNo = String((numericSeed % 900) + 100).padStart(3, '0')
  const certNumber = `421.3 / BQ-${paddedNo} / SMPN2GLG / ${romanMonth} / ${yearStr}`
  const formattedDate = formatDate(result.tanggal_tes)

  // Clean ayat dibaca string
  const cleanAyat = (result.ayat_dibaca || '').replace(/^📖\s*/, '')

  return (
    <div
      id={id}
      style={{
        position: 'fixed',
        left: '0px',
        top: '0px',
        visibility: 'hidden',
        width: '1122px',   // A4 landscape @ 96dpi
        height: '794px',
        backgroundColor: '#fffef9',
        fontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif",
        boxSizing: 'border-box',
        overflow: 'hidden',
        zIndex: -9999,
        pointerEvents: 'none',
        color: '#0f172a',
      }}
    >
      {/* ── Outer Decorative Multi-Border Frame ── */}
      <div style={{ position: 'absolute', inset: '10px', border: '4.5px solid #14532d', borderRadius: '10px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: '16px', border: '1.5px solid #c9a227', borderRadius: '6px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: '22px', border: '0.75px dashed rgba(201,162,39,0.5)', borderRadius: '4px', pointerEvents: 'none' }} />

      {/* ── 4 Crisp Corner Flourishes ── */}
      <CornerTopLeft />
      <CornerTopRight />
      <CornerBottomLeft />
      <CornerBottomRight />

      {/* ── Subtle Geometric Background Watermark ── */}
      <div
        style={{
          position: 'absolute',
          inset: '30px',
          opacity: 0.03,
          backgroundImage: "radial-gradient(#14532d 1px, transparent 1px)",
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Center Large Watermark Logo ── */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          marginLeft: '-150px',
          marginTop: '-150px',
          width: '300px',
          height: '300px',
          opacity: 0.035,
          pointerEvents: 'none',
        }}
      >
        <img
          src="/logo-smpn2glagah.png"
          alt="Watermark"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* ── Inner Content Container (Full Precision Flexbox) ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '24px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* ══════════════════════════════════════════════════════════
            HEADER SECTION: Kop Surat & Pill Badges
            ══════════════════════════════════════════════════════════ */}
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px' }}>
            <tbody>
              <tr>
                {/* Top Left: Nomor Sertifikat Box */}
                <td style={{ width: '230px', verticalAlign: 'top', padding: 0 }}>
                  <p style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', margin: '0 0 2px 0' }}>
                    Nomor Sertifikat:
                  </p>
                  <div
                    style={{
                      border: '1.5px solid #c9a227',
                      borderRadius: '8px',
                      backgroundColor: '#fffdf5',
                      padding: '4px 8px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#14532d',
                      fontFamily: 'monospace',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    {certNumber}
                  </div>
                </td>

                {/* Center: Logo & Official Letterhead */}
                <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <img
                      src="/logo-smpn2glagah.png"
                      alt="Logo SMPN 2 Glagah"
                      style={{ width: '56px', height: '56px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                    />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', color: '#475569', margin: 0, textTransform: 'uppercase' }}>
                        Pemerintah Kabupaten Banyuwangi · Dinas Pendidikan
                      </p>
                      <h1 style={{
                        fontSize: '21px',
                        fontWeight: 900,
                        color: '#14532d',
                        margin: '1px 0',
                        fontFamily: "'Playfair Display', Georgia, serif",
                        letterSpacing: '0.04em',
                      }}>
                        SMP NEGERI 2 GLAGAH
                      </h1>
                      <p style={{ fontSize: '9px', color: '#64748b', margin: 0, fontWeight: 500 }}>
                        Jl. Raya Glagah, Kec. Glagah, Kab. Banyuwangi, Jawa Timur · Kode Pos 68432 · Web: smpn2glagah.sch.id
                      </p>
                    </div>
                  </div>
                </td>

                {/* Top Right: Tanggal Terbit Box */}
                <td style={{ width: '230px', verticalAlign: 'top', padding: 0, textAlign: 'right' }}>
                  <p style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', margin: '0 0 2px 0' }}>
                    Tanggal Terbit:
                  </p>
                  <div
                    style={{
                      border: '1.5px solid #c9a227',
                      borderRadius: '8px',
                      backgroundColor: '#fffdf5',
                      padding: '4px 8px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#14532d',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    {formattedDate}
                  </div>
                  <p style={{ fontSize: '9px', color: '#64748b', margin: '3px 0 0 0', fontWeight: 600 }}>
                    Banyuwangi, {formattedDate}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Gold Header Divider Line */}
          <div style={{ width: '100%', height: '1.5px', background: 'linear-gradient(to right, transparent, #c9a227 20%, #c9a227 80%, transparent)', margin: '2px 0 1px 0' }} />
        </div>

        {/* ══════════════════════════════════════════════════════════
            TITLE & BANNER SECTION
            ══════════════════════════════════════════════════════════ */}
        <div style={{ textAlign: 'center', margin: '0' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 900,
            color: isPassed ? '#14532d' : '#991b1b',
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: '0.12em',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            {isPassed ? 'SERTIFIKAT KELULUSAN' : 'HASIL EVALUASI TILAWAH AL-QUR\'AN'}
          </h2>

          {/* Emerald & Gold Ribbon Banner */}
          <div style={{
            display: 'inline-block',
            backgroundColor: isPassed ? '#14532d' : '#991b1b',
            border: '1.5px solid #c9a227',
            borderRadius: '20px',
            padding: '3px 32px',
            margin: '2px 0 2px 0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 900,
              color: '#fef08a',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              TES KEMAMPUAN BACA AL QURAN
            </span>
          </div>

          <p style={{ fontSize: '10px', color: '#475569', margin: '1px 0 0 0', fontStyle: 'italic' }}>
            Diberikan kepada:
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            IDENTITAS SISWA & MATERI UJIAN
            ══════════════════════════════════════════════════════════ */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #c9a227',
            borderRadius: '10px',
            padding: '8px 16px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            position: 'relative',
          }}
        >
          {/* Badge Label: Identitas Siswa */}
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#14532d',
              border: '1px solid #c9a227',
              borderRadius: '12px',
              padding: '1px 16px',
              fontSize: '9px',
              fontWeight: 800,
              color: '#fef3c7',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            IDENTITAS SISWA &amp; MATERI UJIAN
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '2px' }}>
            <tbody>
              {/* Row 1: Nama Lengkap Siswa */}
              <tr>
                <td style={{ width: '150px', fontSize: '11px', fontWeight: 700, color: '#334155', padding: '3px 0' }}>
                  Nama Lengkap Siswa
                </td>
                <td style={{ width: '15px', fontSize: '11px', fontWeight: 700, color: '#334155', padding: '3px 0' }}>:</td>
                <td colSpan={4} style={{ padding: '3px 0', borderBottom: '1px solid #cbd5e1' }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 900,
                    color: '#14532d',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}>
                    {result.murid?.nama || result.nama_murid || '-'}
                  </span>
                </td>
              </tr>

              {/* Row 2: Kelas & NISN */}
              <tr>
                <td style={{ fontSize: '11px', fontWeight: 700, color: '#334155', padding: '4px 0 2px 0' }}>
                  Kelas
                </td>
                <td style={{ fontSize: '11px', fontWeight: 700, color: '#334155', padding: '4px 0 2px 0' }}>:</td>
                <td style={{ width: '220px', padding: '4px 0 2px 0', borderBottom: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    {result.murid?.kelas || result.kelas_murid || '-'}
                  </span>
                </td>
                <td style={{ width: '80px', fontSize: '11px', fontWeight: 700, color: '#334155', textAlign: 'right', padding: '4px 10px 2px 0' }}>
                  NISN :
                </td>
                <td colSpan={2} style={{ padding: '4px 0 2px 0', borderBottom: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                    {result.murid?.nisn || result.nisn_murid || '-'}
                  </span>
                </td>
              </tr>

              {/* Row 3: Surat & Ayat yang Diuji */}
              <tr>
                <td style={{ fontSize: '11px', fontWeight: 700, color: '#334155', padding: '4px 0 2px 0' }}>
                  Surat &amp; Ayat yang Diuji
                </td>
                <td style={{ fontSize: '11px', fontWeight: 700, color: '#334155', padding: '4px 0 2px 0' }}>:</td>
                <td colSpan={4} style={{ padding: '4px 0 2px 0', borderBottom: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#14532d', fontStyle: 'italic' }}>
                    📖 {cleanAyat ? `QS. ${cleanAyat}` : 'Al-Qur\'an'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ══════════════════════════════════════════════════════════
            EVALUATION BREAKDOWN: RINCIAN SKOR (LEFT) & PREDIKAT (RIGHT)
            ══════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'stretch' }}>

          {/* LEFT TABLE: Rincian Skor & Capaian */}
          <div
            style={{
              flex: 1.1,
              backgroundColor: '#ffffff',
              border: '1.5px solid #14532d',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
            }}
          >
            {/* Table Header */}
            <div style={{ backgroundColor: '#14532d', color: '#fef3c7', padding: '4px 8px', textAlign: 'center', fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              RINCIAN SKOR &amp; CAPAIAN
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', padding: '4px 8px', textAlign: 'left' }}>ASPEK PENILAIAN</th>
                  <th style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', padding: '4px 8px', textAlign: 'center', width: '60px' }}>BOBOT</th>
                  <th style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', padding: '4px 8px', textAlign: 'center', width: '90px' }}>SKOR (0–100)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ fontSize: '10.5px', fontWeight: 600, color: '#334155', padding: '4px 8px' }}>Makharijul Huruf</td>
                  <td style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', padding: '4px 8px', textAlign: 'center' }}>35%</td>
                  <td style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a', padding: '4px 8px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {result.skor_makhraj ?? '-'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ fontSize: '10.5px', fontWeight: 600, color: '#334155', padding: '4px 8px' }}>Kaidah Tajwid</td>
                  <td style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', padding: '4px 8px', textAlign: 'center' }}>40%</td>
                  <td style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a', padding: '4px 8px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {result.skor_tajwid ?? '-'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ fontSize: '10.5px', fontWeight: 600, color: '#334155', padding: '4px 8px' }}>Kelancaran &amp; Adab</td>
                  <td style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', padding: '4px 8px', textAlign: 'center' }}>25%</td>
                  <td style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a', padding: '4px 8px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {result.skor_kelancaran ?? '-'}
                  </td>
                </tr>
                {/* Total Row */}
                <tr style={{ backgroundColor: isPassed ? '#f0fdf4' : '#fef2f2' }}>
                  <td style={{ fontSize: '11px', fontWeight: 900, color: isPassed ? '#14532d' : '#991b1b', padding: '5px 8px' }}>TOTAL SKOR AKHIR</td>
                  <td style={{ fontSize: '10.5px', fontWeight: 900, color: isPassed ? '#14532d' : '#991b1b', padding: '5px 8px', textAlign: 'center' }}>100%</td>
                  <td style={{ fontSize: '14px', fontWeight: 900, color: isPassed ? '#14532d' : '#991b1b', padding: '5px 8px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {totalScore}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* RIGHT TABLE: Predikat / Level Capaian Checkboxes */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              border: '1.5px solid #14532d',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Table Header */}
            <div style={{ backgroundColor: '#14532d', color: '#fef3c7', padding: '4px 8px', textAlign: 'center', fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              PREDIKAT / LEVEL CAPAIAN
            </div>

            <div style={{ padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, justifyContent: 'space-around' }}>
              {/* Row 1: Mumtaz */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '3px',
                    border: activeLevel === 'mumtaz' ? '1.5px solid #d97706' : '1.5px solid #94a3b8',
                    backgroundColor: activeLevel === 'mumtaz' ? '#d97706' : '#ffffff',
                    color: '#ffffff', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {activeLevel === 'mumtaz' ? '✓' : ''}
                  </div>
                  <span style={{ fontWeight: activeLevel === 'mumtaz' ? 800 : 500, color: activeLevel === 'mumtaz' ? '#d97706' : '#334155' }}>
                    Mumtaz (Tartil)
                  </span>
                </div>
                <span style={{ color: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>(91 – 100)</span>
              </div>

              {/* Row 2: Mahir */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '3px',
                    border: activeLevel === 'mahir' ? '1.5px solid #16a34a' : '1.5px solid #94a3b8',
                    backgroundColor: activeLevel === 'mahir' ? '#16a34a' : '#ffffff',
                    color: '#ffffff', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {activeLevel === 'mahir' ? '✓' : ''}
                  </div>
                  <span style={{ fontWeight: activeLevel === 'mahir' ? 800 : 500, color: activeLevel === 'mahir' ? '#16a34a' : '#334155' }}>
                    Mahir
                  </span>
                </div>
                <span style={{ color: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>(76 – 90)</span>
              </div>

              {/* Row 3: Menengah */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '3px',
                    border: activeLevel === 'menengah' ? '1.5px solid #ea580c' : '1.5px solid #94a3b8',
                    backgroundColor: activeLevel === 'menengah' ? '#ea580c' : '#ffffff',
                    color: '#ffffff', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {activeLevel === 'menengah' ? '✓' : ''}
                  </div>
                  <span style={{ fontWeight: activeLevel === 'menengah' ? 800 : 500, color: activeLevel === 'menengah' ? '#ea580c' : '#334155' }}>
                    Menengah
                  </span>
                </div>
                <span style={{ color: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>(61 – 75)</span>
              </div>

              {/* Row 4: Dasar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '3px',
                    border: activeLevel === 'dasar' ? '1.5px solid #2563eb' : '1.5px solid #94a3b8',
                    backgroundColor: activeLevel === 'dasar' ? '#2563eb' : '#ffffff',
                    color: '#ffffff', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {activeLevel === 'dasar' ? '✓' : ''}
                  </div>
                  <span style={{ fontWeight: activeLevel === 'dasar' ? 800 : 500, color: activeLevel === 'dasar' ? '#2563eb' : '#334155' }}>
                    Dasar (Cukup)
                  </span>
                </div>
                <span style={{ color: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>(50 – 60)</span>
              </div>

              {/* Row 5: Remidi */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '3px',
                    border: activeLevel === 'remidi' ? '1.5px solid #dc2626' : '1.5px solid #94a3b8',
                    backgroundColor: activeLevel === 'remidi' ? '#dc2626' : '#ffffff',
                    color: '#ffffff', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {activeLevel === 'remidi' ? '✓' : ''}
                  </div>
                  <span style={{ fontWeight: activeLevel === 'remidi' ? 800 : 500, color: activeLevel === 'remidi' ? '#dc2626' : '#334155' }}>
                    Remidi (Wajib Mengulang)
                  </span>
                </div>
                <span style={{ color: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>(&lt; 50)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            CATATAN BIMBINGAN / EVALUASI GURU
            ══════════════════════════════════════════════════════════ */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #c9a227',
            borderRadius: '8px',
            padding: '6px 14px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-9px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#14532d',
              border: '1px solid #c9a227',
              borderRadius: '10px',
              padding: '1px 14px',
              fontSize: '8.5px',
              fontWeight: 800,
              color: '#fef3c7',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            CATATAN BIMBINGAN / EVALUASI GURU
          </div>

          <p style={{
            fontSize: '10.5px',
            fontStyle: 'italic',
            fontWeight: 600,
            color: isPassed ? '#1e293b' : '#991b1b',
            lineHeight: 1.35,
            margin: '2px 0 0 0',
          }}>
            {notesText}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            SIGNATURES SECTION (NO STAMP)
            ══════════════════════════════════════════════════════════ */}
        <table style={{ width: '100%', borderCollapse: 'collapse', padding: '0 10px' }}>
          <tbody>
            <tr>
              {/* Left: Kepala Sekolah */}
              <td style={{ width: '35%', textAlign: 'center', verticalAlign: 'bottom' }}>
                <p style={{ fontSize: '10px', color: '#475569', margin: 0 }}>Mengetahui,</p>
                <p style={{ fontSize: '11px', fontWeight: 800, color: '#14532d', margin: '1px 0 36px 0' }}>
                  Kepala SMP Negeri 2 Glagah
                </p>
                <p style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: 0, textDecoration: 'underline' }}>
                  SRIATUN, S.Pd.
                </p>
                <p style={{ fontSize: '9.5px', color: '#64748b', margin: '1px 0 0 0', fontWeight: 600 }}>
                  NIP. 197006061999032006
                </p>
              </td>

              {/* Center: Medallion Seal */}
              <td style={{ width: '30%', textAlign: 'center', verticalAlign: 'middle' }}>
                <div
                  style={{
                    display: 'inline-block',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#d4af37',
                    border: '2px solid #78350f',
                    padding: '5px',
                    boxSizing: 'border-box',
                  }}
                >
                  <img
                    src="/logo-smpn2glagah.png"
                    alt="Seal"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <p style={{ fontSize: '7.5px', fontWeight: 800, color: '#78350f', letterSpacing: '0.08em', margin: '2px 0 0 0', textTransform: 'uppercase' }}>
                  SMPN 2 GLAGAH
                </p>
              </td>

              {/* Right: Guru Penguji / PAI */}
              <td style={{ width: '35%', textAlign: 'center', verticalAlign: 'bottom' }}>
                <p style={{ fontSize: '10px', color: '#475569', margin: 0 }}>
                  Banyuwangi, {formattedDate}
                </p>
                <p style={{ fontSize: '11px', fontWeight: 800, color: '#14532d', margin: '1px 0 36px 0' }}>
                  Guru Penguji / PAI
                </p>
                <p style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: 0, textDecoration: 'underline' }}>
                  {result.guru_penguji || 'Guru PAI'}
                </p>
                <p style={{ fontSize: '9.5px', color: '#64748b', margin: '1px 0 0 0', fontWeight: 600 }}>
                  Guru Pendidikan Agama Islam
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
