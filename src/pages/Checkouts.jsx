import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, X, Save, Check, Ban } from 'lucide-react'

function Checkouts() {
  const [checkouts, setCheckouts] = useState([])
  const [assets, setAssets] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentRole, setCurrentRole] = useState('')

  const [form, setForm] = useState({
    asset_id: '',
    assigned_to: '',
    due_at: '',
    notes: '',
  })

  const canManage =
    currentRole === 'admin' || currentRole === 'asset_staff'

  const isTeacher = currentRole === 'teacher_staff'

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setErrorMessage('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      setErrorMessage('Tidak dapat memeriksa akun yang sedang masuk.')
      setLoading(false)
      return
    }

    const userId = authData.user.id
    setCurrentUserId(userId)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      setErrorMessage('Gagal memeriksa hak akses akun.')
      setLoading(false)
      return
    }

    setCurrentRole(profile.role)

    const [checkoutResult, assetResult, userResult] = await Promise.all([
      supabase
        .from('asset_assignments')
        .select('*')
        .order('requested_at', { ascending: false }),

      supabase
        .from('assets')
        .select('id, asset_tag, name, condition'),

      supabase
        .from('profiles')
        .select('id, full_name, role')
        .order('full_name'),
    ])

    if (checkoutResult.error || assetResult.error || userResult.error) {
      setErrorMessage('Gagal memuat data peminjaman. Periksa koneksi dan hak akses akun.')
      setLoading(false)
      return
    }

    setCheckouts(checkoutResult.data || [])
    setAssets(assetResult.data || [])
    setUsers(userResult.data || [])

    setLoading(false)
  }

  const borrowedAssetIds = checkouts
    .filter(
      (item) =>
        item.status === 'checked_out' ||
        item.status === 'pending'
    )
    .map((item) => item.asset_id)

  const availableAssets = assets.filter(
    (asset) =>
      asset.condition === 'good' &&
      !borrowedAssetIds.includes(asset.id)
  )

  function openForm() {
    if (!canManage && !isTeacher) return

    setMessage('')
    setErrorMessage('')

    setForm({
      asset_id: '',
      assigned_to: '',
      due_at: '',
      notes: '',
    })

    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
  }

  async function writeActivity(action, item, details = {}) {
    const { error } = await supabase
      .from('activity_logs')
      .insert([
        {
          actor_id: currentUserId,
          action,
          entity_type: 'assignment',
          entity_id: item.id,
          details,
        },
      ])

    return error
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!canManage && !isTeacher) {
      setErrorMessage('Akun ini tidak memiliki izin untuk mengajukan peminjaman.')
      return
    }

    if (!form.asset_id || !form.due_at) {
      setErrorMessage('Lengkapi pilihan aset dan tanggal pengembalian.')
      return
    }

    if (canManage && !form.assigned_to) {
      setErrorMessage('Pilih pengguna yang akan meminjam aset.')
      return
    }

    const dueDate = new Date(`${form.due_at}T12:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const selectedDate = new Date(form.due_at)
    selectedDate.setHours(0, 0, 0, 0)

    if (Number.isNaN(dueDate.getTime()) || selectedDate < today) {
      setErrorMessage('Tanggal pengembalian tidak valid.')
      return
    }

    setSaving(true)
    setMessage('')
    setErrorMessage('')

    const assetId = Number(form.asset_id)

    const { data: existing, error: checkError } = await supabase
      .from('asset_assignments')
      .select('id')
      .eq('asset_id', assetId)
      .in('status', ['pending', 'checked_out'])
      .limit(1)

    if (checkError) {
      setErrorMessage('Gagal memeriksa ketersediaan aset.')
      setSaving(false)
      return
    }

    if (existing && existing.length > 0) {
      setErrorMessage('Aset sedang dipinjam atau sudah memiliki pengajuan.')
      await loadData()
      setSaving(false)
      return
    }

    const asset = assets.find((item) => item.id === assetId)

    if (!asset || asset.condition !== 'good') {
      setErrorMessage('Aset tidak tersedia atau kondisinya tidak baik.')
      setSaving(false)
      return
    }

    const borrowerId = isTeacher
      ? currentUserId
      : form.assigned_to

    const status = isTeacher ? 'pending' : 'checked_out'

    const { data: newCheckout, error: insertError } = await supabase
      .from('asset_assignments')
      .insert([
        {
          asset_id: assetId,
          assigned_to: borrowerId,
          processed_by: isTeacher ? null : currentUserId,
          checkout_at: isTeacher ? null : new Date().toISOString(),
          requested_at: new Date().toISOString(),
          due_at: dueDate.toISOString(),
          status,
          notes: form.notes.trim() || null,
        },
      ])
      .select()
      .single()

    if (insertError) {
      setErrorMessage('Peminjaman gagal disimpan. Periksa kembali data dan hak akses akun.')
      setSaving(false)
      return
    }

    const logError = await writeActivity(
      isTeacher ? 'request' : 'checkout',
      newCheckout,
      {
        asset_name: asset.name,
        asset_tag: asset.asset_tag,
        borrower_id: borrowerId,
        status,
      }
    )

    setShowForm(false)
    setForm({
      asset_id: '',
      assigned_to: '',
      due_at: '',
      notes: '',
    })

    setMessage(
      isTeacher
        ? 'Pengajuan peminjaman berhasil dikirim.'
        : 'Transaksi peminjaman berhasil disimpan.'
    )

    if (logError) {
      setErrorMessage(
        'Transaksi berhasil disimpan, tetapi riwayat aktivitas gagal dicatat.'
      )
    }

    await loadData()
    setSaving(false)
  }

  async function handleDecision(item, decision) {
    if (!canManage) return

    const isApproved = decision === 'approve'

    const confirmed = window.confirm(
      isApproved
        ? 'Apakah Anda yakin ingin menyetujui pengajuan ini?'
        : 'Apakah Anda yakin ingin menolak pengajuan ini?'
    )

    if (!confirmed) return

    setProcessingId(item.id)
    setMessage('')
    setErrorMessage('')

    const { data: currentCheckout, error: checkError } = await supabase
      .from('asset_assignments')
      .select('id, status, asset_id')
      .eq('id', item.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (checkError || !currentCheckout) {
      setErrorMessage(
        checkError?.message || 'Pengajuan sudah diproses atau tidak ditemukan.'
      )
      await loadData()
      setProcessingId(null)
      return
    }

    if (isApproved) {
      const { data: otherCheckout, error: assetCheckError } = await supabase
        .from('asset_assignments')
        .select('id')
        .eq('asset_id', item.asset_id)
        .eq('status', 'checked_out')
        .limit(1)

      if (assetCheckError) {
        setErrorMessage('Gagal memeriksa status ketersediaan aset.')
        setProcessingId(null)
        return
      }

      if (otherCheckout && otherCheckout.length > 0) {
        setErrorMessage('Aset sudah dipinjam melalui transaksi lain.')
        setProcessingId(null)
        return
      }

      const asset = assets.find((a) => a.id === item.asset_id)

      if (!asset || asset.condition !== 'good') {
        setErrorMessage('Kondisi aset tidak memenuhi syarat peminjaman.')
        setProcessingId(null)
        return
      }
    }

    const newStatus = isApproved ? 'checked_out' : 'rejected'

    const { data: updated, error: updateError } = await supabase
      .from('asset_assignments')
      .update({
        status: newStatus,
        processed_by: currentUserId,
        checkout_at: isApproved ? new Date().toISOString() : null,
      })
      .eq('id', item.id)
      .eq('status', 'pending')
      .select()
      .maybeSingle()

    if (updateError || !updated) {
      setErrorMessage(
        updateError?.message || 'Pengajuan tidak dapat diproses.'
      )
      await loadData()
      setProcessingId(null)
      return
    }

    const asset = assets.find((a) => a.id === item.asset_id)
    const borrower = users.find((u) => u.id === item.assigned_to)

    const logError = await writeActivity(
      isApproved ? 'approve' : 'reject',
      item,
      {
        asset_name: asset?.name || 'Aset',
        asset_tag: asset?.asset_tag || '-',
        borrower_name: borrower?.full_name || '-',
        status: newStatus,
      }
    )

    setMessage(
      isApproved
        ? 'Pengajuan berhasil disetujui. Status aset sekarang sedang dipinjam.'
        : 'Pengajuan peminjaman berhasil ditolak.'
    )

    if (logError) {
      setErrorMessage(
        'Status berhasil diperbarui, tetapi riwayat aktivitas gagal dicatat.'
      )
    }

    await loadData()
    setProcessingId(null)
  }

  function formatDate(date) {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  function statusLabel(status) {
    const labels = {
      pending: 'Menunggu Persetujuan',
      checked_out: 'Sedang Dipinjam',
      returned: 'Sudah Dikembalikan',
      rejected: 'Ditolak',
    }

    return labels[status] || status
  }

  const filteredCheckouts = checkouts.filter((item) => {
    const asset = assets.find((a) => a.id === item.asset_id)
    const user = users.find((u) => u.id === item.assigned_to)
    const keyword = search.toLowerCase()

    return (
      (asset?.name || '').toLowerCase().includes(keyword) ||
      (asset?.asset_tag || '').toLowerCase().includes(keyword) ||
      (user?.full_name || '').toLowerCase().includes(keyword) ||
      statusLabel(item.status).toLowerCase().includes(keyword)
    )
  })

  const pendingCount = checkouts.filter(
    (item) => item.status === 'pending'
  ).length

  return (
    <section className="assets-page">
      <div className="assets-heading">
        <div>
          <span className="eyebrow">TRANSAKSI INVENTARIS</span>
          <h2>Peminjaman Aset</h2>
          <p>Kelola pengajuan dan transaksi peminjaman aset sekolah.</p>
        </div>

        {(canManage || isTeacher) && (
          <button
            className="primary-button"
            onClick={openForm}
            type="button"
          >
            <Plus size={18} />
            {isTeacher ? 'Ajukan Peminjaman' : 'Tambah Peminjaman'}
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
            placeholder="Cari nama aset, peminjam, atau status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <span className="assets-count">
          {checkouts.length} transaksi
          {canManage ? ` • ${pendingCount} pengajuan menunggu` : ''}
        </span>
      </div>

      <div className="assets-table-card">
        <div className="table-responsive">
          <table className="assets-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Aset</th>
                <th>Peminjam</th>
                <th>Tanggal Pengajuan</th>
                <th>Batas Pengembalian</th>
                <th>Status</th>
                {canManage && <th>Aksi</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="empty-table">
                    Memuat data peminjaman...
                  </td>
                </tr>
              ) : filteredCheckouts.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="empty-table">
                    Belum ada data peminjaman.
                  </td>
                </tr>
              ) : (
                filteredCheckouts.map((item, index) => {
                  const asset = assets.find(
                    (a) => a.id === item.asset_id
                  )

                  const user = users.find(
                    (u) => u.id === item.assigned_to
                  )

                  return (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{asset?.name || 'Aset tidak ditemukan'}</strong>
                        <br />
                        <small>{asset?.asset_tag || '-'}</small>
                      </td>
                      <td>{user?.full_name || 'Pengguna tidak ditemukan'}</td>
                      <td>{formatDate(item.requested_at || item.checkout_at)}</td>
                      <td>{formatDate(item.due_at)}</td>
                      <td>
                        <span className="condition-badge">
                          {statusLabel(item.status)}
                        </span>
                      </td>

                      {canManage && (
                        <td>
                          {item.status === 'pending' ? (
                            <div className="table-actions">
                              <button
                                type="button"
                                className="icon-button"
                                title="Setujui pengajuan"
                                onClick={() => handleDecision(item, 'approve')}
                                disabled={processingId === item.id}
                              >
                                <Check size={17} />
                              </button>

                              <button
                                type="button"
                                className="icon-button"
                                title="Tolak pengajuan"
                                onClick={() => handleDecision(item, 'reject')}
                                disabled={processingId === item.id}
                              >
                                <Ban size={17} />
                              </button>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (canManage || isTeacher) && (
        <div className="modal-overlay">
          <div className="asset-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {isTeacher ? 'Ajukan Peminjaman' : 'Tambah Peminjaman'}
                </h2>
                <p>
                  {isTeacher
                    ? 'Pengajuan akan menunggu persetujuan petugas aset.'
                    : 'Lengkapi informasi transaksi peminjaman aset.'}
                </p>
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
                  <label htmlFor="checkout-asset">Pilih Aset *</label>
                  <select
                    id="checkout-asset"
                    value={form.asset_id}
                    onChange={(event) =>
                      setForm({ ...form, asset_id: event.target.value })
                    }
                    required
                  >
                    <option value="">Pilih aset</option>
                    {availableAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.asset_tag} - {asset.name}
                      </option>
                    ))}
                  </select>

                  {availableAssets.length === 0 && (
                    <small>
                      Tidak ada aset berkondisi baik yang tersedia.
                    </small>
                  )}
                </div>

                {canManage && (
                  <div className="form-field full-width">
                    <label htmlFor="checkout-user">Nama Peminjam *</label>
                    <select
                      id="checkout-user"
                      value={form.assigned_to}
                      onChange={(event) =>
                        setForm({ ...form, assigned_to: event.target.value })
                      }
                      required
                    >
                      <option value="">Pilih pengguna</option>
                      {users
                        .filter((user) => user.role === 'teacher_staff')
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="form-field full-width">
                  <label htmlFor="checkout-due">
                    Batas Pengembalian *
                  </label>
                  <input
                    id="checkout-due"
                    type="date"
                    min={new Date().toLocaleDateString('en-CA')}
                    value={form.due_at}
                    onChange={(event) =>
                      setForm({ ...form, due_at: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="checkout-notes">Catatan</label>
                  <textarea
                    id="checkout-notes"
                    rows="3"
                    placeholder="Contoh: Digunakan untuk kegiatan belajar."
                    value={form.notes}
                    onChange={(event) =>
                      setForm({ ...form, notes: event.target.value })
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
                  disabled={saving || availableAssets.length === 0}
                >
                  <Save size={17} />
                  {saving
                    ? 'Menyimpan...'
                    : isTeacher
                      ? 'Kirim Pengajuan'
                      : 'Simpan Peminjaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Checkouts
