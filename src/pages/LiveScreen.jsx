import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { SURAHS } from '../utils/surahs'
import QuranViewer from '../components/QuranViewer'
import {
  BookOpen, Maximize, Minimize, Wifi, WifiOff,
  User, Sparkles, ArrowLeft, ZoomIn, ZoomOut,
  GraduationCap, Clock, RefreshCw,
} from 'lucide-react'

export default function LiveScreen() {
  const [sessionData, setSessionData] = useState({
    surahNo: '1',
    ayatDari: '1',
    ayatSampai: '7',
    studentName: '',
    studentClass: '',
    guruName: '',
    lastUpdated: null,
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [timeStr, setTimeStr] = useState('')

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Listen to Supabase Realtime broadcast channel
  useEffect(() => {
    const channel = supabase.channel('mushaf_live_sync')

    channel
      .on('broadcast', { event: 'mushaf_update' }, ({ payload }) => {
        if (payload) {
          setSessionData({
            surahNo: payload.surahNo || '1',
            ayatDari: payload.ayatDari || '1',
            ayatSampai: payload.ayatSampai || '7',
            studentName: payload.studentName || '',
            studentClass: payload.studentClass || '',
            guruName: payload.guruName || '',
            lastUpdated: new Date(),
          })
          setManualMode(false)
        }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const selectedSurah = SURAHS.find((s) => String(s.no) === String(sessionData.surahNo)) || SURAHS[0]

  return (
    <div
      className="min-h-screen flex flex-col text-slate-100 select-none overflow-x-hidden"
      style={{
        background: 'radial-gradient(ellipse at top, #111827 0%, #0b0f19 70%, #060911 100%)',
      }}
    >
      {/* Top Navbar */}
      <header
        className="px-6 py-3.5 flex items-center justify-between border-b flex-shrink-0"
        style={{
          background: 'rgba(17,24,39,0.85)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #b45309)',
                color: '#0b0f19',
              }}
            >
              📖
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-amber-100 flex items-center gap-2">
                SMP Negeri 2 Glagah
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Layar Siswa
                </span>
              </h1>
              <p className="text-[11px] text-slate-500">Tes Kemampuan Baca Al-Qur'an</p>
            </div>
          </div>
        </div>

        {/* Status indicator & controls */}
        <div className="flex items-center gap-3">
          {/* Connection badge */}
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: isConnected ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: isConnected ? '#34d399' : '#f87171',
            }}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            <span>{isConnected ? 'Sinkron dengan HP Guru' : 'Menghubungkan…'}</span>
          </div>

          {/* Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs text-slate-400 bg-slate-800/60 border border-slate-700/50 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeStr}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}</span>
          </button>
        </div>
      </header>

      {/* Main Student Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6 flex flex-col justify-start">
        {/* Active Student Greeting Banner (if student info available) */}
        {sessionData.studentName && (
          <div
            className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(30,41,59,0.7) 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
              >
                {sessionData.studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-indigo-300 font-semibold tracking-wide uppercase">
                  Peserta Ujian:
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {sessionData.studentName}
                </h2>
                {sessionData.studentClass && (
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    Kelas {sessionData.studentClass}
                  </p>
                )}
              </div>
            </div>

            {sessionData.guruName && (
              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/50">
                <p className="text-[11px] text-slate-400">Penguji:</p>
                <p className="text-sm font-bold text-amber-300">{sessionData.guruName}</p>
              </div>
            )}
          </div>
        )}

        {/* Manual Surah Selector Toggle (if teacher is not broadcasting yet) */}
        {!sessionData.studentName && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {manualMode ? 'Pilih Surat & Ayat Sendiri' : 'Menunggu Pilihan Ayat dari HP Guru…'}
                </p>
                <p className="text-xs text-slate-500">
                  {manualMode
                    ? 'Gunakan pilihan di bawah untuk memilih surat secara mandiri'
                    : 'Buka form Tes Baru di HP guru, pilih murid & ayat untuk sinkronisasi otomatis'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setManualMode((m) => !m)}
              className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              {manualMode ? 'Tutup Pilihan Manual' : 'Pilih Manual'}
            </button>
          </div>
        )}

        {/* Manual picker form */}
        {manualMode && (
          <div className="card p-5 space-y-4 animate-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Surat</label>
                <select
                  className="input-field"
                  value={sessionData.surahNo}
                  onChange={(e) => {
                    const no = e.target.value
                    const s = SURAHS.find((x) => String(x.no) === no)
                    setSessionData((p) => ({
                      ...p,
                      surahNo: no,
                      ayatDari: '1',
                      ayatSampai: s ? String(s.ayat) : '1',
                    }))
                  }}
                >
                  {SURAHS.map((s) => (
                    <option key={s.no} value={s.no}>
                      {s.no}. {s.latin} ({s.ar}) — {s.ayat} ayat
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Ayat Dari</label>
                <input
                  type="number"
                  min="1"
                  max={selectedSurah.ayat}
                  className="input-field text-center font-bold"
                  value={sessionData.ayatDari}
                  onChange={(e) => setSessionData((p) => ({ ...p, ayatDari: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Ayat Sampai</label>
                <input
                  type="number"
                  min={sessionData.ayatDari}
                  max={selectedSurah.ayat}
                  className="input-field text-center font-bold"
                  value={sessionData.ayatSampai}
                  onChange={(e) => setSessionData((p) => ({ ...p, ayatSampai: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Quran Viewer Live Canvas */}
        <div className="flex-1">
          <QuranViewer
            surahNo={sessionData.surahNo}
            ayatDari={sessionData.ayatDari}
            ayatSampai={sessionData.ayatSampai}
            surahInfo={selectedSurah}
          />
        </div>
      </main>
    </div>
  )
}
