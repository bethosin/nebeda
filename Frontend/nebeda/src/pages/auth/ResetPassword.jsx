import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import PasswordField from '../../components/ui/PasswordField'
import { useToast } from '../../components/ui/toastContext'
import { resetPassword } from '../../services/userAuthService'

function ResetPassword() {
  const { token } = useParams()
  const { showToast } = useToast()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [complete, setComplete] = useState(false)
  const [loading, setLoading] = useState(false)

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    if (form.password.length < 8 || form.password !== form.confirmPassword) {
      showToast({ message: 'Use at least 8 characters and make sure both passwords match.', type: 'error' })
      return
    }
    setLoading(true)
    try {
      await resetPassword(token, form.password)
      setComplete(true)
      showToast({ message: 'Your password has been reset.', type: 'success' })
    } catch (error) {
      showToast({ message: error.message || 'Unable to reset password.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-black px-5 py-20 text-white sm:px-8">
      <section className="mx-auto max-w-xl rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">Account Security</p>
        <h1 className="mt-4 font-serif text-4xl">Create New Password</h1>
        {complete ? (
          <div className="mt-7">
            <p className="leading-7 text-[var(--color-muted)]">Your new password is ready. You can now securely access your account.</p>
            <Button className="mt-6" to="/login">Login</Button>
          </div>
        ) : (
          <form className="mt-7 space-y-5" onSubmit={submit}>
            <PasswordField autoComplete="new-password" label="New Password" name="password" onChange={change} value={form.password} />
            <PasswordField autoComplete="new-password" label="Confirm Password" name="confirmPassword" onChange={change} value={form.confirmPassword} />
            <Button className="w-full" disabled={loading} type="submit">{loading ? 'Updating...' : 'Reset Password'}</Button>
          </form>
        )}
        {!complete ? <Link className="mt-6 inline-block text-sm text-[var(--color-gold)] hover:text-white" to="/login">Back to Login</Link> : null}
      </section>
    </main>
  )
}

export default ResetPassword
