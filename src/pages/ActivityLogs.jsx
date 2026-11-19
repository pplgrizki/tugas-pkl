import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { RefreshCw, History, Search } from 'lucide-react'

function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    setLoading(true)
    setError('')

    const [logsResult, profilesResult] = await Promise.all([
      supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),

      supabase
        .from('profiles')
        .select('id, full_name'),
    ])

    if (logsResult.error) {
      setError('Gagal mengambil riwayat aktivitas.')
      setLoading(false)
      return
    }

    if (profilesResult.error) {
      setError('Gagal mengambil data pengguna.')
      setLoading(false)
      return
    }

    setLogs(logsResult.data || [])
    setProfiles(profilesResult.data || [])
    setLoading(false)
  }

  function getUserName(id) {
    const user = profiles.find((profile) => profile.id === id)
    return user?.full_name || 'Pengguna'
  }

  function getActionName(action) {
    const names = {
      create: 'Menambahkan',
      update: 'Mengubah',
      delete: 'Menghapus',
      checkout: 'Memproses Peminjaman',
      checkin: 'Memproses Pengembalian',
      request: 'Mengajukan Peminjaman',
      approve: 'Menyetujui Peminjaman',
      reject: 'Menolak Peminjaman',
    }

    return names[action] || action || 'Aktivitas'
  }

  function getEntityName(type) {
    const names = {
      asset: 'Aset',
      category: 'Kategori',
      location: 'Lokasi',
      user: 'Pengguna',
      assignment: 'Transaksi Peminjaman',
    }

    return names[type] || type || '-'
  }

  function formatDate(date) {
    if (!date) return '-'

    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredLogs = logs.filter((log) => {
    const keyword = search.toLowerCase()

    return (
      getUserName(log.actor_id).toLowerCase().includes(keyword) ||
      getActionName(log.action).toLowerCase().includes(keyword) ||
      getEntityName(log.entity_type).toLowerCase().includes(keyword)
    )
  })

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e7eaed',
    borderRadius: '10px',
    padding: '20px',
  }

  return (
    <div className="assets-page" style={{ padding: '24px 0' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '22px',
        }}
      >
        <div>
          <span className="eyebrow">CATATAN SISTEM</span>
          <h2 style={{ color: '#263746', fontSize: '22px', margin: 0 }}>
            Riwayat Aktivitas
          </h2>
          <p style={{ color: '#7b8791', fontSize: '13px' }}>
            Catatan aktivitas pengelolaan inventaris sekolah.
          </p>
        </div>

        <button
          onClick={loadLogs}
          type="button"
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            border: '1px solid #dce2e6',
            borderRadius: '7px',
            background: '#ffffff',
            color: '#405563',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={16} />
          Muat Ulang
        </button>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <History size={19} color="#718b9a" />
            <strong style={{ color: '#263746' }}>
              Daftar Aktivitas
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #dce2e6',
              borderRadius: '7px',
              padding: '8px 10px',
            }}
          >
            <Search size={16} color="#87939c" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari aktivitas..."
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                width: '170px',
              }}
            />
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#7b8791', fontSize: '13px' }}>
            Sedang memuat riwayat aktivitas...
          </p>
        ) : error ? (
          <div style={{ color: '#bd4949', fontSize: '13px' }}>
            <p>{error}</p>
            <button onClick={loadLogs} type="button">
              Coba Lagi
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '35px 10px',
              color: '#87939c',
            }}
          >
            <History size={30} />
            <p>
              {search
                ? 'Aktivitas yang dicari tidak ditemukan.'
                : 'Belum ada riwayat aktivitas.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                minWidth: '600px',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr style={{ textAlign: 'left', color: '#7b8791' }}>
                  {['Pengguna', 'Aktivitas', 'Jenis Data', 'Waktu'].map(
                    (heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: '12px 10px',
                          borderBottom: '1px solid #e7eaed',
                          fontSize: '12px',
                        }}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td
                      style={{
                        padding: '14px 10px',
                        borderBottom: '1px solid #f0f1f2',
                        color: '#263746',
                        fontSize: '13px',
                      }}
                    >
                      {getUserName(log.actor_id)}
                    </td>

                    <td
                      style={{
                        padding: '14px 10px',
                        borderBottom: '1px solid #f0f1f2',
                        color: '#52616b',
                        fontSize: '13px',
                      }}
                    >
                      {getActionName(log.action)}
                    </td>

                    <td
                      style={{
                        padding: '14px 10px',
                        borderBottom: '1px solid #f0f1f2',
                        color: '#52616b',
                        fontSize: '13px',
                      }}
                    >
                      {getEntityName(log.entity_type)}
                    </td>

                    <td
                      style={{
                        padding: '14px 10px',
                        borderBottom: '1px solid #f0f1f2',
                        color: '#7b8791',
                        fontSize: '12px',
                      }}
                    >
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p
          style={{
            color: '#87939c',
            fontSize: '12px',
            marginTop: '16px',
          }}
        >
          Menampilkan maksimal 100 aktivitas terbaru.
        </p>
      </div>
    </div>
  )
}

export default ActivityLogs
