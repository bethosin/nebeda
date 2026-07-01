import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useToast } from '../../components/ui/toastContext'
import { getEmailLogs, retryEmailLog } from '../../services/emailLogService'

function AdminEmailLogs() {
  const { showToast } = useToast()
  const [data, setData] = useState({ logs: [], templates: [], total: 0, failed: 0 })
  const [filters, setFilters] = useState({ search: '', status: 'All', template: 'All' })
  const [loading, setLoading] = useState(true)
  const [retryingId, setRetryingId] = useState('')

  useEffect(() => {
    let active = true
    getEmailLogs(filters)
      .then((response) => { if (active) setData(response) })
      .catch((error) => {
        if (active) showToast({ message: error.message || 'Unable to load email logs.', type: 'error' })
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [filters, showToast])

  const updateFilter = (event) => {
    setLoading(true)
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const retry = async (id) => {
    setRetryingId(id)
    try {
      await retryEmailLog(id)
      showToast({ message: 'Email sent successfully.', type: 'success' })
      const response = await getEmailLogs(filters)
      setData(response)
    } catch (error) {
      showToast({ message: error.message || 'Unable to retry this email.', type: 'error' })
    } finally {
      setRetryingId('')
    }
  }

  return (
    <AdminLayout subtitle="Monitor Resend delivery and safely retry failed notifications.">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-gold)]">Communications</p>
            <h1 className="mt-2 font-serif text-4xl">Email Logs</h1>
          </div>
          <div className="text-sm text-white/60">{data.total} emails · {data.failed} failed</div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_11rem_14rem]">
          <input aria-label="Search email logs" className="min-w-0 rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-[var(--color-gold)]" name="search" onChange={updateFilter} placeholder="Search recipient or subject" value={filters.search} />
          <select className="rounded-xl border border-white/10 bg-black px-4 py-3" name="status" onChange={updateFilter} value={filters.status}>
            <option>All</option><option>Pending</option><option>Sent</option><option>Failed</option>
          </select>
          <select className="min-w-0 rounded-xl border border-white/10 bg-black px-4 py-3" name="template" onChange={updateFilter} value={filters.template}>
            <option>All</option>
            {data.templates.map((template) => <option key={template} value={template}>{template}</option>)}
          </select>
        </div>

        {loading ? <p className="text-white/60">Loading email logs...</p> : null}
        {!loading && !data.logs.length ? <div className="rounded-2xl border border-white/10 p-8 text-center text-white/60">No email logs found.</div> : null}
        <div className="grid gap-3">
          {data.logs.map((log) => (
            <article className="grid min-w-0 gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-5 lg:grid-cols-[1fr_1.3fr_8rem_10rem]" key={log._id}>
              <p className="break-all text-sm text-white">{log.recipient}</p>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm text-white">{log.subject}</p>
                <p className="mt-1 break-words text-xs text-white/45">{log.template}</p>
              </div>
              <span className={log.status === 'Sent' ? 'text-sm text-emerald-300' : log.status === 'Failed' ? 'text-sm text-red-300' : 'text-sm text-amber-200'}>{log.status}</span>
              <time className="text-xs text-white/50">{new Date(log.createdAt).toLocaleString('en-GB')}</time>
              {log.error ? <p className="break-words text-xs text-red-200 lg:col-span-3">{log.error}</p> : null}
              {log.status === 'Failed' ? (
                <button className="w-full rounded-xl border border-[rgba(190,151,83,.45)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)] transition hover:bg-[var(--color-gold)] hover:text-black lg:col-start-4" disabled={retryingId === log._id} onClick={() => retry(log._id)} type="button">
                  {retryingId === log._id ? 'Retrying...' : 'Retry'}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminEmailLogs
