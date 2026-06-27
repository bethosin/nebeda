import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminTable from '../../components/admin/AdminTable'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/toastContext'
import { logoutAdmin } from '../../services/authService'
import {
  deleteNewsletterSubscriber,
  getAdminNewsletterSubscribers,
  resubscribeNewsletterSubscriber,
  unsubscribeNewsletterSubscriber,
} from '../../services/newsletterService'

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
}

function AdminNewsletter() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [subscribers, setSubscribers] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSubscribers = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getAdminNewsletterSubscribers()
      setSubscribers(data.subscribers || [])
    } catch (apiError) {
      if (apiError.status === 401) {
        logoutAdmin()
        navigate('/admin/login', { replace: true })
        return
      }
      setError(apiError.message || 'Unable to load newsletter subscribers.')
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSubscribers()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadSubscribers])

  const filteredSubscribers = useMemo(() => {
    const query = search.toLowerCase()
    return subscribers.filter((subscriber) => {
      const matchesSearch = [subscriber.email, subscriber.fullName, subscriber.source]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
      const matchesStatus =
        status === 'All' ||
        (status === 'Active' && subscriber.isSubscribed) ||
        (status === 'Unsubscribed' && !subscriber.isSubscribed)
      return matchesSearch && matchesStatus
    })
  }, [search, status, subscribers])

  const activeCount = subscribers.filter((subscriber) => subscriber.isSubscribed).length
  const unsubscribedCount = subscribers.length - activeCount

  const runAction = async (action, successMessage) => {
    try {
      await action()
      showToast({ message: successMessage, type: 'success' })
      await loadSubscribers()
    } catch (apiError) {
      showToast({ message: apiError.message || 'Newsletter action failed.', type: 'error' })
    }
  }

  const columns = [
    { key: 'subscriber', label: 'Subscriber' },
    { key: 'status', label: 'Status' },
    { key: 'source', label: 'Source' },
    { key: 'subscribed', label: 'Subscribed' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = filteredSubscribers.map((subscriber) => ({
    id: subscriber._id,
    subscriber: (
      <div>
        <p className="font-semibold text-white">{subscriber.fullName || 'No name'}</p>
        <p className="mt-1 break-all text-xs text-[var(--color-muted)]">{subscriber.email}</p>
      </div>
    ),
    status: subscriber.isSubscribed ? 'Active' : 'Unsubscribed',
    source: subscriber.source || 'Not set',
    subscribed: formatDate(subscriber.subscribedAt),
    actions: (
      <div className="flex flex-wrap gap-2">
        {subscriber.isSubscribed ? (
          <Button
            className="px-4 py-2 text-[10px]"
            onClick={() =>
              runAction(
                () => unsubscribeNewsletterSubscriber(subscriber._id),
                'Subscriber unsubscribed successfully.',
              )
            }
            variant="outline"
          >
            Unsubscribe
          </Button>
        ) : (
          <Button
            className="px-4 py-2 text-[10px]"
            onClick={() =>
              runAction(
                () => resubscribeNewsletterSubscriber(subscriber._id),
                'Subscriber resubscribed successfully.',
              )
            }
            variant="outline"
          >
            Resubscribe
          </Button>
        )}
        <Button
          className="px-4 py-2 text-[10px]"
          onClick={() =>
            runAction(
              () => deleteNewsletterSubscriber(subscriber._id),
              'Subscriber deleted successfully.',
            )
          }
          variant="outline"
        >
          Delete
        </Button>
      </div>
    ),
  }))

  return (
    <AdminLayout subtitle="Manage Nebeda Threads newsletter subscribers.">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
          Newsletter
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white">Newsletter Subscribers</h2>
      </div>

      <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_14rem]">
        <input
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--color-gold)]"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search email, name, or source"
          value={search}
        />
        <select
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          {['All', 'Active', 'Unsubscribed'].map((item) => (
            <option className="bg-black" key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">Total</p>
          <p className="mt-3 font-serif text-3xl text-white">{subscribers.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">Active</p>
          <p className="mt-3 font-serif text-3xl text-white">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">Unsubscribed</p>
          <p className="mt-3 font-serif text-3xl text-white">{unsubscribedCount}</p>
        </div>
      </div>

      {isLoading ? <p className="mt-6 text-[var(--color-muted)]">Loading subscribers...</p> : null}
      {error ? <p className="mt-6 rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">{error}</p> : null}

      <div className="mt-8">
        <AdminTable columns={columns} emptyMessage="No newsletter subscribers found." rows={isLoading ? [] : rows} />
      </div>
    </AdminLayout>
  )
}

export default AdminNewsletter
