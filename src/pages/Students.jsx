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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Users className="w-6 h-6 text-gold-400" />
            Data Murid
          </h1>
          <p className="text-sm text-islamic-400 mt-1">
            {totalCount} murid terdaftar
          </p>
        </div>
        <button
          id="add-student-btn"
          onClick={openAdd}
          className="btn-primary flex items-center gap-2"
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

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-islamic-500 animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-islamic-700 mx-auto mb-3" />
            <p className="text-islamic-500">
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
                <tr className="border-b border-islamic-800/60">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-islamic-500 uppercase tracking-wider">No</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-islamic-500 uppercase tracking-wider">Nama</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-islamic-500 uppercase tracking-wider">Kelas</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-islamic-500 uppercase tracking-wider">NISN</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-islamic-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-islamic-800/40">
                {students.map((s, i) => (
                  <tr key={s.id} id={`student-row-${s.id}`} className="hover:bg-islamic-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-islamic-500">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-islamic-600 to-islamic-800
                                        flex items-center justify-center text-xs font-bold text-gold-300 flex-shrink-0">
                          {s.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-islamic-100">{s.nama}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-islamic-300">{s.kelas}</td>
                    <td className="px-5 py-3.5 text-islamic-400 font-mono text-xs">{s.nisn || '-'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          id={`edit-student-${s.id}`}
                          onClick={() => openEdit(s)}
                          className="p-2 rounded-lg bg-islamic-800/60 text-islamic-400 hover:text-islamic-100
                                     hover:bg-islamic-700/60 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-student-${s.id}`}
                          onClick={() => setDeleteTarget(s)}
                          className="p-2 rounded-lg bg-red-900/30 text-red-500 hover:text-red-300
                                     hover:bg-red-800/40 transition-colors"
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
    </div>
  )
}
