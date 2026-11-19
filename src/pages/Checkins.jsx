import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Search, CheckCircle } from 'lucide-react'

function Checkins() {
  const [checkins, setCheckins] = useState([])
  const [assets, setAssets] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentRole, setCurrentRole] = useState('')

  const canManageCheckout =
    currentRole === 'admin' || currentRole === 'asset_staff'

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setErrorMessage('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      setErrorMessage('Tidak dapat memeriksa akun yang sedang login.')
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

    if (profileError) {
      setErrorMessage('Gagal mengambil informasi peran pengguna.')
      setLoading(false)
      return
    }

    setCurrentRole(profile.role)

    const [checkoutResult, assetResult, userResult] = await Promise.all([
      supabase
        .from('asset_assignments')
        .select('*')
        .eq('status', 'checked_out')
        .order('checkout_at', { ascending: false }),

      supabase
        .from('assets')
        .select('id, asset_tag, name'),

      supabase
        .from('profiles')
        .select('id, full_name'),
    ])

    if (checkoutResult.error || assetResult.error || userResult.error) {
      setErrorMessage('Gagal memuat data pengembalian. Silakan coba lagi.')
      setLoading(false)
      return
    }

    setCheckins(checkoutResult.data || [])
    setAssets(assetResult.data || [])
    setUsers(userResult.data || [])

    setLoading(false)
  }

  async function handleReturn(item) {
    if (!canManageCheckout) {
      setErrorMessage('Kamu tidak memiliki izin untuk memproses pengembalian.')
      return
    }

    const confirmed = window.confirm(
      'Apakah kamu yakin ingin memproses pengembalian aset ini?'
    )

    if (!confirmed) return

    setProcessingId(item.id)
    setMessage('')
    setErrorMessage('')

    // Pastikan transaksi masih berstatus dipinjam.
    const { data: currentCheckout, error: checkError } = await supabase
      .from('asset_assignments')
      .select('id, status, asset_id, assigned_to')
      .eq('id', item.id)
      .eq('status', 'checked_out')
      .maybeSingle()

    if (checkError) {
      setErrorMessage('Gagal memeriksa status peminjaman.')
      setProcessingId(null)
      return
    }

    if (!currentCheckout) {
      setErrorMessage('Transaksi ini sudah dikembalikan atau tidak ditemukan.')
      await loadData()
      setProcessingId(null)
      return
    }

    const returnedAt = new Date().toISOString()

    const { data: updatedCheckout, error: updateError } = await supabase
      .from('asset_assignments')
      .update({
        status: 'returned',
        checked_in_at: returnedAt,
        received_by: currentUserId,
      })
      .eq('id', item.id)
      .eq('status', 'checked_out')
      .select()
      .maybeSingle()

    if (updateError) {
      setErrorMessage('Pengembalian gagal diproses. Silakan coba lagi.')
      setProcessingId(null)
      return
    }

    if (!updatedCheckout) {
      setErrorMessage('Pengembalian tidak dapat diproses. Periksa status transaksi.')
      await loadData()
      setProcessingId(null)
      return
    }

    const asset = assets.find((a) => a.id === item.asset_id)
    const borrower = users.find((u) => u.id === item.assigned_to)

    // Catat aktivitas pengembalian.
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert([
        {
          actor_id: currentUserId,
          action: 'checkin',
          entity_type: 'assignment',
          entity_id: item.id,
          details: {
            asset_name: asset?.name || 'Aset',
            asset_tag: asset?.asset_tag || '-',
            borrower_name: borrower?.full_name || '-',
            returned_at: returnedAt,
          },
        },
      ])

    if (logError) {
      setMessage(
        'Pengembalian berhasil, tetapi riwayat aktivitas gagal dicatat.'
      )
    } else {
      setMessage('Pengembalian aset berhasil diproses.')
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

  const filteredCheckins = checkins.filter((item) => {
    const asset = assets.find((a) => a.id === item.asset_id)
    const user = users.find((u) => u.id === item.assigned_to)
    const keyword = search.toLowerCase()

    return (
      (asset?.name || '').toLowerCase().includes(keyword) ||
      (asset?.asset_tag || '').toLowerCase().includes(keyword) ||
      (user?.full_name || '').toLowerCase().includes(keyword)
    )
  })

  return (
    <section className="assets-page">
      <div className="assets-heading">
        <div>
          <span className="eyebrow">TRANSAKSI INVENTARIS</span>
          <h2>Pengembalian Aset</h2>
          <p>Kelola pengembalian aset yang sedang dipinjam.</p>
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
            placeholder="Cari aset atau nama peminjam..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <span className="assets-count">
          {checkins.length} aset sedang dipinjam
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
                <th>Tanggal Pinjam</th>
                <th>Batas Pengembalian</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-table">
                    Sedang memuat data pengembalian...
                  </td>
                </tr>
              ) : filteredCheckins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table">
                    Tidak ada aset yang sedang dipinjam.
                  </td>
                </tr>
              ) : (
                filteredCheckins.map((item, index) => {
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
                        <strong>
                          {asset?.name || 'Aset tidak ditemukan'}
                        </strong>
                        <br />
                        <small>{asset?.asset_tag || '-'}</small>
                      </td>
                      <td>
                        {user?.full_name || 'Pengguna tidak ditemukan'}
                      </td>
                      <td>{formatDate(item.checkout_at)}</td>
                      <td>{formatDate(item.due_at)}</td>
                      <td>
                        {canManageCheckout ? (
                          <button
                            className="primary-button"
                            onClick={() => handleReturn(item)}
                            disabled={processingId === item.id}
                            type="button"
                          >
                            <CheckCircle size={16} />
                            {processingId === item.id
                              ? 'Sedang Memproses...'
                              : 'Kembalikan'}
                          </button>
                        ) : (
                          <span className="condition-badge">
                            Menunggu pengembalian
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Checkins
