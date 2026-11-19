import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Pencil, Trash2, X, Save } from 'lucide-react'

function Categories() {
  const [categories, setCategories] = useState([])
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
  })

  const canManage = role === 'admin' || role === 'asset_staff'

  useEffect(() => {
    loadCategories()
    loadRole()
  }, [])

  async function loadRole() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      setRole(data.role)
    }
  }

  async function recordActivity(action, category) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return 'Informasi pengguna tidak ditemukan.'
    }

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        actor_id: user.id,
        action,
        entity_type: 'category',
        entity_id: category.id,
        details: {
          name: category.name,
        },
      })

    return error?.message || null
  }

  async function loadCategories() {
    setLoading(true)
    setErrorMessage('')

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      setErrorMessage('Gagal memuat data kategori.')
    } else {
      setCategories(data || [])
    }

    setLoading(false)
  }

  function openForm(category = null) {
    if (!canManage) return

    setMessage('')
    setErrorMessage('')

    if (category) {
      setEditingId(category.id)
      setForm({
        name: category.name || '',
        description: category.description || '',
      })
    } else {
      setEditingId(null)
      setForm({
        name: '',
        description: '',
      })
    }

    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({
      name: '',
      description: '',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!canManage) return

    if (!form.name.trim()) {
      setErrorMessage('Nama kategori wajib diisi.')
      return
    }

    setSaving(true)
    setMessage('')
    setErrorMessage('')

    const categoryData = {
      name: form.name.trim(),
      description: form.description.trim() || null,
    }

    const wasEditing = Boolean(editingId)

    const result = wasEditing
      ? await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingId)
          .select('id')
          .single()
      : await supabase
          .from('categories')
          .insert([categoryData])
          .select('id')
          .single()

    if (result.error) {
      setErrorMessage(
        'Kategori gagal disimpan. Periksa kembali nama kategori atau hak akses akun.'
      )
      setSaving(false)
      return
    }

    const savedCategory = {
      id: result.data.id,
      ...categoryData,
    }

    const logError = await recordActivity(
      wasEditing ? 'update' : 'create',
      savedCategory
    )

    closeForm()
    await loadCategories()

    setMessage(
      wasEditing
        ? 'Kategori berhasil diperbarui.'
        : 'Kategori berhasil ditambahkan.'
    )

    if (logError) {
      setErrorMessage(
        'Kategori berhasil disimpan, tetapi riwayat aktivitas gagal dicatat.'
      )
    }

    setSaving(false)
  }

  async function handleDelete(category) {
    if (!canManage) return

    const confirmed = window.confirm(
      `Yakin ingin menghapus kategori "${category.name}"?`
    )

    if (!confirmed) return

    setMessage('')
    setErrorMessage('')

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)

    if (error) {
      setErrorMessage(
        'Kategori tidak dapat dihapus. Pastikan kategori ini tidak sedang digunakan oleh data aset.'
      )
      return
    }

    const logError = await recordActivity('delete', category)

    setMessage('Kategori berhasil dihapus.')

    if (logError) {
      setErrorMessage(
        'Kategori berhasil dihapus, tetapi riwayat aktivitas gagal dicatat.'
      )
    }

    await loadCategories()
  }

  const filteredCategories = categories.filter((category) => {
    const keyword = search.toLowerCase()

    return (
      (category.name || '').toLowerCase().includes(keyword) ||
      (category.description || '').toLowerCase().includes(keyword)
    )
  })

  return (
    <section className="assets-page">
      <div className="assets-heading">
        <div>
          <span className="eyebrow">PENGELOLAAN DATA</span>
          <h2>Data Kategori</h2>
          <p>Daftar kelompok kategori inventaris sekolah.</p>
        </div>

        {canManage && (
          <button
            className="primary-button"
            onClick={() => openForm()}
          >
            <Plus size={18} />
            Tambah Kategori
          </button>
        )}
      </div>

      {message && (
        <div className="success-message">{message}</div>
      )}

      {errorMessage && (
        <div className="login-error">{errorMessage}</div>
      )}

      <div className="assets-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Cari nama atau deskripsi kategori..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <span className="assets-count">
          Total: {categories.length} kategori
        </span>
      </div>

      <div className="assets-table-card">
        <div className="table-responsive">
          <table className="assets-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Kategori</th>
                <th>Deskripsi</th>
                {canManage && <th>Aksi</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={canManage ? 4 : 3}
                    className="empty-table"
                  >
                    Memuat data kategori...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 4 : 3}
                    className="empty-table"
                  >
                    Tidak ada kategori ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category, index) => (
                  <tr key={category.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{category.name}</strong>
                    </td>
                    <td>{category.description || '-'}</td>

                    {canManage && (
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button edit"
                            title="Edit kategori"
                            onClick={() => openForm(category)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="icon-button delete"
                            title="Hapus kategori"
                            onClick={() => handleDelete(category)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && canManage && (
        <div className="modal-overlay">
          <div className="asset-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingId ? 'Edit Kategori' : 'Tambah Kategori'}
                </h2>
                <p>Lengkapi informasi kategori inventaris.</p>
              </div>

              <button
                className="close-button"
                onClick={closeForm}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="asset-form-grid">
                <div className="form-field full-width">
                  <label htmlFor="category-name">
                    Nama Kategori *
                  </label>
                  <input
                    id="category-name"
                    type="text"
                    placeholder="Contoh: Elektronik"
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="category-description">
                    Deskripsi
                  </label>
                  <textarea
                    id="category-description"
                    rows="4"
                    placeholder="Masukkan keterangan kategori..."
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Categories
