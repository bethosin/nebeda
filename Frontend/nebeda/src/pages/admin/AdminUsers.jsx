import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminTable from '../../components/admin/AdminTable'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/toastContext'
import { logoutAdmin } from '../../services/authService'
import { getAdminUsers, updateAdminUserStatus } from '../../services/userAuthService'

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
}

function AdminUsers() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getAdminUsers()
      setUsers(data.users || [])
    } catch (apiError) {
      if (apiError.status === 401) {
        logoutAdmin()
        navigate('/admin/login', { replace: true })
        return
      }
      setError(apiError.message || 'Unable to load users.')
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadUsers()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase()
    return users.filter((user) => {
      const matchesSearch = [user.fullName, user.email, user.whatsappNumber]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
      const matchesStatus =
        status === 'All' ||
        (status === 'Active' && user.isActive) ||
        (status === 'Inactive' && !user.isActive)
      return matchesSearch && matchesStatus
    })
  }, [search, status, users])

  const setUserStatus = async (user) => {
    try {
      await updateAdminUserStatus(user._id, !user.isActive)
      showToast({
        message: user.isActive ? 'User deactivated successfully.' : 'User reactivated successfully.',
        type: 'success',
      })
      await loadUsers()
    } catch (apiError) {
      showToast({ message: apiError.message || 'Unable to update user.', type: 'error' })
    }
  }

  const columns = [
    { key: 'customer', label: 'Customer' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Signup Date' },
    { key: 'lastLogin', label: 'Last Login' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = filteredUsers.map((user) => ({
    id: user._id,
    customer: (
      <div>
        <p className="font-semibold text-white">{user.fullName}</p>
        <p className="mt-1 break-all text-xs text-[var(--color-muted)]">{user.email}</p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">{user.whatsappNumber || 'No WhatsApp'}</p>
      </div>
    ),
    status: user.isActive ? 'Active' : 'Inactive',
    created: formatDate(user.createdAt),
    lastLogin: formatDate(user.lastLogin),
    actions: (
      <Button className="px-4 py-2 text-[10px]" onClick={() => setUserStatus(user)} variant="outline">
        {user.isActive ? 'Deactivate' : 'Reactivate'}
      </Button>
    ),
  }))

  return (
    <AdminLayout subtitle="Manage registered Nebeda Threads customer accounts.">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
          Users
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white">Customer Users</h2>
      </div>

      <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_14rem]">
        <input
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--color-gold)]"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, or WhatsApp"
          value={search}
        />
        <select
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          {['All', 'Active', 'Inactive'].map((item) => (
            <option className="bg-black" key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">Total Users</p>
          <p className="mt-3 font-serif text-3xl text-white">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">Active</p>
          <p className="mt-3 font-serif text-3xl text-white">{users.filter((user) => user.isActive).length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">Inactive</p>
          <p className="mt-3 font-serif text-3xl text-white">{users.filter((user) => !user.isActive).length}</p>
        </div>
      </div>

      {isLoading ? <p className="mt-6 text-[var(--color-muted)]">Loading users...</p> : null}
      {error ? <p className="mt-6 rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">{error}</p> : null}

      <div className="mt-8">
        <AdminTable columns={columns} emptyMessage="No users found." rows={isLoading ? [] : rows} />
      </div>
    </AdminLayout>
  )
}

export default AdminUsers
