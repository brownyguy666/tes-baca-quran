import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { CRITERIA } from '../utils/scoring'
import {
  SlidersHorizontal, User, Shield, Upload,
  Bell, ChevronRight, Lock, Users, FileSpreadsheet,
  CheckCircle, Construction,
} from 'lucide-react'
import toast from 'react-hot-toast'

function SettingSection({ icon: Icon, title, color = '#d4af37', children }) {
  return (
    <div className="card p-5 space-y-4 animate-in">
      <h2 className="font-bold flex items-center gap-2.5"
          style={{ color: '#e2e8f0' }}>
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

export default function Settings() {
  const { profile } = useAuth()

  // Local weight state (UI only — Supabase integration coming soon)
  const [weights, setWeights] = useState(
    CRITERIA.reduce((acc, c) => ({ ...acc, [c.key]: Math.round(c.weight * 100) }), {})
  )
  const totalWeight = Object.values(weights).reduce((s, v) => s + Number(v), 0)
  const weightOk    = totalWeight === 100

  const handleWeightChange = (key, val) => {
    setWeights((prev) => ({ ...prev, [key]: Number(val) }))
  }

  const handleSaveWeights = () => {
    if (!weightOk) {
      toast.error(`Total bobot harus 100% (saat ini ${totalWeight}%)`)
      return
    }
    toast.success('Pengaturan bobot disimpan (simulasi) ✅')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-in">
        <h1 className="section-title flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6" style={{ color: '#d4af37' }} />
          Pengaturan System
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>
          Konfigurasi bobot penilaian, akun, dan manajemen data
        </p>
      </div>

      {/* ── Profil Akun ── */}
      <SettingSection icon={User} title="Profil Akun" color="#6366f1">
        <div
          className="flex items-center gap-4 p-4 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg,rgba(212,175,55,0.35),rgba(212,175,55,0.12))',
              border: '2px solid rgba(212,175,55,0.45)',
              color: '#d4af37',
            }}
          >
            {(profile?.name || 'G').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: '#f8fafc' }}>{profile?.name}</p>
            <p className="text-sm" style={{ color: '#475569' }}>{profile?.email}</p>
            <span
              className="inline-block mt-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
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
        <div className="flex gap-3 flex-wrap">
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={() => toast('Fitur edit profil segera hadir', { icon: '🔧' })}
          >
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
        <p className="text-sm" style={{ color: '#64748b' }}>
          Sesuaikan bobot per kriteria jika ada perubahan kebijakan kurikulum.
          Total bobot harus tepat 100%.
        </p>
        <div className="space-y-4">
          {CRITERIA.map((c) => (
            <div key={c.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold flex items-center gap-2"
                       style={{ color: '#cbd5e1' }}>
                  {c.icon} {c.label}
                </label>
                <span className="text-sm font-black" style={{ color: '#d4af37' }}>
                  {weights[c.key]}%
                </span>
              </div>
              <input
                type="range"
                min="5" max="70" step="5"
                value={weights[c.key]}
                onChange={(e) => handleWeightChange(c.key, e.target.value)}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Total indicator */}
        <div
          className="flex items-center justify-between p-3.5 rounded-xl"
          style={{
            background: weightOk ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
            border: `1px solid ${weightOk ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
          }}
        >
          <span className="text-sm font-semibold"
                style={{ color: weightOk ? '#34d399' : '#f87171' }}>
            {weightOk ? '✅' : '⚠️'} Total Bobot
          </span>
          <span className="text-xl font-black"
                style={{ color: weightOk ? '#34d399' : '#f87171' }}>
            {totalWeight}%
          </span>
        </div>

        <button
          className="btn-gold flex items-center gap-2"
          onClick={handleSaveWeights}
          disabled={!weightOk}
          id="save-weights-btn"
        >
          <CheckCircle className="w-4 h-4" /> Simpan Bobot
        </button>
      </SettingSection>

      {/* ── Manajemen Penguji ── */}
      <SettingSection icon={Users} title="Manajemen Akun Penguji" color="#3b82f6">
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <Construction className="w-5 h-5 flex-shrink-0" style={{ color: '#f59e0b' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#fcd34d' }}>
              Fitur dalam pengembangan
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              Manajemen multi-user (tambah / edit / hapus penguji) akan tersedia
              pada update berikutnya.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 opacity-50 pointer-events-none select-none">
          {['Tambah Akun Penguji', 'Atur Hak Akses per Kelas', 'Riwayat Login'].map((label) => (
            <div
              key={label}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-sm" style={{ color: '#475569' }}>{label}</span>
              <div className="flex items-center gap-2">
                <ComingSoonBadge />
                <ChevronRight className="w-4 h-4" style={{ color: '#334155' }} />
              </div>
            </div>
          ))}
        </div>
      </SettingSection>

      {/* ── Import Data ── */}
      <SettingSection icon={FileSpreadsheet} title="Import & Kenaikan Kelas" color="#10b981">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Import Murid via CSV/Excel', desc: 'Upload file untuk tambah murid massal', icon: Upload },
            { label: 'Kenaikan Kelas Massal', desc: 'Naikkan kelas semua murid sekaligus', icon: Users },
          ].map(({ label, desc, icon: Icon }) => (
            <div
              key={label}
              className="p-4 rounded-xl cursor-not-allowed opacity-60"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" style={{ color: '#10b981' }} />
                <p className="text-sm font-semibold" style={{ color: '#6ee7b7' }}>{label}</p>
                <ComingSoonBadge />
              </div>
              <p className="text-xs" style={{ color: '#475569' }}>{desc}</p>
            </div>
          ))}
        </div>
      </SettingSection>

      {/* ── Notifikasi ── */}
      <SettingSection icon={Bell} title="Notifikasi" color="#8b5cf6">
        <div className="space-y-3 opacity-60 pointer-events-none">
          {[
            'Notifikasi saat ada tes baru',
            'Pengingat murid belum dites bulan ini',
            'Laporan mingguan via email',
          ].map((item) => (
            <div key={item}
                 className="flex items-center justify-between p-3 rounded-xl"
                 style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-sm" style={{ color: '#475569' }}>{item}</span>
              <div className="flex items-center gap-2">
                <ComingSoonBadge />
                <div className="w-10 h-5 rounded-full" style={{ background: '#1e293b', border: '1px solid #334155' }} />
              </div>
            </div>
          ))}
        </div>
      </SettingSection>

      <p className="text-xs text-center pb-4 animate-in" style={{ color: '#1e293b' }}>
        Sistem Penilaian Baca Al-Quran · SMP Negeri 2 Glagah · v2.0
      </p>
    </div>
  )
}
