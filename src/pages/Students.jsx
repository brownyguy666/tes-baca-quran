import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit2, Trash2, X, Loader2, Users, Search, Save, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = { nama: '', kelas: '', nisn: '' }
const PAGE_SIZE = 20

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in">
      <div className="card w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-islamic-100 font-display">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-islamic-500 hover:text-islamic-200 hover:bg-islamic-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function StudentForm({ form, onChange, onSubmit, onCancel, loading, isEdit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" id="student-form">
      <div>
        <label className="label" htmlFor="student-nama">Nama Lengkap *</label>
        <input
          id="student-nama"
          type="text"
          className="input-field"
          placeholder="Nama lengkap murid"
          value={form.nama}
          onChange={(e) => onChange({ ...form, nama: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="student-kelas">Kelas *</label>
        <input
          id="student-kelas"
          type="text"
          className="input-field"
          placeholder="Contoh: VII A, VIII B"
          value={form.kelas}
          onChange={(e) => onChange({ ...form, kelas: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="student-nisn">NISN</label>
        <input
          id="student-nisn"
          type="text"
          className="input-field"
          placeholder="Nomor Induk Siswa Nasional (opsional)"
          value={form.nisn}
          onChange={(e) => onChange({ ...form, nisn: e.target.value })}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          id="student-form-cancel-btn"
          onClick={onCancel}
          className="btn-secondary flex-1"
          disabled={loading}
        >
          Batal
        </button>
        <button
          type="submit"
          id="student-form-submit-btn"
          className="btn-primary flex-1 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Simpan Perubahan' : 'Tambah Murid'}
        </button>
      </div>
    </form>
  )
}

function DeleteConfirmModal({ student, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Hapus Murid" onClose={onCancel}>
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-900/40 border border-red-700/50 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p className="text-islamic-200 font-medium">Hapus data murid ini?</p>
          <p className="text-islamic-400 text-sm mt-1">
            <span className="font-semibold text-islamic-200">{student.nama}</span> beserta semua riwayat tesnya
            akan dihapus secara permanen.
          </p>
        </div>
        <div className="flex gap-3">
          <button id="delete-cancel-btn" onClick={onCancel} className="btn-secondary flex-1" disabled={loading}>Batal</button>
          <button
            id="delete-confirm-btn"
            onClick={onConfirm}
            className="btn-danger flex-1 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Hapus
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function Students() {
  const [students, setStudents]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Pagination
  const [page, setPage]           = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // Modal states
  const [showAdd, setShowAdd]           = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formLoading, setFormLoading]   = useState(false)
  const [form, setForm]                 = useState(EMPTY_FORM)

  // Debounce search input → debouncedSearch (350ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  // Reset ke halaman 1 setiap kali kata kunci pencarian berubah
  useEffect(() => { setPage(1) }, [debouncedSearch])

  // Fetch ulang setiap kali halaman atau kata kunci (yang sudah di-debounce) berubah
  useEffect(() => { fetchStudents(page, debouncedSearch) }, [page, debouncedSearch])

  // Query murid dari server dengan pagination (.range) + pencarian (.ilike di server,
  // bukan filter array di client) supaya cuma PAGE_SIZE baris yang ditarik per request,
  // berapa pun total murid yang terdaftar.
  const fetchStudents = async (targetPage, term) => {
    setLoading(true)
    const from = (targetPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('murid').select('*', { count: 'exact' }).order('nama')

    const t = term.trim()
    if (t) {
      query = query.or(`nama.ilike.%${t}%,kelas.ilike.%${t}%,nisn.ilike.%${t}%`)
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      toast.error('Gagal memuat data murid')
    } else {
      setStudents(data || [])
      setTotalCount(count || 0)
    }
    setLoading(false)
  }

  const openAdd = () => { setForm(EMPTY_FORM); setShowAdd(true) }
  const openEdit = (s) => { setForm({ nama: s.nama, kelas: s.kelas, nisn: s.nisn || '' }); setEditTarget(s) }
  const closeAll = () => { setShowAdd(false); setEditTarget(null); setDeleteTarget(null); setForm(EMPTY_FORM) }

  const handleAdd = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    const { error } = await supabase.from('murid').insert([{ ...form }])
    setFormLoading(false)
    if (error) {
      if (error.code === '23505') toast.error('NISN sudah digunakan')
      else toast.error('Gagal menambah murid')
    } else {
      toast.success(`Murid "${form.nama}" berhasil ditambahkan`)
      closeAll()
      // Murid baru bisa jatuh di halaman berapa saja secara alfabetis,
      // jadi paling aman balik ke halaman 1 dan bersihkan pencarian.
      setSearch('')
      if (page === 1 && debouncedSearch === '') fetchStudents(1, '')
      else setPage(1)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    const { error } = await supabase.from('murid').update({ ...form }).eq('id', editTarget.id)
    setFormLoading(false)
    if (error) {
      if (error.code === '23505') toast.error('NISN sudah digunakan')
      else toast.error('Gagal menyimpan perubahan')
    } else {
      toast.success('Data murid diperbarui')
      closeAll()
      fetchStudents(page, debouncedSearch)
    }
  }

  const handleDelete = async () => {
    setFormLoading(true)
    const { error } = await supabase.from('murid').delete().eq('id', deleteTarget.id)
    setFormLoading(false)
    if (error) {
      toast.error('Gagal menghapus murid')
    } else {
      toast.success(`Murid "${deleteTarget.nama}" dihapus`)
      closeAll()
      // Kalau murid yang dihapus itu satu-satunya di halaman ini (dan bukan
      // halaman pertama), mundur satu halaman biar gak nampilin halaman kosong.
      if (students.length === 1 && page > 1) setPage(page - 1)
      else fetchStudents(page, debouncedSearch)
    }
  }

  const from = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, totalCount)

  return (
    <div className="max-w-5xl w-full mx-auto space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Users className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#d4af37' }} />
            Data Murid
          </h1>
          <p className="text-xs md:text-sm mt-0.5" style={{ color: '#475569' }}>
            {totalCount} murid terdaftar
          </p>
        </div>
        {/* Desktop add button — mobile uses FAB */}
        <button
          id="add-student-btn"
          onClick={openAdd}
          className="btn-primary hidden sm:flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Murid
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-islamic-500" />
        <input
          id="search-students-input"
          type="text"
          placeholder="Cari nama, kelas, atau NISN…"
          className="input-field pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Mobile Card List (hidden on md+) */}
      {!loading && students.length > 0 && (
        <div className="block md:hidden space-y-3">
          {students.map((s, i) => (
            <div
              key={s.id}
              id={`student-card-mobile-${s.id}`}
              className="card p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(79,70,229,0.4))',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: '#a5b4fc',
                  }}
                >
                  {s.nama.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: '#e2e8f0' }}>{s.nama}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                    Kelas {s.kelas} {s.nisn ? `· NISN: ${s.nisn}` : ''}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    id={`edit-student-${s.id}`}
                    onClick={() => openEdit(s)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: 'rgba(30,41,59,0.8)', color: '#94a3b8' }}
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    id={`delete-student-${s.id}`}
                    onClick={() => setDeleteTarget(s)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: 'rgba(190,18,60,0.2)', color: '#f87171' }}
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden md:block card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#475569' }} />
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 mx-auto mb-3" style={{ color: '#334155' }} />
            <p style={{ color: '#64748b' }}>
              {debouncedSearch ? 'Tidak ada murid yang cocok' : 'Belum ada murid terdaftar'}
            </p>
            {!debouncedSearch && (
              <button onClick={openAdd} className="btn-primary mt-4 inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Murid Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>No</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>Nama</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>Kelas</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>NISN</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} id={`student-row-${s.id}`}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30,41,59,0.5)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}
                  >
                    <td className="px-5 py-3.5" style={{ color: '#475569' }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                             style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(79,70,229,0.35))', color: '#a5b4fc' }}>
                          {s.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: '#e2e8f0' }}>{s.nama}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: '#cbd5e1' }}>{s.kelas}</td>
                    <td className="px-5 py-3.5 font-mono text-xs" style={{ color: '#64748b' }}>{s.nisn || '-'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          id={`edit-student-${s.id}`}
                          onClick={() => openEdit(s)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ background: 'rgba(30,41,59,0.8)', color: '#94a3b8' }}
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-student-${s.id}`}
                          onClick={() => setDeleteTarget(s)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ background: 'rgba(190,18,60,0.2)', color: '#f87171' }}
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile: empty state when no students */}
      {!loading && students.length === 0 && (
        <div className="block md:hidden card p-10 text-center">
          <Users className="w-10 h-10 mx-auto mb-3" style={{ color: '#334155' }} />
          <p style={{ color: '#64748b' }}>
            {debouncedSearch ? 'Tidak ada murid yang cocok' : 'Belum ada murid terdaftar'}
          </p>
        </div>
      )}

      {/* Mobile loading */}
      {loading && (
        <div className="block md:hidden flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#475569' }} />
        </div>
      )}

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-islamic-500">
            Menampilkan {from}–{to} dari {totalCount} murid
          </p>
          <div className="flex items-center gap-2">
            <button
              id="students-prev-page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-secondary p-2 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-islamic-300 px-2">
              Halaman {page} dari {totalPages}
            </span>
            <button
              id="students-next-page-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-secondary p-2 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Halaman berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Tambah Murid Baru" onClose={closeAll}>
          <StudentForm
            form={form}
            onChange={setForm}
            onSubmit={handleAdd}
            onCancel={closeAll}
            loading={formLoading}
            isEdit={false}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <Modal title={`Edit — ${editTarget.nama}`} onClose={closeAll}>
          <StudentForm
            form={form}
            onChange={setForm}
            onSubmit={handleEdit}
            onCancel={closeAll}
            loading={formLoading}
            isEdit
          />
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          student={deleteTarget}
          onConfirm={handleDelete}
          onCancel={closeAll}
          loading={formLoading}
        />
      )}

      {/* Mobile FAB: Tambah Murid */}
      <button
        id="add-student-fab"
        onClick={openAdd}
        className="fab"
        aria-label="Tambah Murid"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  )
}
