/**
 * Utility service to evaluate student Quran recitation audio using Google Gemini API.
 * Includes strict verification to ensure audio matches target Quranic verses and prevents hallucinations on random noises.
 */

/**
 * Convert a Blob into base64 string (without data URL prefix).
 * @param {Blob} blob 
 * @returns {Promise<string>}
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64data = reader.result.split(',')[1]
      resolve(base64data)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Fetch verses text from equran.id API for accurate ground-truth comparison.
 * @param {number|string} surahNo 
 * @param {number|string} ayatDari 
 * @param {number|string} ayatSampai 
 * @returns {Promise<string>}
 */
async function fetchTargetVersesText(surahNo, ayatDari, ayatSampai) {
  try {
    const res = await fetch(`https://equran.id/api/v2/surat/${surahNo}`)
    if (!res.ok) return ''
    const json = await res.json()
    const allAyat = json?.data?.ayat || []
    const start = Number(ayatDari) || 1
    const end = Number(ayatSampai) || start
    const selected = allAyat.filter((a) => a.nomorAyat >= start && a.nomorAyat <= end)
    
    if (selected.length === 0) return ''
    return selected
      .map((a) => `[Ayat ${a.nomorAyat}] Arab: "${a.teksArab}" (Latin: ${a.teksLatin})`)
      .join('\n')
  } catch {
    return ''
  }
}

/**
 * Evaluate Quran recitation audio with Gemini AI.
 * 
 * @param {Object} params
 * @param {Blob} params.audioBlob - Recorded audio blob
 * @param {string} params.mimeType - Mime type of audio (e.g. 'audio/webm' or 'audio/mp4')
 * @param {number|string} params.surahNo - Surah number (1-114)
 * @param {string} params.surahName - Name of surah (e.g. 'Al-Fatihah')
 * @param {number|string} params.ayatDari - Starting ayah number
 * @param {number|string} params.ayatSampai - Ending ayah number
 * @param {string} [params.targetArabicText] - Target Arabic verse text (optional, fetched if omitted)
 * @returns {Promise<{
 *   is_valid_recitation: boolean,
 *   skor_makhraj: number,
 *   skor_tajwid: number,
 *   skor_kelancaran: number,
 *   kesesuaian_ayat: string,
 *   catatan_makhraj: string,
 *   catatan_tajwid: string,
 *   catatan_kelancaran: string,
 *   saran_latihan: string,
 *   ringkasan_catatan: string
 * }>}
 */
export async function evaluateRecitationWithGemini({
  audioBlob,
  mimeType = 'audio/webm',
  surahNo,
  surahName,
  ayatDari,
  ayatSampai,
  targetArabicText = '',
}) {
  const apiKey =
    localStorage.getItem('gemini_api_key') ||
    import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    throw new Error('API Key Gemini belum aktif. Silakan masukkan API Key di menu Pengaturan.')
  }

  // Clean mime type (remove codecs=opus part if present for Gemini API)
  const cleanMimeType = mimeType.split(';')[0] || 'audio/webm'
  const base64Audio = await blobToBase64(audioBlob)

  // Fetch ground-truth Quranic text if not passed directly
  let verseGroundTruth = targetArabicText
  if (!verseGroundTruth) {
    verseGroundTruth = await fetchTargetVersesText(surahNo, ayatDari, ayatSampai)
  }

  const prompt = `
Anda adalah Penguji Ahli Tilawah Al-Qur'an, Tajwid, dan Makharijul Huruf bersertifikat.
Tugas Anda adalah mendengarkan audio rekaman siswa dengan SANGAT KRITIS dan mencocokkannya dengan ayat target yang diuji.

Informasi Target Ujian:
- Surat: ${surahName} (Surat ke-${surahNo})
- Rentang Ayat: Ayat ${ayatDari} sampai ${ayatSampai}
${verseGroundTruth ? `- Teks Ground-Truth Target:\n${verseGroundTruth}` : ''}

=== ATURAN VERIFIKASI KETAT (WAJIB DIIKUTI) ===
1. TAHAP PERTAMA - DETEKSI KEASLIAN BACAAN:
   Dengarkan audio dengan teliti. Apakah audio tersebut BENAR-BENAR merupakan suara seseorang yang sedang membaca Surat ${surahName} ayat ${ayatDari} sampai ${ayatSampai}?
   
   JIKA audio adalah:
   - Suara obrolan / bicara biasa / suara acak / batuk / tawa / suara hening / musik / derau / nyanyian / kata-kata selain Al-Qur'an,
   - ATAU membaca surat / ayat lain yang berbeda dari Surat ${surahName} ayat ${ayatDari}-${ayatSampai},
   
   MAKA ANDA HARUS MEMBERIKAN NILAI 0 DAN TIDAK BOLEH BERHALUSINASI:
   - "is_valid_recitation": false
   - "skor_makhraj": 0
   - "skor_tajwid": 0
   - "skor_kelancaran": 0
   - "kesesuaian_ayat": "Audio tidak terdeteksi melafalkan Surat ${surahName} ayat ${ayatDari}–${ayatSampai}. Terdengar suara acak / hening / tidak sesuai."
   - "catatan_makhraj": "Tidak ada pelafalan ayat target yang dapat dievaluasi."
   - "catatan_tajwid": "Tidak ada kaidah tajwid yang dapat dinilai."
   - "catatan_kelancaran": "Tidak ada tilawah Al-Qur'an yang terdeteksi."
   - "saran_latihan": "Pastikan mikrofon aktif dan rekam bacaan Surat ${surahName} ayat ${ayatDari} sampai ${ayatSampai} dengan jelas."
   - "ringkasan_catatan": "Rekaman tidak terdeteksi sebagai bacaan Surat ${surahName} ayat ${ayatDari}-${ayatSampai}. Harap rekam ulang bacaan siswa."

2. TAHAP KEDUA - PENILAIAN REALISTIS JIKA SESUAI:
   HANYA JIKA siswa memang benar membaca ayat target, nilai secara jujur, objektif, dan realistis:
   - **Makhraj (0-100)**: Dengarkan artikulasi huruf hijaiyah. Kurangi nilai jika huruf tertukar (misal Ha vs Kha, Shad vs Sin, 'Ain vs Hamzah).
   - **Tajwid (0-100)**: Periksa hukum mad (panjang 2/4/6 harakat), ghunnah, ikhfa, idgham, qolqolah.
   - **Kelancaran (0-100)**: Periksa apakah membaca terbata-bata, mengulang kata, atau lancar.
   - "is_valid_recitation": true

Kembalikan respons HANYA berupa format JSON valid tanpa teks tambahan:
{
  "is_valid_recitation": <boolean true/false>,
  "skor_makhraj": <angka bulat 0-100>,
  "skor_tajwid": <angka bulat 0-100>,
  "skor_kelancaran": <angka bulat 0-100>,
  "kesesuaian_ayat": "<Penjelasan apakah ayat dibaca lengkap sesuai target>",
  "catatan_makhraj": "<Evaluasi artikulasi huruf>",
  "catatan_tajwid": "<Evaluasi hukum tajwid>",
  "catatan_kelancaran": "<Evaluasi kelancaran tilawah>",
  "saran_latihan": "<Saran singkat untuk peningkatan>",
  "ringkasan_catatan": "<Rangkuman 1-2 kalimat untuk catatan guru>"
}
`.trim()

  const candidateModels = [
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-2.5-pro',
  ]

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: cleanMimeType,
              data: base64Audio,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  }

  let lastError = null
  let data = null

  // Try candidate models in order
  for (const modelName of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        data = await response.json()
        break
      } else {
        const errJson = await response.json().catch(() => ({}))
        const msg = errJson.error?.message || response.statusText
        lastError = new Error(`Model ${modelName} (${response.status}): ${msg}`)
        console.warn(`[GeminiEvaluator] ${modelName} failed (${response.status}), trying next fallback...`)
      }
    } catch (fetchErr) {
      lastError = fetchErr
    }
  }

  if (!data) {
    throw lastError || new Error('Gagal menghubungi layanan Gemini AI.')
  }

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) {
    throw new Error('Gemini AI tidak mengembalikan respons teks.')
  }

  try {
    const parsed = JSON.parse(rawText)
    const isValid = parsed.is_valid_recitation !== false

    return {
      is_valid_recitation: isValid,
      skor_makhraj: isValid ? Math.min(100, Math.max(0, Number(parsed.skor_makhraj) || 0)) : 0,
      skor_tajwid: isValid ? Math.min(100, Math.max(0, Number(parsed.skor_tajwid) || 0)) : 0,
      skor_kelancaran: isValid ? Math.min(100, Math.max(0, Number(parsed.skor_kelancaran) || 0)) : 0,
      kesesuaian_ayat: parsed.kesesuaian_ayat || '',
      catatan_makhraj: parsed.catatan_makhraj || '',
      catatan_tajwid: parsed.catatan_tajwid || '',
      catatan_kelancaran: parsed.catatan_kelancaran || '',
      saran_latihan: parsed.saran_latihan || '',
      ringkasan_catatan: parsed.ringkasan_catatan || '',
    }
  } catch (parseErr) {
    console.error('Failed to parse Gemini JSON response:', rawText, parseErr)
    throw new Error('Gagal membaca format data hasil evaluasi AI.')
  }
}
