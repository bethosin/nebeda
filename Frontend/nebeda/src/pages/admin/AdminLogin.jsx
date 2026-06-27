import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import { isAdminAuthenticated, loginAdmin } from '../../services/authService'

const initialForm = {
  email: '',
  password: '',
}

function AdminLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialForm)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const isAuthenticated = isAdminAuthenticated()

  if (isAuthenticated) {
    return <Navigate replace to="/admin/dashboard" />
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.email || !formData.password) {
      setError('Email and password are required.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await loginAdmin(formData.email, formData.password)
      navigate('/admin/dashboard', { replace: true })
    } catch (apiError) {
      setError(apiError.message || 'Unable to login. Please check your details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-black px-5 py-12 text-white sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(190,151,83,0.17),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_36%)]" />
      <motion.form
        className="relative w-full max-w-xl rounded-[1.75rem] border border-[rgba(190,151,83,0.38)] bg-black/78 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8"
        initial={{ opacity: 0, y: 28 }}
        onSubmit={handleSubmit}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <p className="font-serif text-3xl text-white">Nebeda Threads</p>
          <div className="mt-5 h-px w-20 bg-[var(--color-gold)]" />
          <h1 className="mt-6 font-serif text-4xl leading-tight text-white sm:text-5xl">
            Admin Access
          </h1>
          <p className="mt-5 text-base leading-8 text-[var(--color-muted)]">
            Manage Nebeda Threads products, orders, and customer requests.
          </p>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
              Email
            </span>
            <input
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-white/32 focus:border-[var(--color-gold)]"
              name="email"
              onChange={updateField}
              placeholder="admin@nebedathreads.com"
              type="email"
              value={formData.email}
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
              Password
            </span>
            <input
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-white/32 focus:border-[var(--color-gold)]"
              name="password"
              onChange={updateField}
              placeholder="Enter password"
              type="password"
              value={formData.password}
            />
          </label>
        </div>

        {error ? (
          <p className="mt-5 rounded-2xl border border-[rgba(190,151,83,0.38)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">
            {error}
          </p>
        ) : null}

        <Button className="mt-7 w-full" disabled={isLoading} type="submit" variant="primary">
          {isLoading ? 'Logging In...' : 'Login to Dashboard'}
        </Button>

        <p className="mt-6 text-center text-sm text-white/48">
          Secure admin area for Nebeda Threads management.
        </p>
      </motion.form>
    </main>
  )
}

export default AdminLogin
