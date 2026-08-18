/**
 * scoring.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Centralized scoring logic for Quran reading assessment.
 * Adding new criteria in the future: just update CRITERIA and SCORING_WEIGHTS.
 * ──────────────────────────────────────────────────────────────────────────────
 */

/**
 * Criteria definitions (modular — add new ones here without changing other files)
 */
export const CRITERIA = [
  {
    key: 'makhraj',
    label: 'Makhraj',
    description: 'Ketepatan tempat keluarnya huruf hijaiyah',
    icon: '🗣️',
    weight: 0.35,
    guidance: [
      { range: '0–40',   label: 'Belum tepat', desc: 'Banyak huruf yang keliru makhrajnya' },
      { range: '41–60',  label: 'Cukup', desc: 'Sebagian besar huruf sudah tepat' },
      { range: '61–75',  label: 'Baik', desc: 'Hampir semua huruf tepat makhrajnya' },
      { range: '76–90',  label: 'Sangat Baik', desc: 'Makhraj huruf sangat tepat' },
      { range: '91–100', label: 'Sempurna', desc: 'Makhraj sempurna sesuai kaidah' },
    ],
  },
  {
    key: 'tajwid',
    label: 'Tajwid',
    description: 'Penerapan hukum-hukum tajwid (mad, ghunnah, idgham, dll.)',
    icon: '📖',
    weight: 0.40,
    guidance: [
      { range: '0–40',   label: 'Belum diterapkan', desc: 'Hukum tajwid belum diterapkan' },
      { range: '41–60',  label: 'Sebagian', desc: 'Beberapa hukum tajwid sudah diterapkan' },
      { range: '61–75',  label: 'Baik', desc: 'Sebagian besar tajwid benar' },
      { range: '76–90',  label: 'Sangat Baik', desc: 'Tajwid diterapkan dengan sangat baik' },
      { range: '91–100', label: 'Sempurna', desc: 'Tajwid sempurna tanpa kesalahan' },
    ],
  },
  {
    key: 'kelancaran',
    label: 'Kelancaran',
    description: 'Kemampuan membaca dengan lancar dan tidak terputus-putus',
    icon: '⚡',
    weight: 0.25,
    guidance: [
      { range: '0–40',   label: 'Sangat Terbata', desc: 'Membaca sangat terbata-bata' },
      { range: '41–60',  label: 'Terbata', desc: 'Masih banyak jeda yang tidak wajar' },
      { range: '61–75',  label: 'Cukup Lancar', desc: 'Cukup lancar dengan sedikit jeda' },
      { range: '76–90',  label: 'Lancar', desc: 'Membaca dengan lancar' },
      { range: '91–100', label: 'Sangat Lancar', desc: 'Membaca sangat lancar dan fasih' },
    ],
  },
]

/**
 * Level thresholds — ordered from highest to lowest for easy matching
 * Score < 50 requires remedial (Wajib Remidi / Mengulang)
 */
export const LEVELS = [
  { min: 91,  max: 100, label: 'Mumtaz (Tartil)',          color: 'level-mumtaz',   emoji: '🌟', colorHex: '#d97706', passed: true,  desc: 'Istimewa & Sangat Fasih' },
  { min: 76,  max: 90,  label: 'Mahir',                    color: 'level-mahir',    emoji: '✅', colorHex: '#16a34a', passed: true,  desc: 'Lancar & Memenuhi Tajwid' },
  { min: 61,  max: 75,  label: 'Menengah',                  color: 'level-menengah', emoji: '📈', colorHex: '#ea580c', passed: true,  desc: 'Cukup Baik & Perlu Latihan' },
  { min: 50,  max: 60,  label: 'Dasar (Cukup)',            color: 'level-dasar',    emoji: '📚', colorHex: '#3b82f6', passed: true,  desc: 'Batas Minimum Kelulusan' },
  { min: 0,   max: 49,  label: 'Remidi (Wajib Mengulang)', color: 'level-pemula',   emoji: '⚠️', colorHex: '#dc2626', passed: false, desc: 'Wajib Bimbingan & Remidi' },
]

/**
 * Calculate weighted total score from criteria scores.
 * @param {Record<string, number>} scores  e.g. { makhraj: 80, tajwid: 75, kelancaran: 90 }
 * @returns {number} Rounded total score (1 decimal)
 */
export function calculateTotalScore(scores) {
  const total = CRITERIA.reduce((sum, criterion) => {
    const raw = parseFloat(scores[criterion.key]) || 0
    return sum + raw * criterion.weight
  }, 0)
  return Math.round(total * 10) / 10
}

/**
 * Determine level from total score.
 * @param {number} totalScore
 * @returns {typeof LEVELS[0]}
 */
export function getLevel(totalScore) {
  return LEVELS.find((l) => totalScore >= l.min && totalScore <= l.max) ?? LEVELS[LEVELS.length - 1]
}

/**
 * Get the real-time summary for display, combining score and level.
 * @param {Record<string, number|string>} scores
 */
export function getSummary(scores) {
  // Check if all criteria have been filled
  const allFilled = CRITERIA.every((c) => {
    const v = parseFloat(scores[c.key])
    return !isNaN(v) && scores[c.key] !== ''
  })

  if (!allFilled) return null

  const totalScore = calculateTotalScore(scores)
  const level = getLevel(totalScore)
  return { totalScore, level }
}

/**
 * Build the DB record shape for hasil_tes from form data.
 * Centralises the mapping from form → DB so you only update here.
 */
export function buildTestRecord({ muridId, formData, guruPenguji }) {
  const scores = {}
  CRITERIA.forEach((c) => { scores[c.key] = parseFloat(formData[`skor_${c.key}`]) })
  const totalScore = calculateTotalScore(scores)
  const level = getLevel(totalScore)

  return {
    murid_id:       muridId,
    tanggal_tes:    formData.tanggal_tes,
    ayat_dibaca:    formData.ayat_dibaca || null,
    skor_makhraj:   scores.makhraj,
    skor_tajwid:    scores.tajwid,
    skor_kelancaran: scores.kelancaran,
    skor_total:     totalScore,
    level:          level.label,
    guru_penguji:   guruPenguji,
    catatan:        formData.catatan || null,
  }
}
