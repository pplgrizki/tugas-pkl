import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  Package,
  CheckCircle,
  AlertTriangle,
  Wrench,
  RefreshCw,
} from 'lucide-react'

function Reports() {
  const [assets, setAssets] = useState([])
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [assignments, setAssignments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    setLoading(true)
    setErrorMessage('')

    const [
      assetResult,
      categoryResult,
      locationResult,
      assignmentResult,
      userResult,
    ] = await Promise.all([
      supabase.from('assets').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('locations').select('*'),
      supabase
        .from('asset_assignments')
        .select('*')
        .order('requested_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name'),
    ])

    const results = [
      assetResult,
      categoryResult,
      locationResult,
      assignmentResult,
      userResult,
    ]

    const failedResult = results.find((item) => item.error)

    if (failedResult) {
      setErrorMessage('Gagal memuat laporan. Silakan coba lagi.')
      setLoading(false)
      return
    }

    setAssets(assetResult.data || [])
    setCategories(categoryResult.data || [])
    setLocations(locationResult.data || [])
    setAssignments(assignmentResult.data || [])
    setUsers(userResult.data || [])

    setLoading(false)
  }

  const goodAssets = assets.filter(
    (item) => item.condition === 'good'
  ).length

  const damagedAssets = assets.filter(
    (item) => item.condition === 'damaged'
  ).length

  const repairAssets = assets.filter(
    (item) => item.condition === 'repair'
  ).length

  const borrowedAssets = assignments.filter(
    (item) => item.status === 'checked_out'
  ).length

  const returnedAssets = assignments.filter(
    (item) => item.status === 'returned'
  ).length

  const pendingAssets = assignments.filter(
    (item) => item.status === 'pending'
  ).length

  const rejectedAssets = assignments.filter(
    (item) => item.status === 'rejected'
  ).length

  function countByCategory(categoryId) {
    return assets.filter(
      (item) => item.category_id === categoryId
    ).length
  }

  function countByLocation(locationId) {
    return assets.filter(
      (item) => item.location_id === locationId
    ).length
  }

  function getAssetName(assetId) {
    return (
      assets.find((item) => item.id === assetId)?.name ||
      'Aset tidak ditemukan'
    )
  }

  function getAssetTag(assetId) {
    return (
      assets.find((item) => item.id === assetId)?.asset_tag || '-'
    )
  }

  function getUserName(userId) {
    return (
      users.find((item) => item.id === userId)?.full_name ||
      'Pengguna tidak ditemukan'
    )
  }

  function formatDate(date) {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  function getStatus(status) {
    const statuses = {
      pending: 'Menunggu Persetujuan',
      checked_out: 'Sedang Dipinjam',
      returned: 'Sudah Dikembalikan',
      rejected: 'Ditolak',
    }

    return statuses[status] || 'Tidak Diketahui'
  }

  if (loading) {
    return (
      <section className="assets-page">
        <div className="empty-table">
          Sedang memuat laporan...
        </div>
      </section>
    )
  }

  return (
    <section className="assets-page">
      <div className="assets-heading">
        <div>
          <span className="eyebrow">RINGKASAN INVENTARIS</span>
          <h2>Laporan Aset</h2>
          <p>
            Ringkasan data inventaris dan transaksi aset sekolah.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadReports}
          type="button"
        >
          <RefreshCw size={17} />
          Muat Ulang
        </button>
      </div>

      {errorMessage && (
        <div className="login-error">{errorMessage}</div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="assets-table-card" style={{ padding: '20px' }}>
          <Package size={24} />
          <p>Total Aset</p>
          <h2>{assets.length}</h2>
        </div>

        <div className="assets-table-card" style={{ padding: '20px' }}>
          <CheckCircle size={24} />
          <p>Aset dalam Kondisi Baik</p>
          <h2>{goodAssets}</h2>
        </div>

        <div className="assets-table-card" style={{ padding: '20px' }}>
          <AlertTriangle size={24} />
          <p>Aset Rusak</p>
          <h2>{damagedAssets}</h2>
        </div>

        <div className="assets-table-card" style={{ padding: '20px' }}>
          <Wrench size={24} />
          <p>Aset Perlu Perbaikan</p>
          <h2>{repairAssets}</h2>
        </div>
      </div>

      <div
        className="assets-table-card"
        style={{ padding: '20px', marginBottom: '24px' }}
      >
        <h3>Rekapitulasi Peminjaman</h3>
        <p>
          Sedang dipinjam: <strong>{borrowedAssets}</strong>
        </p>
        <p>
          Sudah dikembalikan: <strong>{returnedAssets}</strong>
        </p>
        <p>
          Menunggu persetujuan: <strong>{pendingAssets}</strong>
        </p>
        <p>
          Permintaan ditolak: <strong>{rejectedAssets}</strong>
        </p>
        <p>
          Total transaksi: <strong>{assignments.length}</strong>
        </p>
      </div>

      <div
        className="assets-table-card"
        style={{ marginBottom: '24px' }}
      >
        <div style={{ padding: '20px' }}>
          <h3>Rekapitulasi Berdasarkan Kategori</h3>
        </div>

        <div className="table-responsive">
          <table className="assets-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Kategori</th>
                <th>Jumlah Aset</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-table">
                    Belum ada data kategori.
                  </td>
                </tr>
              ) : (
                categories.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{countByCategory(item.id)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="assets-table-card"
        style={{ marginBottom: '24px' }}
      >
        <div style={{ padding: '20px' }}>
          <h3>Rekapitulasi Berdasarkan Lokasi</h3>
        </div>

        <div className="table-responsive">
          <table className="assets-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Lokasi</th>
                <th>Jumlah Aset</th>
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-table">
                    Belum ada data lokasi.
                  </td>
                </tr>
              ) : (
                locations.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{countByLocation(item.id)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="assets-table-card">
        <div style={{ padding: '20px' }}>
          <h3>Riwayat Peminjaman dan Pengembalian</h3>
        </div>

        <div className="table-responsive">
          <table className="assets-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Aset</th>
                <th>Peminjam</th>
                <th>Tanggal Peminjaman</th>
                <th>Tanggal Pengembalian</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              ) : (
                assignments.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{getAssetName(item.asset_id)}</strong>
                      <br />
                      <small>{getAssetTag(item.asset_id)}</small>
                    </td>
                    <td>{getUserName(item.assigned_to)}</td>
                    <td>{formatDate(item.checkout_at || item.requested_at)}</td>
                    <td>{formatDate(item.checked_in_at)}</td>
                    <td>{getStatus(item.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Reports
