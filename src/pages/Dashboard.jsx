
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  Package,
  Tags,
  MapPin,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wrench,
} from 'lucide-react'

const colors = {
  good: '#648b70',
  damaged: '#d3a04b',
  repair: '#bd7068',
}

const formatDate = (date) => {
  if (!date) return '-'

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function useAnimatedNumber(value, duration = 900) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let frame
    const startTime = performance.now()

    function animate(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setDisplayValue(
        Math.round(value * eased)
      )

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return displayValue
}

function AnimatedValue({ value }) {
  const animatedValue = useAnimatedNumber(value)

  return <>{animatedValue.toLocaleString('id-ID')}</>
}

function AnimatedCategoryBar({ total, maxCategory, color }) {
  const animatedTotal = useAnimatedNumber(total)

  const percentage = maxCategory > 0
    ? (animatedTotal / maxCategory) * 100
    : 0

  return (
    <div className="category-chart-track">
      <div
        className="category-chart-bar dashboard-category-bar"
        style={{
          width: `${percentage}%`,
          background: color,
          transition: 'width 0.9s ease',
        }}
      />
    </div>
  )
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Menunggu Persetujuan',
    checked_out: 'Sedang Dipinjam',
    returned: 'Sudah Dikembalikan',
    rejected: 'Ditolak',
  }

  return labels[status] || status
}

function getStatusColor(status) {
  const statusColors = {
    checked_out: {
      background: 'var(--status-warning-bg, #fff3dc)',
      color: 'var(--status-warning, #95651e)',
    },
    pending: {
      background: 'var(--status-info-bg, #e8f1f7)',
      color: 'var(--status-info, #426d89)',
    },
    rejected: {
      background: 'var(--status-danger-bg, #f8e9e8)',
      color: 'var(--status-danger, #a34d48)',
    },
    returned: {
      background: 'var(--status-success-bg, #e8f2e9)',
      color: 'var(--status-success, #47734e)',
    },
  }

  return statusColors[status] || statusColors.pending
}

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [assets, setAssets] = useState([])
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [assignments, setAssignments] = useState([])
  const [profiles, setProfiles] = useState([])
  const [borrowedCount, setBorrowedCount] = useState(0)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setRefreshing(true)
    setError('')

    try {
      const [
        assetsResult,
        categoriesResult,
        locationsResult,
        assignmentsResult,
        borrowedResult,
        profilesResult,
      ] = await Promise.all([
        supabase
          .from('assets')
          .select('id, asset_tag, name, condition, category_id'),

        supabase
          .from('categories')
          .select('id, name'),

        supabase
          .from('locations')
          .select('id'),

        supabase
          .from('asset_assignments')
          .select(
            'id, asset_id, assigned_to, checkout_at, requested_at, status'
          )
          .order('requested_at', { ascending: false })
          .limit(5),

        supabase
          .from('asset_assignments')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'checked_out'),

        supabase
          .from('profiles')
          .select('id, full_name'),
      ])

      const results = [
        assetsResult,
        categoriesResult,
        locationsResult,
        assignmentsResult,
        borrowedResult,
        profilesResult,
      ]

      const failed = results.find((result) => result.error)

      if (failed) {
        throw failed.error
      }

      setAssets(assetsResult.data || [])
      setCategories(categoriesResult.data || [])
      setLocations(locationsResult.data || [])
      setAssignments(assignmentsResult.data || [])
      setBorrowedCount(borrowedResult.count || 0)
      setProfiles(profilesResult.data || [])
    } catch (err) {
      console.error('Gagal memuat Dasbor:', err)
      setError('Gagal mengambil data. Silakan coba muat ulang halaman.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const goodCount = assets.filter(
    (asset) => asset.condition === 'good'
  ).length

  const damagedCount = assets.filter(
    (asset) => asset.condition === 'damaged'
  ).length

  const repairCount = assets.filter(
    (asset) => asset.condition === 'repair'
  ).length

  // Animasi jumlah aset untuk diagram lingkaran
  const animatedGood = useAnimatedNumber(goodCount)
  const animatedDamaged = useAnimatedNumber(damagedCount)
  const animatedRepair = useAnimatedNumber(repairCount)
  const animatedTotal = useAnimatedNumber(assets.length)

  const conditionData = [
    {
      label: 'Baik',
      value: goodCount,
      animatedValue: animatedGood,
      color: colors.good,
      icon: CheckCircle2,
    },
    {
      label: 'Rusak',
      value: damagedCount,
      animatedValue: animatedDamaged,
      color: colors.damaged,
      icon: AlertCircle,
    },
    {
      label: 'Perlu Perbaikan',
      value: repairCount,
      animatedValue: animatedRepair,
      color: colors.repair,
      icon: Wrench,
    },
  ]

  const circumference = 2 * Math.PI * 48
  let currentOffset = 0

  const categoryData = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      total: assets.filter(
        (asset) => asset.category_id === category.id
      ).length,
    }))
    .sort((a, b) => b.total - a.total)

  const maxCategory = Math.max(
    ...categoryData.map((item) => item.total),
    1
  )

  const categoryColors = [
    '#813D45',
    '#71804C',
    '#527F80',
    '#B58A54',
    '#81739A',
  ]

  function getAssetName(id) {
    const asset = assets.find((item) => item.id === id)
    return asset?.name || 'Aset tidak ditemukan'
  }

  function getUserName(id) {
    const user = profiles.find((item) => item.id === id)
    return user?.full_name || 'Pengguna'
  }

  const statisticCards = [
    {
      title: 'Total Aset',
      value: assets.length,
      description: 'Seluruh inventaris sekolah',
      icon: Package,
      color: '#527F80',
      background: 'rgba(82, 127, 128, 0.13)',
    },
    {
      title: 'Total Kategori',
      value: categories.length,
      description: 'Kelompok jenis aset',
      icon: Tags,
      color: '#81739A',
      background: 'rgba(129, 115, 154, 0.13)',
    },
    {
      title: 'Total Lokasi',
      value: locations.length,
      description: 'Tempat penyimpanan aset',
      icon: MapPin,
      color: '#648b70',
      background: 'rgba(100, 139, 112, 0.13)',
    },
    {
      title: 'Sedang Dipinjam',
      value: borrowedCount,
      description: 'Peminjaman yang masih aktif',
      icon: ClipboardList,
      color: '#B58A54',
      background: 'rgba(181, 138, 84, 0.13)',
    },
  ]

  if (loading) {
    return (
      <div className="dashboard-loading">
        <RefreshCw size={22} className="loading-icon" />
        <span>Sedang memuat ringkasan data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={22} />
        <div>
          <strong>Data belum dapat ditampilkan</strong>
          <p>{error}</p>
          <button type="button" onClick={loadDashboard}>
            <RefreshCw size={15} />
            Muat Ulang
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-content dashboard-modern">

      {/* Pembuka Dashboard */}
      <section className="dashboard-intro dashboard-animate">
        <div>
          <span className="dashboard-eyebrow">
            RINGKASAN PENGELOLAAN SEKOLAH
          </span>

          <h2>Ringkasan Inventaris</h2>

          <p>
            Pantau jumlah, kondisi, dan aktivitas aset sekolah dalam satu
            halaman.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={loadDashboard}
          disabled={refreshing}
          title="Perbarui data"
        >
          <RefreshCw
            size={16}
            className={refreshing ? 'dashboard-spin' : ''}
          />
          <span>
            {refreshing ? 'Memperbarui...' : 'Perbarui Data'}
          </span>
        </button>
      </section>

      {/* Kartu Statistik */}
      <section className="dashboard-statistics">
        {statisticCards.map((item, index) => {
          const Icon = item.icon

          return (
            <article
              className="dashboard-stat-card dashboard-animate"
              key={item.title}
              style={{ '--animation-order': index }}
            >
              <div className="stat-card-top">
                <span>{item.title}</span>

                <div
                  className="stat-card-icon"
                  style={{
                    color: item.color,
                    background: item.background,
                  }}
                >
                  <Icon size={21} />
                </div>
              </div>

              <div className="stat-card-value">
                <AnimatedValue value={item.value} />
              </div>

              <p>{item.description}</p>
            </article>
          )
        })}
      </section>

      {/* Diagram */}
      <section className="dashboard-chart-grid">

        {/* Diagram Kondisi Aset */}
        <article className="dashboard-panel dashboard-condition-panel dashboard-animate">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-kicker">
                KONDISI INVENTARIS
              </span>
              <h3>Kondisi Aset</h3>
              <p>Perbandingan kondisi seluruh aset sekolah.</p>
            </div>

            <div className="panel-heading-icon">
              <Package size={19} />
            </div>
          </div>

          <div className="condition-chart">
            <div className="condition-donut">
              <svg
                viewBox="0 0 120 120"
                role="img"
                aria-label="Diagram lingkaran kondisi aset"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="var(--chart-track, #e9e5df)"
                  strokeWidth="13"
                />

                {conditionData.map((item) => {
                  const length =
                    animatedTotal > 0
                      ? (item.animatedValue / animatedTotal) * circumference
                      : 0

                  const offset = currentOffset
                  currentOffset += length

                  if (length === 0) return null

                  return (
                    <circle
                      key={item.label}
                      className="dashboard-donut-segment"
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="13"
                      strokeDasharray={`${length} ${circumference - length}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      style={{
                        transition:
                          'stroke-dasharray 0.9s ease, stroke-dashoffset 0.9s ease',
                      }}
                    />
                  )
                })}

                <text
                  x="60"
                  y="56"
                  textAnchor="middle"
                  fontSize="21"
                  fontWeight="700"
                  fill="var(--text-primary, #343434)"
                >
                  {animatedTotal}
                </text>

                <text
                  x="60"
                  y="72"
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--text-muted, #777777)"
                >
                  TOTAL ASET
                </text>
              </svg>
            </div>

            <div className="condition-legend">
              {conditionData.map((item) => {
                const Icon = item.icon

                const percentage =
                  assets.length > 0
                    ? Math.round((item.value / assets.length) * 100)
                    : 0

                return (
                  <div className="condition-legend-item" key={item.label}>
                    <div className="condition-legend-main">
                      <span
                        className="condition-legend-dot"
                        style={{ background: item.color }}
                      />

                      <Icon size={16} style={{ color: item.color }} />

                      <div className="condition-legend-text">
                        <span>{item.label}</span>
                        <small>{percentage}% dari seluruh aset</small>
                      </div>
                    </div>

                    <strong>
                      <AnimatedValue value={item.value} />
                    </strong>
                  </div>
                )
              })}
            </div>
          </div>

          {assets.length === 0 && (
            <p className="dashboard-chart-note">
              Diagram akan menampilkan data setelah aset ditambahkan.
            </p>
          )}
        </article>

        {/* Diagram Kategori */}
        <article className="dashboard-panel dashboard-category-panel dashboard-animate">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-kicker">
                SEBARAN INVENTARIS
              </span>
              <h3>Aset Berdasarkan Kategori</h3>
              <p>Jumlah aset pada setiap kelompok kategori.</p>
            </div>

            <div className="panel-heading-icon">
              <Tags size={19} />
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="dashboard-empty">
              <Tags size={27} />
              <span>Belum ada data kategori.</span>
            </div>
          ) : (
            <div className="category-chart">
              {categoryData.map((item, index) => (
                <div className="category-chart-item" key={item.id}>
                  <div className="category-chart-info">
                    <span title={item.name}>{item.name}</span>
                    <strong>
                      <AnimatedValue value={item.total} /> aset
                    </strong>
                  </div>

                  <AnimatedCategoryBar
                    total={item.total}
                    maxCategory={maxCategory}
                    color={
                      categoryColors[index % categoryColors.length]
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      {/* Aktivitas Terbaru */}
      <section className="dashboard-panel dashboard-activity dashboard-animate">
        <div className="dashboard-panel-heading">
          <div>
            <span className="dashboard-panel-kicker">
              RIWAYAT TERBARU
            </span>
            <h3>Aktivitas Peminjaman Terbaru</h3>
            <p>Lima pengajuan dan transaksi peminjaman terbaru.</p>
          </div>

          <div className="panel-heading-icon">
            <Clock size={19} />
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="dashboard-empty">
            <ClipboardList size={28} />
            <span>Belum ada aktivitas peminjaman.</span>
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nama Aset</th>
                  <th>Peminjam</th>
                  <th>Tanggal Pengajuan</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {assignments.map((item) => {
                  const statusStyle = getStatusColor(item.status)

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="dashboard-asset-name">
                          <span className="dashboard-table-icon">
                            <Package size={16} />
                          </span>

                          <strong>
                            {getAssetName(item.asset_id)}
                          </strong>
                        </div>
                      </td>

                      <td>{getUserName(item.assigned_to)}</td>

                      <td>
                        {formatDate(
                          item.requested_at || item.checkout_at
                        )}
                      </td>

                      <td>
                        <span
                          className="dashboard-status"
                          style={{
                            background: statusStyle.background,
                            color: statusStyle.color,
                          }}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
