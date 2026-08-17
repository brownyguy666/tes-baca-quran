import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, Volume2, VolumeX, Eye, EyeOff,
  ZoomIn, ZoomOut, Loader2, AlertCircle, Sparkles,
  ChevronDown, ChevronUp, Play, Pause, RefreshCw,
} from 'lucide-react'

// Local in-memory cache to avoid repeated network calls
const surahCache = new Map()

export default function QuranViewer({ surahNo, ayatDari = 1, ayatSampai = 1, surahInfo }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Viewer display preferences
  const [fontSize, setFontSize] = useState(26) // in px
  const [showLatin, setShowLatin] = useState(true)
  const [showTranslation, setShowTranslation] = useState(false)
  const [activeAudioAyat, setActiveAudioAyat] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef(null)

  // Fetch surah details with verses
  useEffect(() => {
    if (!surahNo) {
      setData(null)
      setError(null)
      return
    }

    let isMounted = true
    const fetchSurah = async () => {
      // Check cache first
      if (surahCache.has(Number(surahNo))) {
        setData(surahCache.get(Number(surahNo)))
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`https://equran.id/api/v2/surat/${surahNo}`)
        if (!res.ok) throw new Error(`HTTP error ${res.status}`)
        const json = await res.json()
        const surahData = json.data || json

        if (isMounted) {
          surahCache.set(Number(surahNo), surahData)
          setData(surahData)
          setLoading(false)
        }
      } catch (err) {
        // Fallback endpoint if primary fails
        try {
          const fbRes = await fetch(`https://quran-api-id.vercel.app/surahs/${surahNo}`)
          if (!fbRes.ok) throw new Error('Fallback failed')
          const fbJson = await fbRes.json()
          const normalized = {
            nomor: fbJson.number,
            namaLatin: fbJson.name,
            nama: fbJson.arabicName || fbJson.name,
            jumlahAyat: fbJson.numberOfAyahs,
            ayat: (fbJson.ayahs || []).map((a) => ({
              nomorAyat: a.number?.inSurah || a.numberInSurah || a.ayah,
              teksArab: a.arabic || a.text?.ar,
              teksLatin: a.read || a.text?.read || '',
              teksIndonesia: a.translation || a.translation?.id || '',
              audio: { '05': a.audio?.url || '' },
            })),
          }
          if (isMounted) {
            surahCache.set(Number(surahNo), normalized)
            setData(normalized)
            setLoading(false)
          }
        } catch (fallbackErr) {
          if (isMounted) {
            setError('Gagal memuat teks Al-Qur\'an. Pastikan koneksi internet aktif.')
            setLoading(false)
          }
        }
      }
    }

    fetchSurah()

    return () => {
      isMounted = false
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setIsPlaying(false)
      setActiveAudioAyat(null)
    }
  }, [surahNo])

  // Stop audio if ayat range changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
      setActiveAudioAyat(null)
    }
  }, [ayatDari, ayatSampai])

  // Filter verses within selected range
  const filteredAyat = (data?.ayat || []).filter((a) => {
    const num = Number(a.nomorAyat)
    return num >= Number(ayatDari) && num <= Number(ayatSampai)
  })

  // Play audio for specific ayat
  const playAyatAudio = (ayatItem) => {
    const audioUrl = ayatItem.audio?.['05'] || ayatItem.audio?.['01'] || Object.values(ayatItem.audio || {})[0]
    if (!audioUrl) return

    if (activeAudioAyat === ayatItem.nomorAyat && isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(audioUrl)
    audioRef.current = audio
    setActiveAudioAyat(ayatItem.nomorAyat)
    setIsPlaying(true)

    audio.onended = () => {
      setIsPlaying(false)
      setActiveAudioAyat(null)
    }

    audio.onerror = () => {
      setIsPlaying(false)
      setActiveAudioAyat(null)
    }

    audio.play()
  }

  if (!surahNo) return null

  return (
    <div
      className="rounded-2xl p-5 space-y-4 animate-in overflow-hidden transition-all duration-300"
      style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(11,15,25,0.98) 100%)',
        border: '1px solid rgba(212,175,55,0.35)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 20px rgba(212,175,55,0.06)',
      }}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08))',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#d4af37',
            }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base" style={{ color: '#fef3c7' }}>
                Teks Bacaan Al-Qur'an
              </h3>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: '#d4af37',
                }}
              >
                {surahInfo ? `${surahInfo.latin} · Ayat ${ayatDari}–${ayatSampai}` : `Ayat ${ayatDari}–${ayatSampai}`}
              </span>
            </div>
            <p className="text-xs" style={{ color: '#64748b' }}>
              Teks langsung untuk panduan penguji &amp; siswa saat tes berlangsung
            </p>
          </div>
        </div>

        {/* Action toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
          {/* Font size control */}
          <div
            className="flex items-center rounded-xl p-1 gap-1"
            style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <button
              type="button"
              title="Perkecil Ukuran Tulisan Arab"
              onClick={() => setFontSize((s) => Math.max(18, s - 3))}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700/60 text-slate-300 text-xs transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold px-1 text-slate-400">
              {fontSize}px
            </span>
            <button
              type="button"
              title="Perbesar Ukuran Tulisan Arab"
              onClick={() => setFontSize((s) => Math.min(42, s + 3))}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700/60 text-slate-300 text-xs transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle Latin */}
          <button
            type="button"
            onClick={() => setShowLatin((v) => !v)}
            className="px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            style={{
              background: showLatin ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.7)',
              border: `1px solid ${showLatin ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: showLatin ? '#a5b4fc' : '#64748b',
            }}
          >
            {showLatin ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Latin</span>
          </button>

          {/* Toggle Terjemahan */}
          <button
            type="button"
            onClick={() => setShowTranslation((v) => !v)}
            className="px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            style={{
              background: showTranslation ? 'rgba(16,185,129,0.2)' : 'rgba(30,41,59,0.7)',
              border: `1px solid ${showTranslation ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: showTranslation ? '#6ee7b7' : '#64748b',
            }}
          >
            <span>Arti</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#d4af37' }} />
          <p className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
            Memuat ayat Al-Qur'an dari EQuran API…
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div
          className="p-4 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Verses Container */}
      {!loading && !error && data && (
        <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
          {/* Basmalah Header (if not Surah 1 and not Surah 9, and starts from ayat 1) */}
          {Number(surahNo) !== 1 && Number(surahNo) !== 9 && Number(ayatDari) === 1 && (
            <div
              className="py-4 px-6 text-center rounded-xl my-2"
              style={{
                background: 'rgba(212,175,55,0.05)',
                border: '1px dashed rgba(212,175,55,0.2)',
              }}
            >
              <p
                className="font-arabic font-bold text-2xl leading-loose"
                style={{ color: '#fef3c7', textShadow: '0 0 12px rgba(212,175,55,0.3)' }}
              >
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </p>
            </div>
          )}

          {filteredAyat.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Tidak ada ayat pada rentang yang dipilih.
            </div>
          ) : (
            filteredAyat.map((ayat) => {
              const isCurrentPlaying = activeAudioAyat === ayat.nomorAyat && isPlaying

              return (
                <div
                  key={ayat.nomorAyat}
                  className="rounded-xl p-4 transition-all duration-200"
                  style={{
                    background: isCurrentPlaying
                      ? 'rgba(212,175,55,0.12)'
                      : 'rgba(30,41,59,0.4)',
                    border: `1px solid ${
                      isCurrentPlaying ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.06)'
                    }`,
                  }}
                >
                  {/* Top row with verse number and audio play button */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{
                          background: 'rgba(212,175,55,0.15)',
                          border: '1px solid rgba(212,175,55,0.3)',
                          color: '#d4af37',
                        }}
                      >
                        {ayat.nomorAyat}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Ayat {ayat.nomorAyat}
                      </span>
                    </div>

                    {/* Audio button */}
                    {ayat.audio && (
                      <button
                        type="button"
                        onClick={() => playAyatAudio(ayat)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors"
                        style={{
                          background: isCurrentPlaying ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isCurrentPlaying ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: isCurrentPlaying ? '#fef3c7' : '#94a3b8',
                        }}
                      >
                        {isCurrentPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span className="text-amber-300 font-medium">Memutar…</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Audio</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Arabic text with Utsmani style font */}
                  <div className="text-right py-2 leading-loose">
                    <p
                      className="font-arabic select-text"
                      dir="rtl"
                      style={{
                        fontSize: `${fontSize}px`,
                        lineHeight: `${fontSize * 2}px`,
                        color: '#f8fafc',
                        fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', serif",
                        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                    >
                      {ayat.teksArab}
                      <span
                        className="inline-flex items-center justify-center mx-2 w-7 h-7 rounded-full text-xs font-bold font-sans"
                        style={{
                          background: 'rgba(212,175,55,0.18)',
                          color: '#d4af37',
                          border: '1px solid rgba(212,175,55,0.4)',
                          fontSize: '11px',
                          verticalAlign: 'middle',
                        }}
                      >
                        {ayat.nomorAyat}
                      </span>
                    </p>
                  </div>

                  {/* Latin Transliteration */}
                  {showLatin && ayat.teksLatin && (
                    <p
                      className="text-xs font-medium mt-2 leading-relaxed"
                      style={{ color: '#93c5fd' }}
                    >
                      {ayat.teksLatin}
                    </p>
                  )}

                  {/* Indonesian Translation */}
                  {showTranslation && ayat.teksIndonesia && (
                    <p
                      className="text-xs mt-2 pt-2 leading-relaxed border-t border-slate-800/60"
                      style={{ color: '#94a3b8' }}
                    >
                      <span className="font-semibold text-slate-400">Artinya: </span>
                      {ayat.teksIndonesia}
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
