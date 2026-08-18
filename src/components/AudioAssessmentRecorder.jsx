import React, { useState, useRef, useEffect } from 'react'
import {
  Mic,
  Square,
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  Check,
  AlertCircle,
  Loader2,
  Volume2,
  HelpCircle,
  FileAudio,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { evaluateRecitationWithGemini } from '../utils/geminiAudioEvaluator'

export default function AudioAssessmentRecorder({
  surahNo,
  surahName,
  ayatDari,
  ayatSampai,
  targetArabicText = '',
  onApplyEvaluation,
}) {
  const [status, setStatus] = useState('idle') // 'idle' | 'recording' | 'recorded' | 'evaluating' | 'evaluated'
  const [recordTime, setRecordTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [mimeType, setMimeType] = useState('audio/webm')
  const [isPlaying, setIsPlaying] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerIntervalRef = useRef(null)
  const audioElementRef = useRef(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [audioUrl])

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start recording
  const handleStartRecording = async () => {
    setErrorMsg(null)
    setAiResult(null)
    audioChunksRef.current = []

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser Anda tidak mendukung perekaman audio via mikrofon.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Determine supported mimeType
      let preferredMime = 'audio/webm'
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) preferredMime = 'audio/mp4'
        else if (MediaRecorder.isTypeSupported('audio/ogg')) preferredMime = 'audio/ogg'
        else preferredMime = ''
      }
      setMimeType(preferredMime || 'audio/webm')

      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream)

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        // Stop all audio tracks from stream to release mic icon
        stream.getTracks().forEach((track) => track.stop())

        const blob = new Blob(audioChunksRef.current, {
          type: preferredMime || 'audio/webm',
        })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        setStatus('recorded')
      }

      mediaRecorderRef.current = recorder
      recorder.start(250) // collect chunks every 250ms
      setStatus('recording')
      setRecordTime(0)

      timerIntervalRef.current = setInterval(() => {
        setRecordTime((t) => t + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      let msg = err.message || 'Gagal mengakses mikrofon.'
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Izin mikrofon ditolak oleh browser. Silakan izinkan akses mikrofon di pengaturan browser HP/komputer Anda.'
      }
      setErrorMsg(msg)
      toast.error(msg)
    }
  }

  // Stop recording
  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  // Reset / re-record
  const handleReset = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setAudioBlob(null)
    setIsPlaying(false)
    setStatus('idle')
    setRecordTime(0)
    setAiResult(null)
    setErrorMsg(null)
  }

  // Toggle audio playback
  const handleTogglePlay = () => {
    if (!audioElementRef.current) return
    if (isPlaying) {
      audioElementRef.current.pause()
      setIsPlaying(false)
    } else {
      audioElementRef.current.play()
      setIsPlaying(true)
    }
  }

  // Call Gemini AI evaluation
  const handleRunAiEvaluation = async () => {
    if (!audioBlob) {
      toast.error('Tidak ada rekaman audio untuk dinilai.')
      return
    }

    setStatus('evaluating')
    setErrorMsg(null)

    try {
      toast.loading('AI Gemini sedang mendengarkan & menganalisis bacaan…', { id: 'evaluating-ai' })
      const result = await evaluateRecitationWithGemini({
        audioBlob,
        mimeType,
        surahNo,
        surahName,
        ayatDari,
        ayatSampai,
        targetArabicText,
      })

      setAiResult(result)
      setStatus('evaluated')
      toast.success('Analisis AI Selesai! 🎉 Nilai & catatan siap diterapkan.', { id: 'evaluating-ai' })

      // Automatically apply to parent form
      if (onApplyEvaluation) {
        onApplyEvaluation({
          makhraj: result.skor_makhraj,
          tajwid: result.skor_tajwid,
          kelancaran: result.skor_kelancaran,
          catatan: result.ringkasan_catatan,
          detailedNotes: result,
        })
      }
    } catch (err) {
      console.error('AI Evaluation error:', err)
      setErrorMsg(err.message || 'Gagal mengevaluasi bacaan dengan AI.')
      toast.error('Gagal analisis AI: ' + (err.message || 'Error tidak diketahui'), {
        id: 'evaluating-ai',
      })
      setStatus('recorded')
    }
  }

  return (
    <div
      className="card p-4 sm:p-5 animate-in space-y-4 rounded-2xl w-full border relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(26,35,50,0.95) 0%, rgba(15,23,42,0.98) 100%)',
        borderColor: status === 'recording' ? 'rgba(239,68,68,0.5)' : 'rgba(99,102,241,0.3)',
        boxShadow:
          status === 'recording'
            ? '0 0 25px rgba(239,68,68,0.2)'
            : '0 8px 24px rgba(0,0,0,0.3), 0 0 15px rgba(99,102,241,0.08)',
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background:
                status === 'recording'
                  ? 'rgba(239,68,68,0.2)'
                  : 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.08))',
              border: `1px solid ${status === 'recording' ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.4)'}`,
              color: status === 'recording' ? '#f87171' : '#818cf8',
            }}
          >
            {status === 'recording' ? (
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                AI Penilai Suara Murid
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(212,175,55,0.2))',
                    border: '1px solid rgba(99,102,241,0.4)',
                    color: '#c7d2fe',
                  }}
                >
                  Gemini 2.0
                </span>
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Rekam suara saat murid membaca, AI akan menganalisis kesesuaian tajwid & makhraj
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-1.5">
          {status === 'recording' && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Merekam ({formatTimer(recordTime)})
            </span>
          )}
          {status === 'evaluating' && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30">
              <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
              Menganalisis…
            </span>
          )}
          {status === 'evaluated' && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-300 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
              Dinilai
            </span>
          )}
        </div>
      </div>

      {/* Error display */}
      {errorMsg && (
        <div
          className="p-3 rounded-xl flex items-start gap-2.5 text-xs"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Main recording controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* State 1: IDLE */}
        {status === 'idle' && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleStartRecording}
              className="btn-gold flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-bold w-full sm:w-auto shadow-lg"
            >
              <Mic className="w-4 h-4 text-amber-900 animate-pulse" />
              <span>Mulai Rekam Bacaan Murid</span>
            </button>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              (Pastikan mikrofon HP/laptop aktif)
            </span>
          </div>
        )}

        {/* State 2: RECORDING */}
        {status === 'recording' && (
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 h-5">
                <span className="w-1 bg-rose-400 rounded-full animate-[bounce_1s_infinite_100ms] h-4" />
                <span className="w-1 bg-rose-400 rounded-full animate-[bounce_1s_infinite_300ms] h-6" />
                <span className="w-1 bg-rose-400 rounded-full animate-[bounce_1s_infinite_200ms] h-3" />
                <span className="w-1 bg-rose-400 rounded-full animate-[bounce_1s_infinite_400ms] h-5" />
              </div>
              <span className="font-mono text-sm font-bold text-rose-300">
                {formatTimer(recordTime)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStopRecording}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
              }}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Selesai Membaca</span>
            </button>
          </div>
        )}

        {/* State 3: RECORDED / EVALUATED / EVALUATING */}
        {(status === 'recorded' || status === 'evaluating' || status === 'evaluated') && audioUrl && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-3">
            {/* Audio Preview Controls */}
            <div className="flex items-center gap-2">
              <audio
                ref={audioElementRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleTogglePlay}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                style={{
                  background: 'rgba(30,41,59,0.9)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#e2e8f0',
                }}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-slate-300" />}
                <span>{isPlaying ? 'Jeda Audio' : 'Dengar Rekaman'}</span>
              </button>

              <span className="text-xs font-mono text-slate-400">
                {formatTimer(recordTime)}
              </span>

              <button
                type="button"
                onClick={handleReset}
                disabled={status === 'evaluating'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                title="Rekam Ulang"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action Button: Run AI Evaluation */}
            <div className="flex items-center gap-2">
              {status === 'recorded' && (
                <button
                  type="button"
                  onClick={handleRunAiEvaluation}
                  className="btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-4 w-full sm:w-auto shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Nilai Otomatis dengan AI Gemini</span>
                </button>
              )}

              {status === 'evaluating' && (
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-indigo-200 bg-indigo-900/40 border border-indigo-500/30 cursor-wait w-full sm:w-auto"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>AI Sedang Menganalisis…</span>
                </button>
              )}

              {status === 'evaluated' && (
                <button
                  type="button"
                  onClick={handleRunAiEvaluation}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors w-full sm:w-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Analisis Ulang</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Evaluation Results Showcase */}
      {status === 'evaluated' && aiResult && (
        <div
          className="p-3.5 sm:p-4 rounded-xl space-y-3 animate-in"
          style={{
            background: 'rgba(15,23,42,0.85)',
            border: '1px solid rgba(212,175,55,0.3)',
          }}
        >
          {/* Score highlights */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className="p-2.5 rounded-lg text-center"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
            >
              <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">Makhraj</p>
              <p className="text-xl sm:text-2xl font-black text-indigo-400 mt-0.5">
                {aiResult.skor_makhraj}
              </p>
            </div>

            <div
              className="p-2.5 rounded-lg text-center"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}
            >
              <p className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Tajwid</p>
              <p className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
                {aiResult.skor_tajwid}
              </p>
            </div>

            <div
              className="p-2.5 rounded-lg text-center"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
            >
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">Kelancaran</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                {aiResult.skor_kelancaran}
              </p>
            </div>
          </div>

          {/* Detailed findings */}
          <div className="space-y-1.5 text-xs">
            {aiResult.kesesuaian_ayat && (
              <p className="text-slate-300">
                <span className="font-semibold text-amber-200">📖 Ayat: </span>
                {aiResult.kesesuaian_ayat}
              </p>
            )}
            {aiResult.catatan_makhraj && (
              <p className="text-slate-300">
                <span className="font-semibold text-indigo-300">🗣️ Makhraj: </span>
                {aiResult.catatan_makhraj}
              </p>
            )}
            {aiResult.catatan_tajwid && (
              <p className="text-slate-300">
                <span className="font-semibold text-amber-300">⚖️ Tajwid: </span>
                {aiResult.catatan_tajwid}
              </p>
            )}
            {aiResult.saran_latihan && (
              <p className="text-emerald-300">
                <span className="font-semibold text-emerald-400">💡 Saran: </span>
                {aiResult.saran_latihan}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>✨ Nilai & catatan di bawah telah otomatis diperbarui oleh AI. Guru dapat menyesuaikan jika diperlukan.</span>
          </div>
        </div>
      )}
    </div>
  )
}
