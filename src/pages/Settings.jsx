import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { CRITERIA } from '../utils/scoring'
import {
  SlidersHorizontal, User, Shield, Lock, Construction,
  Edit2, Save, X, CheckCircle, Loader2, BadgeCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Shared Section Wrapper ──────────────────────────────────
function SettingSection({ icon: Icon, title, color = '#d4af37', children }) {
  return (
    <div className="card p-5 space-y-4 animate-in">
      <h2 className="font-bold flex items-center gap-2.5" style={{ color: '#e2e8f0' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20`, color }}
        >
          <Icon className="w-4 h-4" />
        </div>
        {title}
      </h2>
      {children}
    </div>
  )
}

function ComingSoonBadge() {
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
      style={{
        background: 'rgba(245,158,11,0.15)',
        border: '1px solid rgba(245,158,11,0.3)',
        color: '#f59e0b',
      }}
    >
      <Construction className="w-2.5 h-2.5" />
      Segera
    </span>
  )
}

// ── Avatar initials ─────────────────────────────────────────
function Avatar({ name, size = 14 }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center font-black flex-shrink-0`}
      style={{
        background: 'linear-gradient(135deg,rgba(212,175,55,0.35),rgba(212,175,55,0.12))',
        border: '2px solid rgba(212,175,55,0.45)',
        color: '#d4af37',
        fontSize: size > 10 ? '1.25rem' : '0.85rem',
        width: `${size * 4}px`,
        height: `${size * 4}px`,
      }}
    >
      {(name || 'G').charAt(0).toUpperCase()}
    </div>
  )
}

// ── Edit Profil Modal ───────────────────────────────────────
function EditProfilModal({ profile, onClose, onSaved }) {
  const { updateProfile } = useAuth()
  const [name, setName]   = useState(profile?.name || '')
  const [nip, setNip]     = useState(profile?.nip  || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Validate: name cannot be empty
  const nameOk = name.trim().length >= 3
  // NIP optional; if provided must be numeric 8–18 digits
  const nipOk  = nip === '' || /^\d{8,18}$/.test(nip.replace(/\s/g, ''))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!nameOk) { setError('Nama minimal 3 karakter'); return }
    if (!nipOk)  { setError('NIP harus berupa angka 8–18 digit (atau kosongkan)'); return }

    setSaving(true)
    const { error: err } = await updateProfile({
      name:  name.trim(),
      nip:   nip.trim().replace(/\s/g, ''),
    })
    setSaving(false)

    if (err) {
      toast.error(`Gagal menyimpan: ${err.message}`)
    } else {
      toast.success('Profil berhasil diperbarui! ✅')
      onSaved()
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-5 animate-in"
        style={{
          background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
            >
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ color: '#f8fafc' }}>
                Edit Profil
              </h3>
              <p className="text-xs" style={{ color: '#475569' }}>
                Data akan disimpan ke akun Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: '#475569' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl"
             style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Avatar name={name || profile?.name} size={14} />
          <div className="min-w-0">
            <p className="font-bold truncate" style={{ color: '#e2e8f0' }}>
              {name.trim() || <span style={{ color: '#334155' }}>Nama belum diisi</span>}
            </p>
            {nip && (
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#64748b' }}>
                <BadgeCheck className="w-3 h-3 text-indigo-400" />
                NIP {nip}
              </p>
            )}
            <p className="text-xs mt-0.5" style={{ color: '#334155' }}>
              {profile?.email}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="edit-profil-form">
          {/* Nama lengkap */}
          <div>
            <label className="label" htmlFor="profil-name">
              Nama Lengkap + Gelar <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="profil-name"
              type="text"
              className="input-field"
              placeholder="Contoh: AJI BAGUS KHOIRI, S.Pd., Gr."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="text-[11px] mt-1" style={{ color: '#334155' }}>
              Sertakan gelar pendidikan dan kepangkatan (bila ada)
            </p>
          </div>

          {/* NIP */}
          <div>
            <label className="label" htmlFor="profil-nip">
              NIP{' '}
              <span className="text-[10px] font-normal" style={{ color: '#475569' }}>
                (opsional — khusus ASN)
              </span>
            </label>
            <input
              id="profil-nip"
              type="text"
              inputMode="numeric"
              className="input-field"
              placeholder="Contoh: 199501012020121001"
              value={nip}
              onChange={(e) => setNip(e.target.value.replace(/\D/g, '').slice(0, 18))}
              maxLength={18}
            />
            <p className="text-[11px] mt-1" style={{ color: '#334155' }}>
              Angka saja, maksimal 18 digit. Kosongkan jika bukan ASN/non-NIP.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="text-sm px-3 py-2 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Batal
            </button>
            <button
              type="submit"
              id="save-profil-btn"
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan…</>
                : <><Save className="w-4 h-4" /> Simpan</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Settings Page ──────────────────────────────────────
export default function Settings() {
  const { profile } = useAuth()

  const [showEditProfil, setShowEditProfil] = useState(false)

  // Local weight state (UI only)
  const [weights, setWeights] = useState(
    CRITERIA.reduce((acc, c) => ({ ...acc, [c.key]: Math.round(c.weight * 100) }), {})
  )
  const totalWeight = Object.values(weights).reduce((s, v) => s + Number(v), 0)
  const weightOk    = totalWeight === 100

  // Auto-balance: when one slider moves, the remaining % is distributed
  // proportionally between the other two sliders so total is always 100.
  const handleWeightChange = (changedKey, rawVal) => {
    const newVal = Number(rawVal)
    const otherKeys = CRITERIA.map((c) => c.key).filter((k) => k !== changedKey)

    // How much is left for the other two
    const remaining = 100 - newVal

    // Get current sum of others
    const othersSum = otherKeys.reduce((s, k) => s + weights[k], 0)

    setWeights((prev) => {
      const next = { ...prev, [changedKey]: newVal }

      if (othersSum === 0) {
        // Split remaining equally if others are 0
        const each = Math.floor(remaining / otherKeys.length)
        otherKeys.forEach((k, i) => {
          next[k] = i === otherKeys.length - 1
            ? remaining - each * (otherKeys.length - 1)
            : each
        })
      } else {
        // Distribute proportionally
        let assigned = 0
        otherKeys.forEach((k, i) => {
          if (i === otherKeys.length - 1) {
            // Last one takes the rest to avoid rounding drift
            next[k] = remaining - assigned
          } else {
            const share = Math.round((prev[k] / othersSum) * remaining)
            next[k] = share
            assigned += share
          }
        })
      }

      return next
    })
  }

  const handleSaveWeights = () => {
    toast.success('Pengaturan bobot disimpan (simulasi) ✅')
  }

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6 min-w-0">

      {/* Edit Profil Modal */}
      {showEditProfil && (
        <EditProfilModal
          profile={profile}
          onClose={() => setShowEditProfil(false)}
          onSaved={() => setShowEditProfil(false)}
        />
      )}

      {/* Header */}
      <div className="animate-in">
        <h1 className="section-title flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6" style={{ color: '#d4af37' }} />
          Pengaturan Sistem
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>
          Konfigurasi bobot penilaian, akun, dan manajemen data
        </p>
      </div>

      {/* ── Profil Akun ── */}
      <SettingSection icon={User} title="Profil Akun" color="#6366f1">
        {/* Profile display */}
        <div
          className="flex items-center gap-4 p-4 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <Avatar name={profile?.name} size={14} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg truncate" style={{ color: '#f8fafc' }}>
              {profile?.name || '—'}
            </p>
            {profile?.nip && (
              <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#64748b' }}>
                <BadgeCheck className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                NIP {profile.nip}
              </p>
            )}
            <p className="text-sm mt-0.5" style={{ color: '#475569' }}>
              {profile?.email}
            </p>
            <span
              className="inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#d4af37',
              }}
            >
              Penguji / Guru PAI
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            id="edit-profil-btn"
            className="btn-primary flex items-center gap-2"
            onClick={() => setShowEditProfil(true)}
          >
            <Edit2 className="w-4 h-4" />
            Edit Profil
          </button>
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={() => toast('Fitur ganti password segera hadir', { icon: '🔒' })}
          >
            <Lock className="w-4 h-4" /> Ganti Password
          </button>
        </div>
      </SettingSection>

      {/* ── Bobot Penilaian ── */}
      <SettingSection icon={SlidersHorizontal} title="Bobot Penilaian" color="#d4af37">
        <p className="text-xs" style={{ color: '#475569' }}>
          Sesuaikan bobot per kriteria jika ada perubahan kebijakan kurikulum.
          Slider lain menyesuaikan otomatis agar selalu tepat 100%.
        </p>
        <div className="space-y-4">
          {CRITERIA.map((c) => (
            <div key={c.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold flex items-center gap-2"
                       style={{ color: '#cbd5e1' }}>
                  {c.icon} {c.label}
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className="text-base font-black tabular-nums"
                    style={{ color: weightOk ? '#d4af37' : weights[c.key] > 0 ? '#f59e0b' : '#475569' }}
                  >
                    {weights[c.key]}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={0} max={100} step={5}
                value={weights[c.key]}
                onChange={(e) => handleWeightChange(c.key, e.target.value)}
                className="w-full accent-yellow-400"
              />
            </div>
          ))}
        </div>

        {/* Total indicator */}
        <div
          className="flex items-center justify-between p-3 rounded-xl"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.25)',
          }}
        >
          <div>
            <span className="text-sm font-bold" style={{ color: '#94a3b8' }}>Total Bobot</span>
            <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>Otomatis diseimbangkan ke 100%</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
            <span className="text-lg font-black" style={{ color: '#10b981' }}>
              {totalWeight}%
            </span>
          </div>
        </div>
        <button
          onClick={handleSaveWeights}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Simpan Bobot
        </button>
      </SettingSection>

      {/* ── Keamanan ── */}
      <SettingSection icon={Shield} title="Keamanan" color="#ef4444">
        <div className="space-y-3">
          {[
            { label: 'Autentikasi Dua Faktor (2FA)', desc: 'Tambah lapisan keamanan ekstra pada login' },
            { label: 'Log Aktivitas Login',          desc: 'Riwayat semua sesi masuk akun' },
          ].map(({ label, desc }) => (
            <div
              key={label}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{desc}</p>
              </div>
              <ComingSoonBadge />
            </div>
          ))}
        </div>
      </SettingSection>
    </div>
  )
}
