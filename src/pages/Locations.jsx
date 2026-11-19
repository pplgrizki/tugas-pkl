import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Pencil, Trash2, X, Save } from 'lucide-react'

function Locations() {
  const [locations, setLocations] = useState([])
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
    loadLocations()
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

  async function loadLocations() {
    setLoading(true)
    setErrorMessage('')

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      setErrorMessage('Gagal memuat data lokasi.')
    } else {
      setLocations(data || [])
    }

    setLoading(false)
  }

  async function recordActivity(action, location) {
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
        entity_type: 'location',
        entity_id: location.id,
        details: {
          name: location.name,
        },
      })

    return error?.message || null
  }

  function openForm(location = null) {
    if (!canManage) return

    setMessage('')
    setErrorMessage('')

    if (location) {
      setEditingId(location.id)
      setForm({
        name: location.name || '',
        description: location.description || '',
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
      setErrorMessage('Nama lokasi wajib diisi.')
      return
    }

    setSaving(true)
    setMessage('')
    setErrorMessage('')

    const locationData = {
      name: form.name.trim(),
      description: form.description.trim() || null,
    }

    const wasEditing = Boolean(editingId)

    const result = wasEditing
      ? await supabase
          .from('locations')
          .update(locationData)
          .eq('id', editingId)
          .select('id')
          .single()
      : await supabase
          .from('locations')
          .insert([locationData])
          .select('id')
          .single()

    if (result.error) {
      setErrorMessage(
        'Lokasi gagal disimpan. Periksa kembali nama lokasi atau hak akses akun.'
      )
      setSaving(false)
      return
    }

    const savedLocation = {
      id: result.data.id,
      ...locationData,
    }

    const logError = await recordActivity(
      wasEditing ? 'update' : 'create',
      savedLocation
    )

    closeForm()
    await loadLocations()

    setMessage(
      wasEditing
        ? 'Lokasi berhasil diperbarui.'
        : 'Lokasi berhasil ditambahkan.'
    )

    if (logError) {
      setErrorMessage(
        'Lokasi berhasil disimpan, tetapi riwayat aktivitas gagal dicatat.'
      )
    }

    setSaving(false)
  }

  async function handleDelete(location) {
    if (!canManage) return

    const confirmed = window.confirm(
      `Yakin ingin menghapus lokasi "${location.name}"?`
    )

    if (!confirmed) return

    setMessage('')
    setErrorMessage('')

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', location.id)

    if (error) {
      setErrorMessage(
        'Lokasi tidak dapat dihapus. Pastikan lokasi ini tidak sedang digunakan oleh data aset.'
      )
      return
    }

    const logError = await recordActivity('delete', location)

    setMessage('Lokasi berhasil dihapus.')

    if (logError) {
      setErrorMessage(
        'Lokasi berhasil dihapus, tetapi riwayat aktivitas gagal dicatat.'
      )
    }

    await loadLocations()
  }

  const filteredLocations = locations.filter((location) => {
    const keyword = search.toLowerCase()

    return (
      (location.name || '').toLowerCase().includes(keyword) ||
      (location.description || '').toLowerCase().includes(keyword)
    )
  })

  return (
    <section className="assets-page">
      <div className="assets-heading">
        <div>
          <span className="eyebrow">PENGELOLAAN DATA</span>
          <h2>Data Lokasi</h2>
          <p>Daftar tempat penyimpanan aset sekolah.</p>
        </div>

        {canManage && (
          <button
            className="primary-button"
            onClick={() => openForm()}
          >
            <Plus size={18} />
            Tambah Lokasi
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
            placeholder="Cari nama atau deskripsi lokasi..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <span className="assets-count">
          Total: {locations.length} lokasi
        </span>
      </div>

      <div className="assets-table-card">
        <div className="table-responsive">
          <table className="assets-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Lokasi</th>
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
                    Memuat data lokasi...
                  </td>
                </tr>
              ) : filteredLocations.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 4 : 3}
                    className="empty-table"
                  >
                    Tidak ada lokasi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredLocations.map((location, index) => (
                  <tr key={location.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{location.name}</strong>
                    </td>
                    <td>{location.description || '-'}</td>

                    {canManage && (
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button edit"
                            title="Edit lokasi"
                            onClick={() => openForm(location)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="icon-button delete"
                            title="Hapus lokasi"
                            onClick={() => handleDelete(location)}
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
                  {editingId ? 'Edit Lokasi' : 'Tambah Lokasi'}
                </h2>
                <p>Lengkapi informasi lokasi penyimpanan aset.</p>
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
                  <label htmlFor="location-name">
                    Nama Lokasi *
                  </label>
                  <input
                    id="location-name"
                    type="text"
                    placeholder="Contoh: Ruang Laboratorium"
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
                  <label htmlFor="location-description">
                    Deskripsi
                  </label>
                  <textarea
                    id="location-description"
                    rows="4"
                    placeholder="Masukkan keterangan lokasi..."
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
                  {saving ? 'Menyimpan...' : 'Simpan Lokasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Locations
