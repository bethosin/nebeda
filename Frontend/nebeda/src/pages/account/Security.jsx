import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AccountLayout from '../../components/account/AccountLayout'
import Button from '../../components/ui/Button'
import PasswordField from '../../components/ui/PasswordField'
import { useToast } from '../../components/ui/toastContext'
import { changePassword } from '../../services/accountService'
import {
  getCurrentUser,
  getStoredUser,
  logoutUser,
  resendVerificationEmail,
} from '../../services/userAuthService'

function Security() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [user, setUser] = useState(getStoredUser)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  useEffect(() => {
    const refresh = () => setUser(getStoredUser())
    window.addEventListener('nebedaUserAuthChanged', refresh)
    getCurrentUser().then((response) => setUser(response.user)).catch(() => {})
    return () => window.removeEventListener('nebedaUserAuthChanged', refresh)
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    if (form.newPassword.length < 8 || form.newPassword !== form.confirmPassword) {
      showToast({ message: 'Use at least 8 characters and make sure the new passwords match.', type: 'error' })
      return
    }
    setLoading(true)
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      logoutUser()
      showToast({ message: 'Password changed successfully. Please log in again.', type: 'success' })
      navigate('/login', { replace: true })
    } catch (error) {
      showToast({ message: error.message || 'Unable to change password.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setResending(true)
    try {
      const response = await resendVerificationEmail()
      showToast({ message: response.message, type: 'success' })
    } catch (error) {
      showToast({ message: error.message || 'Unable to send verification email.', type: 'error' })
    } finally {
      setResending(false)
    }
  }

  return (
    <AccountLayout>
      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-gold)]">Email Verification</p>
          <h1 className="mt-3 font-serif text-3xl">{user?.isEmailVerified ? 'Verified' : 'Verification Required'}</h1>
          <p className="mt-4 break-words leading-7 text-[var(--color-muted)]">
            {user?.isEmailVerified ? `${user.email} is verified and ready for secure checkout.` : `Verify ${user?.email || 'your email'} before completing payment.`}
          </p>
          {!user?.isEmailVerified ? <Button className="mt-6" disabled={resending} onClick={resend} type="button">{resending ? 'Sending...' : 'Resend Verification Email'}</Button> : null}
        </article>
        <form className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6 sm:p-8" onSubmit={submit}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-gold)]">Password</p>
          <h2 className="mt-3 font-serif text-3xl">Change Password</h2>
          <div className="mt-6 space-y-5">
            <PasswordField label="Current Password" name="currentPassword" onChange={change} value={form.currentPassword} />
            <PasswordField autoComplete="new-password" label="New Password" name="newPassword" onChange={change} value={form.newPassword} />
            <PasswordField autoComplete="new-password" label="Confirm New Password" name="confirmPassword" onChange={change} value={form.confirmPassword} />
          </div>
          <Button className="mt-6 w-full" disabled={loading} type="submit">{loading ? 'Updating...' : 'Update Password'}</Button>
        </form>
      </section>
    </AccountLayout>
  )
}

export default Security
