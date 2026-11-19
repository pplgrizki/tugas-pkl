import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Pencil, Trash2, X, Save } from 'lucide-react'

const initialForm = {
  asset_tag: '',
  name: '',
  category_id: '',
  location_id: '',
  brand: '',
  model: '',
  serial_number: '',
  purchase_date: '',
  condition: 'good',
  notes: '',
}

function Assets() {
  const [assets, setAssets] = useState([])
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [role, setRole] = useState(null)

  const canManage = role === 'admin' || role === 'asset_staff'

  useEffect(() => {
    loadData()
  }, [])

  async function recordActivity(action, asset) {
    const { data: { user }, error: userError } =
      await supabase.auth.getUser()

    if (userError || !user) {
      return 'Tidak dapat mengambil informasi pengguna.'
    }

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        actor_id: user.id,
        action,
        entity_type: 'asset',
        entity_id: asset.id,
        details: {
          asset_tag: asset.asset_tag,
          name: asset.name,
        },
      })

    return error?.message || null
  }

  async function loadData() {
    setLoading(true)
    setErrorMessage('')

    const { data: { user }, error: userError } =
      await supabase.auth.getUser()

    if (userError || !user) {
      setErrorMessage('Tidak dapat mengambil informasi akun.')
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile) {
      setErrorMessage('Informasi hak akses akun tidak ditemukan.')
      setLoading(false)
      return
    }

    setRole(profile.role)

    const [assetResult, categoryResult, locationResult] = await Promise.all([
      supabase.from('assets').select('*').order('id', { ascending: false }),
      supabase.from('categories').select('id, name').order('name'),
      supabase.from('locations').select('id, name').order('name'),
    ])

    if (assetResult.error || categoryResult.error || locationResult.error) {
      setErrorMessage('Gagal memuat data. Silakan coba lagi.')
    } else {
      setAssets(assetResult.data || [])
      setCategories(categoryResult.data || [])
      setLocations(locationResult.data || [])
    }

    setLoading(false)
  }

  function openAddForm() {
    if (!canManage) return

    setForm(initialForm)
    setEditingId(null)
    setMessage('')
    setErrorMessage('')
    setShowForm(true)
  }

  function openEditForm(asset) {
    if (!canManage) return

    setForm({
      asset_tag: asset.asset_tag || '',
      name: asset.name || '',
      category_id: asset.category_id ? String(asset.category_id) : '',
      location_id: asset.location_id ? String(asset.location_id) : '',
      brand: asset.brand || '',
      model: asset.model || '',
      serial_number: asset.serial_number || '',
      purchase_date: asset.purchase_date || '',
      condition: asset.condition || 'good',
      notes: asset.notes || '',
    })

    setEditingId(asset.id)
    setMessage('')
    setErrorMessage('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(initialForm)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!canManage) {
      setErrorMessage('Anda tidak memiliki izin untuk mengelola aset.')
      return
    }

    setSaving(true)
    setMessage('')
    setErrorMessage('')

    const assetData = {
      asset_tag: form.asset_tag.trim(),
      name: form.name.trim(),
      category_id: form.category_id ? Number(form.category_id) : null,
      location_id: form.location_id ? Number(form.location_id) : null,
      brand: form.brand.trim() || null,
      model: form.model.trim() || null,
      serial_number: form.serial_number.trim() || null,
      purchase_date: form.purchase_date || null,
      condition: form.condition,
      notes: form.notes.trim() || null,
    }

    const result = editingId
      ? await supabase
          .from('assets')
          .update(assetData)
          .eq('id', editingId)
          .select('id')
          .single()
      : await supabase
          .from('assets')
          .insert(assetData)
          .select('id')
          .single()

    if (result.error) {
      setErrorMessage('Gagal menyimpan data aset. Periksa kembali data yang diisi.')
    } else {
      const savedAsset = {
        id: result.data.id,
        ...assetData,
      }

      const logError = await recordActivity(
        editingId ? 'update' : 'create',
        savedAsset
      )

      closeForm()
      await loadData()

      setMessage(
        editingId
          ? 'Data aset berhasil diperbarui.'
          : 'Aset berhasil ditambahkan.'
      )

      if (logError) {
        setErrorMessage(
          'Aset berhasil disimpan, tetapi riwayat aktivitas gagal dicatat: ' +
          logError
        )
      }
    }

    setSaving(false)
  }

  async function handleDelete(asset) {
    if (!canManage) {
      setErrorMessage('Anda tidak memiliki izin untuk menghapus aset.')
      return
    }

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus aset "${asset.name}"?`
    )

    if (!confirmed) return

    setErrorMessage('')
    setMessage('')

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', asset.id)

    if (error) {
      setErrorMessage('Gagal menghapus aset. Pastikan aset tidak sedang digunakan.')
    } else {
      const logError = await recordActivity('delete', asset)

      setMessage('Aset berhasil dihapus.')

      if (logError) {
        setErrorMessage(
          'Aset berhasil dihapus, tetapi riwayat aktivitas gagal dicatat: ' +
          logError
        )
      }

      await loadData()
    }
  }

  const filteredAssets = assets.filter((asset) => {
    const keyword = search.toLowerCase()

    return (
      (asset.asset_tag || '').toLowerCase().includes(keyword) ||
      (asset.name || '').toLowerCase().includes(keyword) ||
      (asset.brand || '').toLowerCase().includes(keyword) ||
      (asset.serial_number || '').toLowerCase().includes(keyword)
    )
  })

  function getCategoryName(id) {
    return categories.find((item) => item.id === id)?.name || '-'
  }

  function getLocationName(id) {
    return locations.find((item) => item.id === id)?.name || '-'
  }

  return (
    <div className="assets-page">
      <div className="assets-heading">
        <div>
          <span className="topbar-label">INVENTARIS SEKOLAH</span>
          <h2>Data Aset</h2>
          <p>Kelola dan lihat seluruh data inventaris yang dimiliki sekolah.</p>
        </div>

        {canManage && (
          <button className="primary-button" onClick={openAddForm}>
            <Plus size={18} />
            Tambah Aset
          </button>
        )}
      </div>

      {message && <div className="success-message">{message}</div>}
      {errorMessage && <div className="login-error">{errorMessage}</div>}

      <div className="assets-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Cari kode, nama, merek, atau nomor seri..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <span className="asset-count">
          {filteredAssets.length} aset ditemukan
        </span>
      </div>

      <div className="assets-table-card">
        {loading ? (
          <div className="table-empty">Sedang memuat data aset...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="table-empty">
            Belum ada data aset yang tersedia.
          </div>
        ) : (
          <div className="table-scroll">
            <table className="assets-table">
              <thead>
                <tr>
                  <th>Kode Aset</th>
                  <th>Nama Aset</th>
                  <th>Kategori</th>
                  <th>Lokasi</th>
                  <th>Kondisi</th>
                  {canManage && <th>Aksi</th>}
                </tr>
              </thead>

              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <strong>{asset.asset_tag}</strong>
                    </td>

                    <td>
                      <strong>{asset.name}</strong>
                      <small>
                        {[asset.brand, asset.model].filter(Boolean).join(' ') || 'Tanpa merek'}
                      </small>
                    </td>

                    <td>{getCategoryName(asset.category_id)}</td>
                    <td>{getLocationName(asset.location_id)}</td>

                    <td>
                      <span className={`condition-badge ${asset.condition}`}>
                        {asset.condition === 'good'
                          ? 'Baik'
                          : asset.condition === 'damaged'
                            ? 'Rusak'
                            : 'Perlu Perbaikan'}
                      </span>
                    </td>

                    {canManage && (
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button edit"
                            title="Ubah aset"
                            onClick={() => openEditForm(asset)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="icon-button delete"
                            title="Hapus aset"
                            onClick={() => handleDelete(asset)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && canManage && (
        <div className="modal-overlay">
          <section className="asset-modal">
            <div className="modal-heading">
              <div>
                <span className="topbar-label">FORMULIR INVENTARIS</span>
                <h2>{editingId ? 'Ubah Data Aset' : 'Tambah Aset Baru'}</h2>
              </div>

              <button className="icon-button" onClick={closeForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="asset-form-grid">
                <div className="form-field">
                  <label>Kode Aset *</label>
                  <input
                    name="asset_tag"
                    value={form.asset_tag}
                    onChange={handleChange}
                    placeholder="Contoh: AST-001"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Nama Aset *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Contoh: Laptop Lenovo"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Kategori</label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Lokasi</label>
                  <select
                    name="location_id"
                    value={form.location_id}
                    onChange={handleChange}
                  >
                    <option value="">Pilih lokasi</option>
                    {locations.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Merek</label>
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="Contoh: Lenovo"
                  />
                </div>

                <div className="form-field">
                  <label>Model</label>
                  <input
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    placeholder="Contoh: ThinkPad"
                  />
                </div>

                <div className="form-field">
                  <label>Nomor Seri</label>
                  <input
                    name="serial_number"
                    value={form.serial_number}
                    onChange={handleChange}
                    placeholder="Masukkan nomor seri perangkat"
                  />
                </div>

                <div className="form-field">
                  <label>Tanggal Pembelian</label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={form.purchase_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label>Kondisi</label>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                  >
                    <option value="good">Baik</option>
                    <option value="damaged">Rusak</option>
                    <option value="repair">Perlu Perbaikan</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label>Catatan</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Masukkan catatan tambahan tentang aset..."
                    rows="3"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="login-error">{errorMessage}</div>
              )}

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
                  {saving ? 'Sedang menyimpan...' : 'Simpan Aset'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default Assets
