import { LEVELS } from '../utils/scoring'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Split notes into clean, readable bullet points for the certificate box
 */
function parseNotes(catatanStr) {
  if (!catatanStr || !catatanStr.trim()) {
    return [
      'Makhraj dan tajwid telah diuji sesuai rubrik penilaian.',
      'Pertahankan bacaan dan terus tingkatkan tilawah Al-Qur\'an secara istiqomah 🌟',
    ]
  }

  // Split by semicolon, newline, or pipe
  const rawList = catatanStr
    .split(/[;\n|]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (rawList.length === 0) {
    return [catatanStr.trim()]
  }

  // Limit to max 4 points so it fits inside the template box perfectly
  return rawList.slice(0, 4)
}

/**
 * CertificateTemplate
 *
 * Renders an exact A4-landscape certificate matching the school's classical Islamic certificate design.
 * Props:
 *   result  — hasil_tes row joined with murid
 *   id      — DOM id for the capture target (default: 'certificate-template')
 */
export default function CertificateTemplate({ result, id = 'certificate-template' }) {
  if (!result) return null

  const notesList = parseNotes(result.catatan)

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
        backgroundColor: '#faf6ee',
        backgroundImage: "url('/certificate-template-bg.jpg')",
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        boxSizing: 'border-box',
        overflow: 'hidden',
        zIndex: -1,
      }}
    >
      {/* ── Recipient Student Name ── */}
      <div
        style={{
          position: 'absolute',
          left: '120px',
          right: '120px',
          top: '328px',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#132e1e',
            fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            margin: '0 0 2px 0',
            lineHeight: 1.15,
            textShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          {result.murid?.nama || result.nama_murid || '-'}
        </h2>
        <p
          style={{
            fontSize: '11.5px',
            color: '#475569',
            fontWeight: 600,
            margin: 0,
            letterSpacing: '0.02em',
          }}
        >
          Kelas: {result.murid?.kelas || result.kelas_murid || '-'}
          {result.murid?.nisn || result.nisn_murid ? ` · NISN: ${result.murid?.nisn || result.nisn_murid}` : ''}
        </p>
      </div>

      {/* ── Left Column Details (Tanggal, Tempat, Predikat, Surat/Ayat) ── */}
      <div
        style={{
          position: 'absolute',
          left: '215px',
          top: '500px',
          width: '325px',
          zIndex: 10,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: '#132e1e' }}>
          <tbody>
            <tr>
              <td style={{ width: '68px', fontWeight: 600, padding: '2px 0', color: '#334155' }}>Tanggal</td>
              <td style={{ width: '12px', padding: '2px 0', fontWeight: 600 }}>:</td>
              <td style={{ fontWeight: 700, padding: '2px 0', color: '#0f172a' }}>
                {formatDate(result.tanggal_tes)}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, padding: '2px 0', color: '#334155' }}>Tempat</td>
              <td style={{ padding: '2px 0', fontWeight: 600 }}>:</td>
              <td style={{ fontWeight: 700, padding: '2px 0', color: '#0f172a' }}>
                SMP Negeri 2 Glagah
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, padding: '2px 0', color: '#334155' }}>Predikat</td>
              <td style={{ padding: '2px 0', fontWeight: 600 }}>:</td>
              <td style={{ fontWeight: 800, padding: '2px 0', color: '#15803d' }}>
                {result.level || '—'} <span style={{ color: '#0f172a', fontWeight: 700 }}>(Skor: {result.skor_total})</span>
              </td>
            </tr>
            {result.ayat_dibaca && (
              <tr>
                <td style={{ fontWeight: 600, padding: '2px 0', color: '#64748b', fontSize: '11px' }}>Ayat/Surat</td>
                <td style={{ padding: '2px 0', fontWeight: 600, fontSize: '11px' }}>:</td>
                <td style={{ fontWeight: 600, padding: '2px 0', fontSize: '11px', color: '#78350f', fontStyle: 'italic' }}>
                  {result.ayat_dibaca}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Right Box: Catatan Hasil Ujian ── */}
      <div
        style={{
          position: 'absolute',
          left: '585px',
          top: '438px',
          width: '315px',
          height: '145px',
          padding: '6px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxSizing: 'border-box',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {notesList.map((note, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '5px',
                fontSize: notesList.length > 3 ? '10px' : '10.5px',
                color: '#1e293b',
                lineHeight: 1.35,
                fontWeight: 600,
              }}
            >
              <span style={{ color: '#d97706', fontSize: '9px', marginTop: '1px' }}>•</span>
              <span style={{ flex: 1 }}>{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Signatures ── */}
      {/* Left: Kepala Sekolah */}
      <div
        style={{
          position: 'absolute',
          left: '200px',
          top: '640px',
          width: '210px',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#132e1e',
            margin: '0 0 32px 0',
            lineHeight: 1.2,
          }}
        >
          ( ......................................... )
        </p>
      </div>

      {/* Right: Guru PAI / Penguji */}
      <div
        style={{
          position: 'absolute',
          left: '690px',
          top: '640px',
          width: '230px',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#132e1e',
            margin: '0 0 32px 0',
            lineHeight: 1.2,
          }}
        >
          {result.guru_penguji ? `( ${result.guru_penguji} )` : '( ......................................... )'}
        </p>
      </div>
    </div>
  )
}
