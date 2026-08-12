import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LEVELS } from '../utils/scoring'
import {
  Users, ClipboardList, TrendingUp, Plus, Search,
  ChevronRight, Calendar, Star, BookOpen, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, sub, color = 'islamic' }) {
  const colors = {
    islamic: 'from-islamic-700/50 to-islamic-900/50 border-islamic-600/40 text-islamic-300',
    gold:    'from-gold-800/30 to-gold-900/40 border-gold-600/30 text-gold-300',
    blue:    'from-blue-900/40 to-blue-950/50 border-blue-700/30 text-blue-300',
  }
  return (
    <div className={`card p-5 bg-gradient-to-br ${colors[color]} animate-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{label}</p>
          <p className="text-3xl font-bold text-islamic-50">{value}</p>
          {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
        </div>
        <div className="p-3 rounded-xl bg-white/10">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function LevelBadge({ level }) {
  const l = LEVELS.find((x) => x.label === level)
  const colorMap = {
    'Mumtaz (Tartil)': 'bg-amber-900/50 text-amber-300 border-amber-700',
    'Mahir':           'bg-green-900/50 text-green-300 border-green-700',
    'Menengah':        'bg-orange-900/40 text-orange-300 border-orange-700',
    'Dasar':           'bg-blue-900/40 text-blue-300 border-blue-700',
    'Pemula':          'bg-gray-800/60 text-gray-300 border-gray-700',
  }
  const cls = colorMap[level] || 'bg-gray-800/60 text-gray-300 border-gray-700'
  return (
    <span className={`badge-level border ${cls}`}>
      <span>{l?.emoji || '📚'}</span>
      <span>{level || '-'}</span>
    </span>
  )
}

function StudentCard({ murid, lastTest }) {
  const navigate = useNavigate()
  return (
    <div
      className="card card-hover cursor-pointer p-5 flex flex-col gap-3 animate-in"
      onClick={() => navigate(`/students/${murid.id}/history`)}
      id={`student-card-${murid.id}`}
    >
      {/* Avatar + name */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-islamic-600 to-islamic-800
                        flex items-center justify-center flex-shrink-0 text-base font-bold text-gold-300">
          {murid.nama.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-islamic-100 truncate">{murid.nama}</p>
          <p className="text-xs text-islamic-400">Kelas {murid.kelas} · NISN {murid.nisn || '-'}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-islamic-600 flex-shrink-0 mt-1" />
      </div>

      {/* Last test info */}
      {lastTest ? (
        <div className="bg-islamic-950/40 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <LevelBadge level={lastTest.level} />
            <span className="text-xl font-bold text-islamic-100">{lastTest.skor_total}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-islamic-500">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(lastTest.tanggal_tes).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-islamic-950/30 rounded-xl p-3 text-center">
          <p className="text-xs text-islamic-600 italic">Belum ada tes</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Link
          to={`/test/new?murid=${murid.id}`}
          id={`test-new-btn-${murid.id}`}
          className="btn-primary flex-1 text-center text-xs py-2"
        >
          Tes Baru
        </Link>
        <Link
          to={`/students/${murid.id}/history`}
          id={`history-btn-${murid.id}`}
          className="btn-secondary flex-1 text-center text-xs py-2"
        >
          Riwayat
        </Link>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [students, setStudents]     = useState([])
  const [lastTests, setLastTests]   = useState({})   // murid_id → latest hasil_tes
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [stats, setStats]           = useState({ total: 0, tesHariIni: 0, rataRata: '-' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: muridData, error: muridErr }, { data: tesData, error: tesErr }] =
      await Promise.all([
        supabase.from('murid').select('*').order('nama'),
        supabase.from('hasil_tes').select('*').order('tanggal_tes', { ascending: false }),
      ])

    if (muridErr || tesErr) {
      toast.error('Gagal memuat data')
      setLoading(false)
      return
    }

    setStudents(muridData || [])

    // Map last test per murid
    const lastMap = {}
    for (const tes of (tesData || [])) {
      if (!lastMap[tes.murid_id]) lastMap[tes.murid_id] = tes
    }
    setLastTests(lastMap)

    // Compute stats
    const today = new Date().toISOString().split('T')[0]
    const tesHariIni = (tesData || []).filter((t) => t.tanggal_tes === today).length
    const allScores = (tesData || []).map((t) => t.skor_total).filter(Boolean)
    const avg = allScores.length
      ? (allScores.reduce((s, v) => s + v, 0) / allScores.length).toFixed(1)
      : '-'
    setStats({ total: muridData?.length || 0, tesHariIni, rataRata: avg })

    setLoading(false)
  }

  const filtered = students.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    (s.kelas || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.nisn || '').includes(search)
  )

  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : 'Selamat Sore'

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-in">
        <div className="divider-ornament text-[10px] text-gold-600/50 font-arabic mb-2">
          الحمد لله
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="section-title text-2xl">
              {greeting}, {profile?.name} 👋
            </h1>
            <p className="text-sm text-islamic-400 mt-1">
              Sistem Penilaian Baca Al-Quran · SMP Negeri 2 Glagah
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/students" id="manage-students-btn" className="btn-secondary flex items-center gap-2">
              <Users className="w-4 h-4" />
              Kelola Murid
            </Link>
            <Link to="/test/new" id="new-test-btn" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tes Baru
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users}         label="Total Murid"   value={stats.total}       sub="Terdaftar"           color="islamic" />
        <StatCard icon={ClipboardList} label="Tes Hari Ini"  value={stats.tesHariIni}  sub="Penilaian dilakukan" color="blue"    />
        <StatCard icon={TrendingUp}    label="Rata-rata Skor" value={stats.rataRata}   sub="Dari semua tes"      color="gold"    />
      </div>

      {/* Search + List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h2 className="section-title flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold-400" />
            Daftar Murid
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-islamic-500" />
            <input
              id="search-students-input"
              type="text"
              placeholder="Cari nama, kelas, NISN…"
              className="input-field pl-10 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-islamic-500 animate-spin" />
              <p className="text-sm text-islamic-500">Memuat data murid…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen className="w-12 h-12 text-islamic-700 mx-auto mb-3" />
            <p className="text-islamic-400 font-medium">
              {search ? 'Murid tidak ditemukan' : 'Belum ada data murid'}
            </p>
            {!search && (
              <Link to="/students" className="btn-primary inline-flex items-center gap-2 mt-4">
                <Plus className="w-4 h-4" /> Tambah Murid Pertama
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((murid) => (
              <StudentCard key={murid.id} murid={murid} lastTest={lastTests[murid.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
