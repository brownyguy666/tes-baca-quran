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
    return 'Makhraj huruf dan hukum tajwid telah diuji sesuai rubrik standar. Pertahankan bacaan dan tingkatkan tilawah Al-Qur\'an secara istiqomah.'
  }
  return catatanStr.replace(/[;\n|]+/g, ' · ').trim()
}

/**
 * CertificateTemplate (Custom PowerPoint Template Engine)
 *
 * Uses the exact high-res PowerPoint design as the pixel-perfect background canvas,
 * and positions all dynamic data precisely over the designated user boxes and lines.
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
  const certNumber = `421.3/BQ-${paddedNo}/SMPN2GLG/${yearStr}`
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
        backgroundColor: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif",
        boxSizing: 'border-box',
        overflow: 'hidden',
        zIndex: -9999,
        pointerEvents: 'none',
      }}
    >
      {/* ── High-Resolution Background Design from PowerPoint ── */}
      <img
        src="/sertifikat-template-bg.png"
        alt="Background Template"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          pointerEvents: 'none',
        }}
      />

      {/* ══════════════════════════════════════════════════════════
          DYNAMIC FIELDS OVERLAY (PRECISE PPT COORDINATES)
          ══════════════════════════════════════════════════════════ */}

      {/* 1. Nomor Sertifikat (Kotak Kiri Atas) */}
      <div
        style={{
          position: 'absolute',
          left: '9.7%',
          top: '10.0%',
          width: '18.4%',
          height: '4.2%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11.5px',
          fontWeight: 800,
          color: '#1e293b',
          fontFamily: 'monospace',
          letterSpacing: '0.02em',
        }}
      >
        {certNumber}
      </div>

      {/* 2. Tanggal Terbit (Kotak Kanan Atas) */}
      <div
        style={{
          position: 'absolute',
          left: '73.3%',
          top: '10.0%',
          width: '17.2%',
          height: '4.2%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 800,
          color: '#1e293b',
        }}
      >
        {formattedDate}
      </div>

      {/* 3. Tanggal di sebelah "Banyuwangi, [tanggal]" */}
      <div
        style={{
          position: 'absolute',
          left: '81.2%',
          top: '15.2%',
          width: '10.5%',
          height: '2.0%',
          display: 'flex',
          alignItems: 'center',
          fontSize: '9.5px',
          fontWeight: 700,
          color: '#334155',
        }}
      >
        {formattedDate}
      </div>

      {/* 4. IDENTITAS SISWA: Nama Lengkap Siswa */}
      <div
        style={{
          position: 'absolute',
          left: '35.0%',
          top: '39.8%',
          width: '42.5%',
          height: '3.0%',
          display: 'flex',
          alignItems: 'center',
          fontSize: '16px',
          fontWeight: 900,
          color: '#14532d',
          fontFamily: "'Playfair Display', Georgia, serif",
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}
      >
        {result.murid?.nama || result.nama_murid || '-'}
      </div>

      {/* 5. IDENTITAS SISWA: Kelas */}
      <div
        style={{
          position: 'absolute',
          left: '35.0%',
          top: '43.3%',
          width: '20.0%',
          height: '2.6%',
          display: 'flex',
          alignItems: 'center',
          fontSize: '13.5px',
          fontWeight: 800,
          color: '#0f172a',
        }}
      >
        {result.murid?.kelas || result.kelas_murid || '-'}
      </div>

      {/* 6. IDENTITAS SISWA: NISN */}
      <div
        style={{
          position: 'absolute',
          left: '63.2%',
          top: '43.3%',
          width: '14.5%',
          height: '2.6%',
          display: 'flex',
          alignItems: 'center',
          fontSize: '13.5px',
          fontWeight: 800,
          color: '#0f172a',
          fontFamily: 'monospace',
        }}
      >
        {result.murid?.nisn || result.nisn_murid || '-'}
      </div>

      {/* 7. MATERI UJIAN: Surat & Ayat yang Diuji */}
      <div
        style={{
          position: 'absolute',
          left: '35.0%',
          top: '49.6%',
          width: '42.5%',
          height: '2.6%',
          display: 'flex',
          alignItems: 'center',
          fontSize: '13.5px',
          fontWeight: 800,
          color: '#14532d',
          fontStyle: 'italic',
        }}
      >
        {cleanAyat ? `QS. ${cleanAyat}` : 'Al-Qur\'an'}
      </div>

      {/* 8. RINCIAN SKOR (Tabel Kiri) - Presisi di dalam masing-masing baris */}
      {/* Baris 1: Makharijul Huruf */}
      <div
        style={{
          position: 'absolute',
          left: '46.5%',
          top: '57.8%',
          width: '8.0%',
          height: '2.5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13.5px',
          fontWeight: 900,
          fontFamily: 'monospace',
          color: '#0f172a',
        }}
      >
        {result.skor_makhraj ?? '-'}
      </div>

      {/* Baris 2: Kaidah Tajwid */}
      <div
        style={{
          position: 'absolute',
          left: '46.5%',
          top: '60.5%',
          width: '8.0%',
          height: '2.5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13.5px',
          fontWeight: 900,
          fontFamily: 'monospace',
          color: '#0f172a',
        }}
      >
        {result.skor_tajwid ?? '-'}
      </div>

      {/* Baris 3: Kelancaran & Adab */}
      <div
        style={{
          position: 'absolute',
          left: '46.5%',
          top: '63.2%',
          width: '8.0%',
          height: '2.5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13.5px',
          fontWeight: 900,
          fontFamily: 'monospace',
          color: '#0f172a',
        }}
      >
        {result.skor_kelancaran ?? '-'}
      </div>

      {/* Baris 4: TOTAL SKOR AKHIR */}
      <div
        style={{
          position: 'absolute',
          left: '46.5%',
          top: '65.9%',
          width: '8.0%',
          height: '2.5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
          fontWeight: 900,
          fontFamily: 'monospace',
          color: isPassed ? '#14532d' : '#dc2626',
        }}
      >
        {totalScore}
      </div>

      {/* 9. PREDIKAT / LEVEL CAPAIAN CHECKBOXES (Kotak Kanan) - Tepat di dalam Kotak ☐ */}
      {/* Box 1: Mumtaz (91-100) */}
      {activeLevel === 'mumtaz' && (
        <div
          style={{
            position: 'absolute',
            left: '57.65%',
            top: '57.9%',
            width: '15px',
            height: '15px',
            backgroundColor: '#d97706',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 900,
            lineHeight: 1,
            boxShadow: '0 0 4px rgba(217, 119, 6, 0.6)',
          }}
        >
          ✓
        </div>
      )}

      {/* Box 2: Mahir (76-90) */}
      {activeLevel === 'mahir' && (
        <div
          style={{
            position: 'absolute',
            left: '57.65%',
            top: '60.4%',
            width: '15px',
            height: '15px',
            backgroundColor: '#16a34a',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 900,
            lineHeight: 1,
            boxShadow: '0 0 4px rgba(22, 163, 74, 0.6)',
          }}
        >
          ✓
        </div>
      )}

      {/* Box 3: Menengah (61-75) */}
      {activeLevel === 'menengah' && (
        <div
          style={{
            position: 'absolute',
            left: '57.65%',
            top: '62.9%',
            width: '15px',
            height: '15px',
            backgroundColor: '#ea580c',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 900,
            lineHeight: 1,
            boxShadow: '0 0 4px rgba(234, 88, 12, 0.6)',
          }}
        >
          ✓
        </div>
      )}

      {/* Box 4: Dasar (50-60) */}
      {activeLevel === 'dasar' && (
        <div
          style={{
            position: 'absolute',
            left: '57.65%',
            top: '65.4%',
            width: '15px',
            height: '15px',
            backgroundColor: '#2563eb',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 900,
            lineHeight: 1,
            boxShadow: '0 0 4px rgba(37, 99, 235, 0.6)',
          }}
        >
          ✓
        </div>
      )}

      {/* Box 5: Remidi (<50) */}
      {activeLevel === 'remidi' && (
        <div
          style={{
            position: 'absolute',
            left: '57.65%',
            top: '67.85%',
            width: '15px',
            height: '15px',
            backgroundColor: '#dc2626',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 900,
            lineHeight: 1,
            boxShadow: '0 0 4px rgba(220, 38, 38, 0.8)',
          }}
        >
          ✓
        </div>
      )}

      {/* 10. CATATAN BIMBINGAN / EVALUASI GURU */}
      <div
        style={{
          position: 'absolute',
          left: '21.8%',
          top: '74.2%',
          width: '56.4%',
          height: '4.4%',
          display: 'flex',
          alignItems: 'flex-start',
          fontSize: '11px',
          lineHeight: 1.35,
          fontWeight: 600,
          fontStyle: 'italic',
          color: isPassed ? '#1e293b' : '#991b1b',
        }}
      >
        {notesText}
      </div>

      {/* 11. NAMA GURU PENGUJI / PAI (Tepat di atas garis kanan bawah) */}
      <div
        style={{
          position: 'absolute',
          left: '58.6%',
          top: '87.2%',
          width: '22.0%',
          height: '2.8%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13.5px',
          fontWeight: 800,
          color: '#0f172a',
          textDecoration: 'underline',
        }}
      >
        {result.guru_penguji || 'Guru PAI'}
      </div>
    </div>
  )
}
