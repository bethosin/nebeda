import { useEffect, useState } from 'react'
import AccountLayout from '../../components/account/AccountLayout'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/toastContext'
import { updateProfile } from '../../services/accountService'
import { getCurrentUser, getStoredUser } from '../../services/userAuthService'

function Profile() {
  const { showToast } = useToast()
  const [user, setUser] = useState(getStoredUser)
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    whatsappNumber: user?.whatsappNumber || '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getCurrentUser().then(({ user: current }) => {
      setUser(current)
      setProfile({
        fullName: current?.fullName || '',
        email: current?.email || '',
        whatsappNumber: current?.whatsappNumber || '',
      })
    }).catch(() => {})
  }, [])

  const saveProfile = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      const data = await updateProfile(profile)
      if (data.user) {
        localStorage.setItem('nebedaUser', JSON.stringify(data.user))
        setUser(data.user)
        window.dispatchEvent(new Event('nebedaUserAuthChanged'))
      }
      showToast({ message: data.message || 'Profile updated successfully.', type: 'success' })
    } catch (error) {
      showToast({ message: error.message || 'Unable to update profile.', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AccountLayout>
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">Profile</p>
        <h1 className="mt-3 font-serif text-4xl">Account Details</h1>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <form className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6" onSubmit={saveProfile}>
          <div className="grid gap-5">
            {[
              ['fullName', 'Full Name', 'text'],
              ['email', 'Email', 'email'],
              ['whatsappNumber', 'WhatsApp Number', 'tel'],
            ].map(([name, label, type]) => (
              <label className="block" key={name}>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">{label}</span>
                <input className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none focus:border-[var(--color-gold)]" name={name} onChange={(event) => setProfile((current) => ({ ...current, [name]: event.target.value }))} type={type} value={profile[name]} />
              </label>
            ))}
          </div>
          <Button className="mt-7" disabled={isSaving} type="submit">{isSaving ? 'Saving...' : 'Save Profile'}</Button>
        </form>
        <aside className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">Email Status</p>
          <p className="mt-3 font-serif text-2xl">{user?.isEmailVerified ? 'Verified' : 'Verification required'}</p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">Password and verification controls are kept in Security.</p>
          <Button className="mt-5" to="/account/security" variant="outline">Security Settings</Button>
        </aside>
      </div>
    </AccountLayout>
  )
}

export default Profile
