import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getEmailLogs } from '../../services/emailLogService'

function AdminEmailLogs() {
  const [data, setData] = useState({ logs: [], total: 0, failed: 0 })
  const [status, setStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getEmailLogs({ search, status })
      .then((response) => { if (active) setData(response) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [search, status])

  return (
    <AdminLayout subtitle="Monitor Resend delivery and investigate failed customer notifications.">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs uppercase tracking-[0.24em] text-[var(--color-gold)]">Communications</p><h1 className="mt-2 font-serif text-4xl">Email Logs</h1></div>
          <div className="text-sm text-white/60">{data.total} emails · {data.failed} failed</div>
        </div>
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-[1fr_12rem]">
          <input aria-label="Search email logs" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-[var(--color-gold)]" onChange={(e) => setSearch(e.target.value)} placeholder="Search recipient or subject" value={search} />
          <select className="rounded-xl border border-white/10 bg-black px-4 py-3" onChange={(e) => setStatus(e.target.value)} value={status}><option>All</option><option>Sent</option><option>Failed</option></select>
        </div>
        {loading ? <p className="text-white/60">Loading email logs...</p> : null}
        {!loading && !data.logs.length ? <div className="rounded-2xl border border-white/10 p-8 text-center text-white/60">No email logs found.</div> : null}
        <div className="grid gap-3">
          {data.logs.map((log) => (
            <article className="grid min-w-0 gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-5 lg:grid-cols-[1fr_1.2fr_10rem_10rem]" key={log._id}>
              <p className="break-all text-sm text-white">{log.recipient}</p>
              <div className="min-w-0"><p className="truncate text-sm text-white">{log.subject}</p><p className="mt-1 text-xs text-white/45">{log.template}</p></div>
              <span className={log.status === 'Sent' ? 'text-sm text-emerald-300' : 'text-sm text-red-300'}>{log.status}</span>
              <time className="text-xs text-white/50">{new Date(log.createdAt).toLocaleString('en-GB')}</time>
              {log.error ? <p className="break-words text-xs text-red-200 lg:col-span-4">{log.error}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminEmailLogs
