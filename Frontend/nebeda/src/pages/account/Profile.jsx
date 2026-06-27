import { useState } from 'react'
import AccountLayout from '../../components/account/AccountLayout'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/toastContext'
import { changePassword, updateProfile } from '../../services/accountService'
import { getStoredUser } from '../../services/userAuthService'

function Profile() {
  const { showToast } = useToast()
  const user = getStoredUser()
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    whatsappNumber: user?.whatsappNumber || '',
  })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  const updateProfileField = (event) => {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
  }

  const updatePasswordField = (event) => {
    const { name, value } = event.target
    setPasswords((current) => ({ ...current, [name]: value }))
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      const data = await updateProfile(profile)
      if (data.user) localStorage.setItem('nebedaUser', JSON.stringify(data.user))
      window.dispatchEvent(new Event('nebedaUserAuthChanged'))
      showToast({ message: 'Profile updated successfully.', type: 'success' })
    } catch (apiError) {
      showToast({ message: apiError.message || 'Unable to update profile.', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    setIsChanging(true)
    try {
      await changePassword(passwords)
      setPasswords({ currentPassword: '', newPassword: '' })
      showToast({ message: 'Password changed successfully.', type: 'success' })
    } catch (apiError) {
      showToast({ message: apiError.message || 'Unable to change password.', type: 'error' })
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <AccountLayout>
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
          Profile
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white">Account Details</h2>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <form className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6" onSubmit={saveProfile}>
          <h3 className="font-serif text-2xl text-white">Profile Information</h3>
          <div className="mt-6 grid gap-5">
            {[
              ['fullName', 'Full Name', 'text'],
              ['email', 'Email', 'email'],
              ['whatsappNumber', 'WhatsApp Number', 'tel'],
            ].map(([name, label, type]) => (
              <label className="block" key={name}>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">{label}</span>
                <input
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-[var(--color-gold)]"
                  name={name}
                  onChange={updateProfileField}
                  type={type}
                  value={profile[name]}
                />
              </label>
            ))}
          </div>
          <Button className="mt-7" disabled={isSaving} type="submit" variant="primary">
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>

        <form className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6" onSubmit={savePassword}>
          <h3 className="font-serif text-2xl text-white">Change Password</h3>
          <div className="mt-6 grid gap-5">
            {[
              ['currentPassword', 'Current Password'],
              ['newPassword', 'New Password'],
            ].map(([name, label]) => (
              <label className="block" key={name}>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">{label}</span>
                <input
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-[var(--color-gold)]"
                  name={name}
                  onChange={updatePasswordField}
                  type="password"
                  value={passwords[name]}
                />
              </label>
            ))}
          </div>
          <Button className="mt-7" disabled={isChanging} type="submit" variant="outline">
            {isChanging ? 'Updating...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </AccountLayout>
  )
}

export default Profile
