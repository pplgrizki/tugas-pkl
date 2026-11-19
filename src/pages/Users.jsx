import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Pencil, X, Save } from 'lucide-react'

function Users() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [currentRole, setCurrentRole] = useState('')
  const [currentUserId, setCurrentUserId] = useState(null)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    role: 'teacher_staff',
    phone: '',
  })

  const roleNames = {
    admin: 'Admin',
    asset_staff: 'Petugas Aset',
    teacher_staff: 'Guru / Karyawan',
    principal: 'Kepala Sekolah',
  }

  const canManage = currentRole === 'admin'

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    setErrorMessage('')

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      setErrorMessage('Tidak dapat memeriksa akun yang sedang masuk.')
      setLoading(false)
      return
    }

    setCurrentUserId(authData.user.id)

    const { data: myProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !myProfile) {
      setErrorMessage('Gagal memeriksa hak akses akun.')
      setLoading(false)
      return
    }

    setCurrentRole(myProfile.role)

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, phone, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMessage('Gagal memuat data pengguna.')
    } else {
      setUsers(data || [])
    }

    setLoading(false)
  }

  async function recordActivity(userData) {
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
        action: 'update',
        entity_type: 'user',
        entity_id: null,
        details: {
          user_id: userData.id,
          full_name: userData.full_name,
          role: userData.role,
        },
      })

    return error?.message || null
  }

  function openForm(user) {
    if (!canManage) return

    setMessage('')
    setErrorMessage('')
    setEditingId(user.id)

    setForm({
      full_name: user.full_name || '',
      role: user.role || 'teacher_staff',
      phone: user.phone || '',
    })

    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)

    setForm({
      full_name: '',
      role: 'teacher_staff',
      phone: '',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!canManage) {
      setErrorMessage('Hanya Admin yang dapat mengubah data pengguna.')
      return
    }

    if (!form.full_name.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.')
      return
    }

    if (
      editingId === currentUserId &&
      form.role !== 'admin'
    ) {
      setErrorMessage(
        'Role akun Admin yang sedang digunakan tidak dapat diubah.'
      )
      return
    }

    setSaving(true)
    setMessage('')
    setErrorMessage('')

    const userData = {
      full_name: form.full_name.trim(),
      role: form.role,
      phone: form.phone.trim() || null,
    }

    const { error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', editingId)

    if (error) {
      setErrorMessage('Data pengguna gagal diperbarui.')
      setSaving(false)
      return
    }

    const logError = await recordActivity({
      id: editingId,
      full_name: userData.full_name,
      role: userData.role,
    })

    closeForm()
    await loadUsers()

    setMessage('Data pengguna berhasil diperbarui.')

    if (logError) {
      setErrorMessage(
        'Data berhasil diperbarui, tetapi riwayat aktivitas gagal dicatat.'
      )
    }

    setSaving(false)
  }

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase()

    return (
      (user.full_name || '').toLowerCase().includes(keyword) ||
      (roleNames[user.role] || '').toLowerCase().includes(keyword) ||
      (user.phone || '').toLowerCase().includes(keyword)
    )
  })

  return (
    <section className="assets-page">
      <div className="assets-heading">
        <div>
          <span className="eyebrow">PENGELOLAAN AKUN</span>
          <h2>Data Pengguna</h2>
          <p>Daftar pengguna dan hak akses aplikasi SAMS.</p>
        </div>
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
            placeholder="Cari nama, hak akses, atau nomor telepon..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <span className="assets-count">
          Total: {users.length} pengguna
        </span>
      </div>

      <div className="assets-table-card">
        <div className="table-responsive">
          <table className="assets-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Pengguna</th>
                <th>Nomor Telepon</th>
                <th>Hak Akses</th>
                {canManage && <th>Aksi</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={canManage ? 5 : 4}
                    className="empty-table"
                  >
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 5 : 4}
                    className="empty-table"
                  >
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{user.full_name || 'Tanpa Nama'}</strong>
                    </td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <span className="condition-badge">
                        {roleNames[user.role] || user.role}
                      </span>
                    </td>

                    {canManage && (
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button edit"
                            title="Edit pengguna"
                            onClick={() => openForm(user)}
                          >
                            <Pencil size={16} />
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
                <h2>Edit Pengguna</h2>
                <p>Ubah informasi dan hak akses pengguna.</p>
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
                  <label htmlFor="user-name">
                    Nama Lengkap *
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    value={form.full_name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        full_name: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="user-phone">
                    Nomor Telepon
                  </label>
                  <input
                    id="user-phone"
                    type="tel"
                    placeholder="Masukkan nomor telepon"
                    value={form.phone}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        phone: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="user-role">
                    Hak Akses *
                  </label>
                  <select
                    id="user-role"
                    value={form.role}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        role: event.target.value,
                      })
                    }
                    required
                    disabled={editingId === currentUserId}
                  >
                    <option value="admin">Admin</option>
                    <option value="asset_staff">Petugas Aset</option>
                    <option value="teacher_staff">Guru / Karyawan</option>
                    <option value="principal">Kepala Sekolah</option>
                  </select>

                  {editingId === currentUserId && (
                    <small>
                      Hak akses akun Admin yang sedang digunakan tidak dapat diubah.
                    </small>
                  )}
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
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Users
