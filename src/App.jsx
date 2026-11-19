import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Assets from './pages/Assets'
import Categories from './pages/Categories'
import Locations from './pages/Locations'
import Users from './pages/Users'
import Checkouts from './pages/Checkouts'
import Checkins from './pages/Checkins'
import Reports from './pages/Reports'
import Dashboard from './pages/Dashboard'
import ActivityLogs from './pages/ActivityLogs'
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Package,
  Tags,
  MapPin,
  Users as UsersIcon,
  ClipboardList,
  RotateCcw,
  FileBarChart,
  History,
  LogOut,
  X,
} from 'lucide-react'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const roleNames = {
    admin: 'Administrator',
    asset_staff: 'Petugas Aset',
    teacher_staff: 'Guru / Karyawan',
    principal: 'Kepala Sekolah',
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dasbor',
      icon: LayoutDashboard,
      roles: ['admin', 'asset_staff', 'teacher_staff', 'principal'],
    },
    {
      id: 'assets',
      label: 'Data Aset',
      icon: Package,
      roles: ['admin', 'asset_staff', 'teacher_staff', 'principal'],
    },
    {
      id: 'categories',
      label: 'Kategori',
      icon: Tags,
      roles: ['admin', 'asset_staff'],
    },
    {
      id: 'locations',
      label: 'Lokasi',
      icon: MapPin,
      roles: ['admin', 'asset_staff'],
    },
    {
      id: 'users',
      label: 'Pengguna',
      icon: UsersIcon,
      roles: ['admin', 'asset_staff'],
    },
    {
      id: 'checkouts',
      label: 'Peminjaman',
      icon: ClipboardList,
      roles: ['admin', 'asset_staff', 'teacher_staff'],
    },
    {
      id: 'checkins',
      label: 'Pengembalian',
      icon: RotateCcw,
      roles: ['admin', 'asset_staff'],
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: FileBarChart,
      roles: ['admin', 'asset_staff', 'principal'],
    },
    {
      id: 'activity-logs',
      label: 'Riwayat Aktivitas',
      icon: History,
      roles: ['admin', 'asset_staff', 'principal'],
    },
  ]

  const visibleMenus = profile
    ? menuItems.filter((item) => item.roles.includes(profile.role))
    : []

  const pageTitles = {
    dashboard: 'Dasbor',
    assets: 'Data Aset',
    categories: 'Kategori',
    locations: 'Lokasi',
    users: 'Pengguna',
    checkouts: 'Peminjaman',
    checkins: 'Pengembalian',
    reports: 'Laporan Aset',
    'activity-logs': 'Riwayat Aktivitas',
  }

  useEffect(() => {
    if (!profile) return

    const currentPageAllowed = menuItems.some(
      (item) =>
        item.id === activePage &&
        item.roles.includes(profile.role)
    )

    if (!currentPageAllowed) {
      setActivePage('dashboard')
    }
  }, [profile?.role, activePage])

  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error) {
        console.error('Gagal memeriksa sesi:', error.message)
      }

      setSession(data?.session ?? null)
      setLoading(false)
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function getProfile() {
      if (!session?.user) {
        setProfile(null)
        setProfileError('')
        setProfileLoading(false)
        return
      }

      setProfileLoading(true)
      setProfileError('')

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single()

      if (!mounted) return

      if (error) {
        console.error('Gagal mengambil profil:', error.message)
        setProfile(null)
        setProfileError(
          'Informasi profil pengguna gagal dimuat. Silakan coba masuk kembali.'
        )
        setProfileLoading(false)
        return
      }

      setProfile(data)
      setProfileLoading(false)
    }

    getProfile()

    return () => {
      mounted = false
    }
  }, [session?.user?.id])

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert('Gagal keluar dari akun: ' + error.message)
    }
  }

  function handleMenuClick(pageId) {
    setActivePage(pageId)
    setMobileSidebarOpen(false)
  }

  const userName =
    profile?.full_name || session?.user?.email || 'Pengguna'

  if (loading || (session && profileLoading)) {
    return (
      <div className="loading-screen">
        Memuat Manajemen Aset Sekolah Guna Cipta...
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  if (profileError || !profile) {
    return (
      <div className="loading-screen">
        <div>
          <p>{profileError || 'Profil pengguna tidak ditemukan.'}</p>
          <button
            className="logout-button"
            onClick={handleLogout}
            type="button"
          >
            Keluar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`dashboard-layout ${
        sidebarCollapsed ? 'sidebar-collapsed' : ''
      } ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}
    >
      {mobileSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Tutup menu"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside className="sidebar">
        <div className="sidebar-brand">
          <img
            src="/logo-guna-cipta.jpg"
            alt="Logo SMK Guna Cipta"
            className="brand-logo"
          />

          <div className="sidebar-brand-text">
            <h2>Manajemen Aset</h2>
            <span>Sekolah Guna Cipta</span>
          </div>

          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-label">MENU UTAMA</div>

        <nav className="sidebar-nav">
          {visibleMenus.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                title={sidebarCollapsed ? item.label : undefined}
                className={`nav-link ${
                  activePage === item.id ? 'active' : ''
                }`}
                onClick={() => handleMenuClick(item.id)}
              >
                <Icon size={19} strokeWidth={1.9} />
                <span className="nav-link-label">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <span className="sidebar-status"></span>
          <span className="sidebar-bottom-text">
            Sistem Inventaris Sekolah
          </span>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle"
              aria-label={
                sidebarCollapsed
                  ? 'Buka menu samping'
                  : 'Lipat menu samping'
              }
              title={
                sidebarCollapsed
                  ? 'Buka menu samping'
                  : 'Lipat menu samping'
              }
              onClick={() => {
                if (window.innerWidth <= 768) {
                  setMobileSidebarOpen(true)
                } else {
                  setSidebarCollapsed((previous) => !previous)
                }
              }}
            >
              <Menu size={21} />
            </button>

            <div>
              <span className="topbar-label">
                MANAJEMEN ASET SEKOLAH GUNA CIPTA
              </span>
              <h1>{pageTitles[activePage] || 'Dasbor'}</h1>
            </div>
          </div>

          <div className="user-area">
            <div className="user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <strong>{userName}</strong>
              <span>{roleNames[profile.role] || 'Pengguna'}</span>
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
              type="button"
              title="Keluar dari akun"
            >
              <LogOut size={15} />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        <div className="dashboard-page-content">
          {activePage === 'assets' ? (
            <Assets />
          ) : activePage === 'categories' ? (
            <Categories />
          ) : activePage === 'locations' ? (
            <Locations />
          ) : activePage === 'users' ? (
            <Users />
          ) : activePage === 'checkouts' ? (
            <Checkouts />
          ) : activePage === 'checkins' ? (
            <Checkins />
          ) : activePage === 'reports' ? (
            <Reports />
          ) : activePage === 'activity-logs' ? (
            <ActivityLogs />
          ) : (
            <Dashboard />
          )}
        </div>

        <footer className="dashboard-footer">
          Manajemen Aset Sekolah Guna Cipta © 2026
        </footer>
      </main>
    </div>
  )
}

export default App
