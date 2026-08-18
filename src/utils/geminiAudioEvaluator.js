/**
 * Utility service to evaluate student Quran recitation audio using Google Gemini API.
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
 * Evaluate Quran recitation audio with Gemini AI.
 * 
 * @param {Object} params
 * @param {Blob} params.audioBlob - Recorded audio blob
 * @param {string} params.mimeType - Mime type of audio (e.g. 'audio/webm' or 'audio/mp4')
 * @param {number|string} params.surahNo - Surah number (1-114)
 * @param {string} params.surahName - Name of surah (e.g. 'Al-Fatihah')
 * @param {number|string} params.ayatDari - Starting ayah number
 * @param {number|string} params.ayatSampai - Ending ayah number
 * @param {string} [params.targetArabicText] - Target Arabic verse text (if available)
 * @returns {Promise<{
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
    throw new Error('API Key Gemini belum aktif di deploy ini. Silakan klik "Trigger Deploy -> Deploy site" di Netlify, atau masukkan API Key di menu Pengaturan.')
  }

  // Clean mime type (remove codecs=opus part if present for Gemini API)
  const cleanMimeType = mimeType.split(';')[0] || 'audio/webm'
  const base64Audio = await blobToBase64(audioBlob)

  const prompt = `
Anda adalah Penguji dan Pakar Ahli Tilawah Al-Qur'an, Tajwid, dan Makharijul Huruf bersertifikat.
Tugas Anda adalah mendengarkan audio rekaman bacaan siswa dan memberikan evaluasi objektif.

Informasi Ujian:
- Surat: ${surahName} (Surat ke-${surahNo})
- Rentang Ayat: Ayat ${ayatDari} sampai ${ayatSampai}
${targetArabicText ? `- Teks Ayat Target:\n"${targetArabicText}"` : ''}

Dengarkan rekaman audio siswa yang terlampir secara teliti, lalu nilai 3 kriteria utama (skor 0 - 100):
1. **Makhraj (Bobot 35%)**: Ketepatan artikulasi pelafalan makhraj huruf hijaiyah dan sifat-sifat huruf (misal: membedakan Ha/Kha/Hha, Shad/Sin, 'Ain/Alif, Dhad/Dal/Zho).
2. **Tajwid (Bobot 40%)**: Penerapan kaidah hukum tajwid seperti panjang mad (2/4/6 harakat), ghunnah pada nun/mim bertasydid, ikhfa, idgham, iqlab, dan qolqolah.
3. **Kelancaran (Bobot 25%)**: Kelancaran tilawah, kejelasan wakaf (berhenti) dan ibtida (memulai), tidak tersendat atau berulang-ulang berlebihan.

Kembalikan jawaban HANYA berupa JSON valid dengan skema berikut:
{
  "skor_makhraj": <angka bulat 0-100>,
  "skor_tajwid": <angka bulat 0-100>,
  "skor_kelancaran": <angka bulat 0-100>,
  "kesesuaian_ayat": "<Penjelasan singkat apakah ayat dibaca lengkap dan benar, atau ada kata/ayat yang terlewat>",
  "catatan_makhraj": "<Poin evaluasi makhraj huruf yang sudah tepat atau yang perlu diperbaiki>",
  "catatan_tajwid": "<Poin evaluasi hukum tajwid yang sudah tepat atau yang kurang tepat>",
  "catatan_kelancaran": "<Poin evaluasi kelancaran dan pemenggalan nafas/wakaf>",
  "saran_latihan": "<Saran konstruktif dan memotivasi untuk siswa>",
  "ringkasan_catatan": "<Rangkuman singkat dan padat 2-3 kalimat berbahasa Indonesia untuk dimasukkan langsung ke catatan raport/guru>"
}
`.trim()

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

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
      temperature: 0.2,
    },
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    let errorDetails = ''
    try {
      const errJson = await response.json()
      errorDetails = errJson.error?.message || JSON.stringify(errJson)
    } catch {
      errorDetails = response.statusText
    }
    throw new Error(`Gagal memproses audio dengan Gemini AI (${response.status}): ${errorDetails}`)
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) {
    throw new Error('Gemini AI tidak mengembalikan respons teks.')
  }

  try {
    // Parse JSON
    const parsed = JSON.parse(rawText)
    return {
      skor_makhraj: Math.min(100, Math.max(0, Number(parsed.skor_makhraj) || 75)),
      skor_tajwid: Math.min(100, Math.max(0, Number(parsed.skor_tajwid) || 75)),
      skor_kelancaran: Math.min(100, Math.max(0, Number(parsed.skor_kelancaran) || 75)),
      kesesuaian_ayat: parsed.kesesuaian_ayat || 'Sesuai dengan ayat target',
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
