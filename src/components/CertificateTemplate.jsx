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

function getLevelBadgeInfo(totalScore, levelLabel) {
  const score = Number(totalScore) || 0
  if (score < 50 || (levelLabel && levelLabel.toLowerCase().includes('remidi'))) {
    return {
      bgColor: '#fef2f2',
      textColor: '#991b1b',
      borderColor: '#ef4444',
      badgeBg: '#dc2626',
      badgeText: '#ffffff',
      label: 'REMIDI (WAJIB MENGULANG)',
      emoji: '⚠️',
      sub: 'Perlu Bimbingan & Remidial Khusus',
      isPassed: false,
    }
  }

  const map = {
    'Mumtaz (Tartil)': {
      bgColor: '#fffbeb',
      textColor: '#92400e',
      borderColor: '#d97706',
      badgeBg: '#78350f',
      badgeText: '#fef3c7',
      label: 'MUMTAZ (TARTIL)',
      emoji: '🌟',
      sub: 'Istimewa & Sangat Fasih',
      isPassed: true,
    },
    'Mahir': {
      bgColor: '#f0fdf4',
      textColor: '#166534',
      borderColor: '#16a34a',
      badgeBg: '#14532d',
      badgeText: '#bbf7d0',
      label: 'MAHIR',
      emoji: '✅',
      sub: 'Lancar & Memenuhi Tajwid',
      isPassed: true,
    },
    'Menengah': {
      bgColor: '#fff7ed',
      textColor: '#9a3412',
      borderColor: '#ea580c',
      badgeBg: '#7c2d12',
      badgeText: '#ffedd5',
      label: 'MENENGAH',
      emoji: '📈',
      sub: 'Cukup Baik & Perlu Latihan',
      isPassed: true,
    },
    'Dasar (Cukup)': {
      bgColor: '#eff6ff',
      textColor: '#1e40af',
      borderColor: '#3b82f6',
      badgeBg: '#1e3a8a',
      badgeText: '#dbeafe',
      label: 'DASAR (CUKUP)',
      emoji: '📚',
      sub: 'Batas Minimum Kelulusan',
      isPassed: true,
    },
    'Dasar': {
      bgColor: '#eff6ff',
      textColor: '#1e40af',
      borderColor: '#3b82f6',
      badgeBg: '#1e3a8a',
      badgeText: '#dbeafe',
      label: 'DASAR (CUKUP)',
      emoji: '📚',
      sub: 'Batas Minimum Kelulusan',
      isPassed: true,
    },
  }

  return map[levelLabel] || {
    bgColor: '#f8fafc',
    textColor: '#334155',
    borderColor: '#64748b',
    badgeBg: '#334155',
    badgeText: '#f8fafc',
    label: levelLabel || 'EVALUASI',
    emoji: '📝',
    sub: 'Telah Diuji',
    isPassed: score >= 50,
  }
}

function parseNotes(catatanStr, isPassed) {
  if (!catatanStr || !catatanStr.trim()) {
    if (!isPassed) {
      return [
        'Nilai belum mencapai batas ketuntasan minimum (skor < 50).',
        'Wajib mengikuti program bimbingan makhraj & tajwid bersama Guru PAI 📖',
      ]
    }
    return [
      'Makhraj huruf dan hukum tajwid telah diuji sesuai standar rubrik.',
      'Tingkatkan kebiasaan membaca Al-Qur\'an secara istiqomah setiap hari 🌟',
    ]
  }

  const rawList = catatanStr
    .split(/[;\n|]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (rawList.length === 0) return [catatanStr.trim()]
  return rawList.slice(0, 3)
}

// ── 4 Dedicated Corner Flourish SVGs (No CSS Rotate to guarantee html2canvas render) ───

const CornerTopLeft = () => (
  <svg width="70" height="70" viewBox="0 0 70 70" fill="none" style={{ position: 'absolute', top: '16px', left: '16px' }}>
    <path d="M0 0 L70 0 L70 5 L5 5 L5 70 L0 70 Z" fill="#c9a227" />
    <path d="M9 9 L60 9 L60 12 L12 12 L12 60 L9 60 Z" fill="#14532d" />
    <circle cx="22" cy="22" r="7" stroke="#c9a227" strokeWidth="1.5" fill="none" />
    <circle cx="22" cy="22" r="3.5" fill="#c9a227" />
    <path d="M15 22 L29 22 M22 15 L22 29" stroke="#c9a227" strokeWidth="1" />
  </svg>
)

const CornerTopRight = () => (
  <svg width="70" height="70" viewBox="0 0 70 70" fill="none" style={{ position: 'absolute', top: '16px', right: '16px' }}>
    <path d="M70 0 L0 0 L0 5 L65 5 L65 70 L70 70 Z" fill="#c9a227" />
    <path d="M61 9 L10 9 L10 12 L58 12 L58 60 L61 60 Z" fill="#14532d" />
    <circle cx="48" cy="22" r="7" stroke="#c9a227" strokeWidth="1.5" fill="none" />
    <circle cx="48" cy="22" r="3.5" fill="#c9a227" />
    <path d="M41 22 L55 22 M48 15 L48 29" stroke="#c9a227" strokeWidth="1" />
  </svg>
)

const CornerBottomLeft = () => (
  <svg width="70" height="70" viewBox="0 0 70 70" fill="none" style={{ position: 'absolute', bottom: '16px', left: '16px' }}>
    <path d="M0 70 L70 70 L70 65 L5 65 L5 0 L0 0 Z" fill="#c9a227" />
    <path d="M9 61 L60 61 L60 58 L12 58 L12 10 L9 10 Z" fill="#14532d" />
    <circle cx="22" cy="48" r="7" stroke="#c9a227" strokeWidth="1.5" fill="none" />
    <circle cx="22" cy="48" r="3.5" fill="#c9a227" />
    <path d="M15 48 L29 48 M22 41 L22 55" stroke="#c9a227" strokeWidth="1" />
  </svg>
)

const CornerBottomRight = () => (
  <svg width="70" height="70" viewBox="0 0 70 70" fill="none" style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
    <path d="M70 70 L0 70 L0 65 L65 65 L65 0 L70 0 Z" fill="#c9a227" />
    <path d="M61 61 L10 61 L10 58 L58 58 L58 10 L61 10 Z" fill="#14532d" />
    <circle cx="48" cy="48" r="7" stroke="#c9a227" strokeWidth="1.5" fill="none" />
    <circle cx="48" cy="48" r="3.5" fill="#c9a227" />
    <path d="M41 48 L55 48 M48 41 L48 55" stroke="#c9a227" strokeWidth="1" />
  </svg>
)

// ── Rock-Solid Table-Based Score Row (Never overlaps in html2canvas) ─────────
function ScoreTableRow({ label, score, weight, isRemidi }) {
  const numScore = Number(score) || 0
  const pct = Math.min(100, Math.max(0, numScore))
  const barColor = isRemidi
    ? '#dc2626'
    : numScore >= 91 ? '#d97706' : numScore >= 76 ? '#16a34a' : numScore >= 61 ? '#ea580c' : '#2563eb'

  return (
    <div style={{ marginBottom: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3px' }}>
        <tbody>
          <tr>
            <td style={{ padding: 0, fontSize: '11px', fontWeight: 700, color: '#334155', textAlign: 'left' }}>
              {label} <span style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 600 }}>({weight}%)</span>
            </td>
            <td style={{ padding: 0, fontSize: '13px', fontWeight: 900, color: '#0f172a', textAlign: 'right', fontFamily: 'monospace' }}>
              {numScore} <span style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 600 }}>/ 100</span>
            </td>
          </tr>
        </tbody>
      </table>
      {/* Explicit Height Progress Bar Container */}
      <div style={{ height: '7px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '7px', width: `${pct}%`, backgroundColor: barColor, borderRadius: '4px' }} />
      </div>
    </div>
  )
}

/**
 * CertificateTemplate
 *
 * Robust, highly accurate A4-Landscape Certificate Template for html2canvas & jsPDF.
 * Uses strict table and block layouts to prevent text/bar overlaps and clipping.
 */
export default function CertificateTemplate({ result, id = 'certificate-template' }) {
  if (!result) return null

  const totalScore = Number(result.skor_total) || 0
  const isPassed = totalScore >= 50
  const badgeInfo = getLevelBadgeInfo(totalScore, result.level)
  const notesList = parseNotes(result.catatan, isPassed)

  // Generate formal certificate number
  const testDate = result.tanggal_tes ? new Date(result.tanggal_tes) : new Date()
  const yearStr = testDate.getFullYear()
  const romanMonth = getRomanMonth(testDate.getMonth())
  const rawId = result.id ? String(result.id) : ''
  const numericSeed = rawId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const paddedNo = String((numericSeed % 900) + 100).padStart(3, '0')
  const certNumber = `Nomor: 421.3 / BQ-${paddedNo} / SMPN.2.GLG / ${romanMonth} / ${yearStr}`

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
        backgroundColor: '#fffdfa',
        fontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif",
        boxSizing: 'border-box',
        overflow: 'hidden',
        zIndex: -9999,
        pointerEvents: 'none',
        color: '#0f172a',
      }}
    >
      {/* ── Outer Decorative Multi-Border Frame ── */}
      <div style={{ position: 'absolute', inset: '12px', border: '4.5px solid #14532d', borderRadius: '10px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: '18px', border: '1.5px solid #c9a227', borderRadius: '6px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: '24px', border: '0.75px dashed rgba(201,162,39,0.5)', borderRadius: '4px', pointerEvents: 'none' }} />

      {/* ── 4 Crisp Corner Flourishes ── */}
      <CornerTopLeft />
      <CornerTopRight />
      <CornerBottomLeft />
      <CornerBottomRight />

      {/* ── Center Watermark Logo ── */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '52%',
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

      {/* ── Inner Content Container ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '28px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* ══════════════════════════════════════════════════════════
            HEADER SECTION: Kop Surat SMPN 2 Glagah
            ══════════════════════════════════════════════════════════ */}
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2px' }}>
            <tbody>
              <tr>
                <td style={{ width: '80px', textAlign: 'center', verticalAlign: 'middle', padding: 0 }}>
                  <img
                    src="/logo-smpn2glagah.png"
                    alt="Logo SMPN 2 Glagah"
                    style={{ width: '70px', height: '70px', objectFit: 'contain' }}
                  />
                </td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 10px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#475569', margin: 0, textTransform: 'uppercase' }}>
                    Pemerintah Kabupaten Banyuwangi · Dinas Pendidikan
                  </p>
                  <h1 style={{
                    fontSize: '23px',
                    fontWeight: 900,
                    color: '#14532d',
                    margin: '1px 0',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    letterSpacing: '0.04em',
                  }}>
                    SMP NEGERI 2 GLAGAH
                  </h1>
                  <p style={{ fontSize: '9.5px', color: '#64748b', margin: 0, fontWeight: 500 }}>
                    Jl. Raya Glagah, Kec. Glagah, Kab. Banyuwangi, Jawa Timur · Kode Pos 68432 · Web: smpn2glagah.sch.id
                  </p>
                </td>
                <td style={{ width: '80px', textAlign: 'center', verticalAlign: 'middle', padding: 0 }}>
                  <div style={{ width: '70px', height: '70px' }} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Gold Header Divider */}
          <div style={{ width: '100%', height: '1.5px', background: 'linear-gradient(to right, transparent, #c9a227 20%, #c9a227 80%, transparent)', margin: '3px 0 2px 0' }} />

          {/* Bismillah Calligraphy */}
          <p style={{ fontFamily: "'Amiri', Georgia, serif", fontSize: '14px', color: '#14532d', textAlign: 'center', margin: '1px 0' }}>
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TITLE & BANNER + PROMINENT CERTIFICATE NUMBER
            ══════════════════════════════════════════════════════════ */}
        <div style={{ textAlign: 'center', margin: '0' }}>
          <h2 style={{
            fontSize: '23px',
            fontWeight: 900,
            color: isPassed ? '#14532d' : '#991b1b',
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: '0.12em',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            {isPassed ? 'SERTIFIKAT KELULUSAN' : 'HASIL EVALUASI TILAWAH AL-QUR\'AN'}
          </h2>

          {/* Solid Ribbon Banner with Bold High-Contrast Yellow/White Text */}
          <div style={{
            display: 'inline-block',
            backgroundColor: isPassed ? '#14532d' : '#991b1b',
            border: '2px solid #c9a227',
            borderRadius: '20px',
            padding: '4px 34px',
            margin: '3px 0 2px 0',
          }}>
            <span style={{
              fontSize: '11.5px',
              fontWeight: 900,
              color: '#fef08a',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              TES KEMAMPUAN BACA AL-QUR'AN
            </span>
          </div>

          {/* Certificate Number (Bold, Crisp & Visible) */}
          <p style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#334155',
            margin: '2px 0 0 0',
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
          }}>
            {certNumber}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RECIPIENT SECTION
            ══════════════════════════════════════════════════════════ */}
        <div style={{ textAlign: 'center', margin: '1px 0' }}>
          <p style={{ fontSize: '10.5px', color: '#475569', margin: '0 0 2px 0', fontStyle: 'italic' }}>
            Diberikan kepada siswa:
          </p>
          <div style={{ display: 'inline-block', borderBottom: '2.5px solid #c9a227', paddingBottom: '2px', paddingLeft: '24px', paddingRight: '24px' }}>
            <h3 style={{
              fontSize: '25px',
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
            TWO-COLUMN BODY (Scores & Details Left, Predicate & Notes Right)
            ══════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch', margin: '0' }}>

          {/* LEFT BOX: Rincian Penilaian */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              border: `1.5px solid ${isPassed ? '#14532d' : '#ef4444'}`,
              borderRadius: '10px',
              padding: '10px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <table style={{ width: '100%', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                <tbody>
                  <tr>
                    <td style={{ fontSize: '10px', fontWeight: 800, color: '#14532d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Rincian Penilaian Asesmen
                    </td>
                    <td style={{ fontSize: '9px', color: '#64748b', textAlign: 'right', fontWeight: 600 }}>
                      {formatDate(result.tanggal_tes)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Ayat yang diuji */}
              {result.ayat_dibaca && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '5px',
                  padding: '3px 8px',
                  marginBottom: '8px',
                }}>
                  <p style={{ fontSize: '8.5px', color: '#92400e', margin: 0, fontWeight: 800, textTransform: 'uppercase' }}>
                    Materi Surat / Ayat yang Diuji:
                  </p>
                  <p style={{ fontSize: '10.5px', color: '#78350f', margin: 0, fontWeight: 800, fontStyle: 'italic' }}>
                    📖 {result.ayat_dibaca}
                  </p>
                </div>
              )}

              {/* Mini Score Bars via Table Layout */}
              <ScoreTableRow label="Makharijul Huruf (Artikulasi)" score={result.skor_makhraj} weight={35} isRemidi={!isPassed} />
              <ScoreTableRow label="Kaidah Hukum Tajwid" score={result.skor_tajwid} weight={40} isRemidi={!isPassed} />
              <ScoreTableRow label="Kelancaran &amp; Adab Tilawah" score={result.skor_kelancaran} weight={25} isRemidi={!isPassed} />
            </div>

            {/* Total Row */}
            <table style={{ width: '100%', borderTop: '1.5px dashed rgba(20,83,45,0.3)', paddingTop: '4px', marginTop: '2px' }}>
              <tbody>
                <tr>
                  <td style={{ fontSize: '11px', fontWeight: 800, color: isPassed ? '#14532d' : '#991b1b' }}>
                    Total Skor Akhir
                  </td>
                  <td style={{ fontSize: '16px', fontWeight: 900, color: isPassed ? '#14532d' : '#991b1b', textAlign: 'right', fontFamily: 'monospace' }}>
                    {totalScore} <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>/ 100</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* RIGHT BOX: Predikat & Catatan Evaluasi */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              border: `1.5px solid ${isPassed ? '#14532d' : '#ef4444'}`,
              borderRadius: '10px',
              padding: '10px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Level Badge Banner */}
              <table
                style={{
                  width: '100%',
                  backgroundColor: badgeInfo.bgColor,
                  border: `1.5px solid ${badgeInfo.borderColor}`,
                  borderRadius: '8px',
                  padding: '6px 10px',
                  marginBottom: '6px',
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: 'middle', padding: '4px 6px' }}>
                      <p style={{ fontSize: '8.5px', color: badgeInfo.textColor, margin: 0, textTransform: 'uppercase', fontWeight: 800 }}>
                        Predikat Capaian:
                      </p>
                      <p style={{ fontSize: '15px', fontWeight: 900, color: badgeInfo.textColor, margin: '1px 0', fontFamily: "'Playfair Display', serif" }}>
                        {badgeInfo.emoji} {badgeInfo.label}
                      </p>
                      <p style={{ fontSize: '8.5px', color: badgeInfo.textColor, margin: 0, fontStyle: 'italic', opacity: 0.9 }}>
                        {badgeInfo.sub}
                      </p>
                    </td>
                    <td style={{ width: '65px', textAlign: 'center', verticalAlign: 'middle', padding: '2px' }}>
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          border: `1.5px solid ${badgeInfo.borderColor}`,
                          borderRadius: '6px',
                          padding: '3px 6px',
                          textAlign: 'center',
                        }}
                      >
                        <span style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 800, display: 'block' }}>SKOR</span>
                        <span style={{ fontSize: '19px', fontWeight: 900, color: badgeInfo.textColor, fontFamily: 'monospace', lineHeight: 1 }}>
                          {totalScore}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Catatan Evaluasi */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
                <p style={{ fontSize: '9.5px', fontWeight: 800, color: isPassed ? '#15803d' : '#b91c1c', margin: '0 0 3px 0', textTransform: 'uppercase' }}>
                  Catatan &amp; Bimbingan Evaluasi Guru:
                </p>
                {notesList.map((note, idx) => (
                  <div key={idx} style={{ fontSize: '10px', color: '#1e293b', lineHeight: 1.3, marginBottom: '2px', fontWeight: 600 }}>
                    <span style={{ color: '#d97706', marginRight: '4px' }}>•</span>
                    {note}
                  </div>
                ))}
              </div>
            </div>

            <p style={{ fontSize: '8px', color: '#64748b', margin: '2px 0 0 0', fontStyle: 'italic', textAlign: 'right' }}>
              {isPassed ? '*Dinyatakan Lulus Standar Tes Al-Qur\'an' : '*Status: Wajib Mengikuti Remidial Tilawah'}
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            SIGNATURES & OFFICIAL SCHOOL STAMP SECTION
            ══════════════════════════════════════════════════════════ */}
        <table style={{ width: '100%', borderCollapse: 'collapse', padding: '0 10px' }}>
          <tbody>
            <tr>
              {/* Left: Kepala Sekolah */}
              <td style={{ width: '35%', textAlign: 'center', verticalAlign: 'bottom', position: 'relative' }}>
                <p style={{ fontSize: '10px', color: '#475569', margin: 0 }}>Mengetahui,</p>
                <p style={{ fontSize: '11px', fontWeight: 800, color: '#14532d', margin: '1px 0 38px 0' }}>
                  Kepala SMP Negeri 2 Glagah
                </p>

                {/* Stempel Resmi Sekolah Bertinta Biru */}
                <div
                  style={{
                    position: 'absolute',
                    left: '10px',
                    bottom: '-4px',
                    width: '82px',
                    height: '82px',
                    borderRadius: '50%',
                    border: '2px dashed #1d4ed8',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    backgroundColor: 'rgba(239,246,255,0.3)',
                  }}
                >
                  <span style={{ fontSize: '5.5px', fontWeight: 900, color: '#1d4ed8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    PEMKAB BANYUWANGI
                  </span>
                  <img
                    src="/logo-smpn2glagah.png"
                    alt="Stamp"
                    style={{ width: '28px', height: '28px', objectFit: 'contain', margin: '1px 0' }}
                  />
                  <span style={{ fontSize: '5.5px', fontWeight: 900, color: '#1d4ed8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    SMPN 2 GLAGAH
                  </span>
                </div>

                <p style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: 0, textDecoration: 'underline', position: 'relative', zIndex: 2 }}>
                  SRIATUN, S.Pd.
                </p>
                <p style={{ fontSize: '9.5px', color: '#64748b', margin: '1px 0 0 0', fontWeight: 600, position: 'relative', zIndex: 2 }}>
                  NIP. 197006061999032006
                </p>
              </td>

              {/* Center: Medallion Seal */}
              <td style={{ width: '30%', textAlign: 'center', verticalAlign: 'middle' }}>
                <div
                  style={{
                    display: 'inline-block',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#d4af37',
                    border: '2px solid #78350f',
                    padding: '6px',
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
                  SEAL OF EXCELLENCE
                </p>
              </td>

              {/* Right: Guru Penguji / PAI */}
              <td style={{ width: '35%', textAlign: 'center', verticalAlign: 'bottom' }}>
                <p style={{ fontSize: '10px', color: '#475569', margin: 0 }}>
                  Banyuwangi, {formatDate(result.tanggal_tes)}
                </p>
                <p style={{ fontSize: '11px', fontWeight: 800, color: '#14532d', margin: '1px 0 38px 0' }}>
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
