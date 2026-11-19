
import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage(error.message)
      }
    } catch {
      setErrorMessage('Terjadi kesalahan. Silakan coba kembali.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <img
            src="/logo-guna-cipta.jpg"
            alt="Logo SMK Guna Cipta"
            className="login-logo"
          />

          <div>
            <h1>Manajemen Aset</h1>
            <p>Sekolah Guna Cipta</p>
          </div>
        </div>

        <div className="login-heading">
          <span className="eyebrow">SELAMAT DATANG</span>
          <h2>Masuk ke akun Anda</h2>
          <p>
            Silakan masuk untuk mengelola data aset sekolah.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Alamat Email</label>
          <input
            id="email"
            type="email"
            placeholder="Masukkan alamat email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Kata Sandi</label>
          <input
            id="password"
            type="password"
            placeholder="Masukkan kata sandi"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {errorMessage && (
            <div className="login-error">{errorMessage}</div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Memeriksa akun...' : 'Masuk'}
          </button>
        </form>

        <p className="login-footer">
          Manajemen Aset Sekolah Guna Cipta © 2026
        </p>
      </section>
    </main>
  )
}

export default Login