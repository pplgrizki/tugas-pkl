
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

function getTimeMood() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 11) return 'pagi'
  if (hour >= 11 && hour < 16) return 'siang'
  if (hour >= 16 && hour < 19) return 'sore'

  return 'malam'
}

const moodLabels = {
  pagi: 'Pagi',
  siang: 'Siang',
  sore: 'Sore',
  malam: 'Malam',
}

function SuasanaWaktu({ mood }) {
  return (
    <div className={`sams-atmosphere suasana-${mood}`} aria-hidden="true">
      {mood === 'pagi' && (
        <>
          <div className="matahari matahari-pagi" />
          <div className="awan awan-satu" />
          <div className="awan awan-dua" />
          <div className="cahaya-pagi" />
        </>
      )}

      {mood === 'siang' && (
        <>
          <div className="matahari matahari-siang" />
          <div className="awan awan-satu" />
          <div className="awan awan-dua" />
          <div className="cahaya-siang" />
        </>
      )}

      {mood === 'sore' && (
        <>
          <div className="matahari matahari-sore" />
          <div className="awan awan-satu" />
          <div className="daun daun-satu">🍃</div>
          <div className="daun daun-dua">🍂</div>
          <div className="daun daun-tiga">🍃</div>
        </>
      )}

      {mood === 'malam' && (
        <>
          <div className="bulan" />
          <div className="bintang bintang-satu">✦</div>
          <div className="bintang bintang-dua">✧</div>
          <div className="bintang bintang-tiga">✦</div>
          <div className="bintang bintang-empat">✧</div>
          <div className="awan awan-satu" />
        </>
      )}
    </div>
  )
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem('sams-theme-mode') || 'otomatis'
    } catch {
      return 'otomatis'
    }
  })

  const [timeMood, setTimeMood] = useState(getTimeMood)

  useEffect(() => {
    const updateMood = () => setTimeMood(getTimeMood())

    updateMood()
    const interval = setInterval(updateMood, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('sams-theme-mode', themeMode)
    } catch {
      // Pengaturan tetap dapat digunakan selama halaman terbuka.
    }

    const temaOtomatis =
      timeMood === 'sore' || timeMood === 'malam' ? 'gelap' : 'terang'

    const temaAktif =
      themeMode === 'otomatis' ? temaOtomatis : themeMode

    document.documentElement.dataset.theme = temaAktif
    document.documentElement.dataset.mood = timeMood
    document.documentElement.dataset.themeMode = themeMode
  }, [themeMode, timeMood])

  const value = {
    themeMode,
    setThemeMode,
    timeMood,
    moodLabel: moodLabels[timeMood],
  }

  return (
    <ThemeContext.Provider value={value}>
      <SuasanaWaktu mood={timeMood} />

      {children}

      <div className="sams-theme-control">
        <span className="sams-theme-caption">
          Suasana {moodLabels[timeMood]}
        </span>

        <div className="sams-theme-options">
          <button
            type="button"
            className={themeMode === 'otomatis' ? 'active' : ''}
            onClick={() => setThemeMode('otomatis')}
          >
            Otomatis
          </button>

          <button
            type="button"
            className={themeMode === 'terang' ? 'active' : ''}
            onClick={() => setThemeMode('terang')}
            title="Mode Terang"
          >
            ☀
          </button>

          <button
            type="button"
            className={themeMode === 'gelap' ? 'active' : ''}
            onClick={() => setThemeMode('gelap')}
            title="Mode Gelap"
          >
            ☾
          </button>
        </div>
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme harus digunakan di dalam ThemeProvider')
  }

  return context
}
