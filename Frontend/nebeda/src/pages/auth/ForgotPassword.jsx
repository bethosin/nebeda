import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/toastContext'
import { forgotPassword } from '../../services/userAuthService'

function ForgotPassword() {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      showToast({ message: 'Please enter a valid email address.', type: 'error' })
      return
    }
    setLoading(true)
    try {
      await forgotPassword(email.trim())
      setSent(true)
      showToast({ message: 'Password reset instructions have been sent if the account exists.', type: 'success' })
    } catch (error) {
      showToast({ message: error.message || 'Unable to request a password reset.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-black px-5 py-20 text-white sm:px-8">
      <section className="mx-auto max-w-xl rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">Account Security</p>
        <h1 className="mt-4 font-serif text-4xl">Forgot Password</h1>
        <p className="mt-4 leading-7 text-[var(--color-muted)]">Enter your account email and we will send a secure reset link.</p>
        {sent ? (
          <div className="mt-7 rounded-2xl border border-[rgba(190,151,83,.4)] bg-[rgba(190,151,83,.08)] p-5">
            <p>Check your inbox for the next step. The link expires in one hour.</p>
          </div>
        ) : (
          <form className="mt-7" onSubmit={submit}>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">Email Address</span>
              <input className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none focus:border-[var(--color-gold)]" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
            </label>
            <Button className="mt-6 w-full" disabled={loading} type="submit">{loading ? 'Sending...' : 'Send Reset Link'}</Button>
          </form>
        )}
        <Link className="mt-6 inline-block text-sm text-[var(--color-gold)] hover:text-white" to="/login">Back to Login</Link>
      </section>
    </main>
  )
}

export default ForgotPassword
