import { useState } from 'react'
import { Eye, EyeOff, BookOpen, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const { signIn, loginAsDemo } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email dan password wajib diisi')
      return
    }
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      if (error.message?.toLowerCase().includes('invalid')) {
        toast.error('Email atau password salah')
      } else {
        toast.error(error.message || 'Gagal masuk, coba lagi')
      }
    } else {
      toast.success('Selamat datang! 👋')
      navigate(from, { replace: true })
    }
  }

  const handleDemoLogin = () => {
    loginAsDemo()
    toast.success('Masuk ke Mode Demo Pengawas Kemenag ✨')
    navigate('/demo', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-islamic-950 pattern-bg px-4">
      {/* Background decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-islamic-800/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-900/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-in">
        {/* Card */}
        <div className="card p-8 shadow-2xl">
          {/* Logo & heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl
                            bg-slate-900/60 border border-amber-500/30 p-2 shadow-2xl mb-4
                            animate-pulse-glow">
              <img
                src="/logo-smpn2glagah.png"
                alt="Logo SMPN 2 Glagah"
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
              />
            </div>

            <div className="divider-ornament text-xs text-gold-600/60 font-arabic mb-3 px-4">
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>

            <h1 className="text-2xl font-bold font-display text-islamic-50 mb-1">
              Tes Baca Al-Quran
            </h1>
            <p className="text-sm text-islamic-400">SMP Negeri 2 Glagah</p>
            <p className="text-xs text-islamic-600 mt-1">Masuk untuk mengakses sistem penilaian</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <div>
              <label className="label" htmlFor="email-input">Email Guru</label>
              <input
                id="email-input"
                type="email"
                className="input-field"
                placeholder="nama@sekolah.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password-input">Password</label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  id="toggle-password-btn"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-islamic-500
                             hover:text-islamic-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sedang masuk…</span>
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="px-3 text-slate-500 bg-slate-900/90 font-bold rounded-full">
                Atau
              </span>
            </div>
          </div>

          {/* Demo Mode Button for Kemenag / Guests */}
          <button
            type="button"
            id="demo-login-btn"
            onClick={handleDemoLogin}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(99,102,241,0.22))',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#fef3c7',
              boxShadow: '0 4px 16px rgba(212,175,55,0.12)',
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Masuk Mode Demo (Pengawas Kemenag / Tamu)</span>
          </button>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-islamic-800/60">
            <p className="text-xs text-islamic-600 text-center leading-relaxed">
              Akun guru dibuat oleh administrator.<br />
              Mode Demo dapat digunakan langsung untuk menguji fitur AI Penilai Tilawah.
            </p>
          </div>
        </div>

        {/* Bottom ornament */}
        <p className="text-center text-[10px] text-islamic-700 mt-4">
          © 2024 SMP Negeri 2 Glagah · Sistem Penilaian Baca Al-Quran
        </p>
      </div>
    </div>
  )
}
