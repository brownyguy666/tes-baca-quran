import { useState } from 'react'
import { Eye, EyeOff, BookOpen, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const { signIn } = useAuth()
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl
                            bg-gradient-to-br from-islamic-600 to-islamic-800 shadow-glow-green mb-4
                            animate-pulse-glow">
              <BookOpen className="w-9 h-9 text-gold-400" />
            </div>

            <div className="divider-ornament text-xs text-gold-600/60 font-arabic mb-3 px-4">
              بِسْمِ اللّٰهِ
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

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-islamic-800/60">
            <p className="text-xs text-islamic-600 text-center leading-relaxed">
              Akun guru dibuat oleh administrator.<br />
              Hubungi admin sekolah jika belum memiliki akun.
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
