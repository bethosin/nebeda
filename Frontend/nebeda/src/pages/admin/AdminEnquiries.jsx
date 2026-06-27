import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminTable from '../../components/admin/AdminTable'
import ConfirmModal from '../../components/admin/ConfirmModal'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/toastContext'
import { logoutAdmin } from '../../services/authService'
import {
  archiveEnquiry,
  getAdminEnquiries,
  updateEnquiry,
} from '../../services/enquiryService'

const enquiryStatuses = ['All', 'New', 'Read', 'Replied']

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
}

function AdminEnquiries() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [enquiries, setEnquiries] = useState([])
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [enquiryToArchive, setEnquiryToArchive] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [isArchiving, setIsArchiving] = useState(false)
  const [error, setError] = useState('')
  const [updateForm, setUpdateForm] = useState({
    status: 'New',
    adminNotes: '',
  })

  const loadEnquiries = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getAdminEnquiries({ limit: 100, sort: '-createdAt' })
      setEnquiries(data.enquiries || [])
    } catch (apiError) {
      if (apiError.status === 401) {
        logoutAdmin()
        navigate('/admin/login', { replace: true })
        return
      }
      const message = apiError.message || 'Unable to load enquiries.'
      setError(message)
      showToast({ message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialEnquiries() {
      setIsLoading(true)
      setError('')
      try {
        const data = await getAdminEnquiries({ limit: 100, sort: '-createdAt' })
        if (isMounted) setEnquiries(data.enquiries || [])
      } catch (apiError) {
        if (apiError.status === 401) {
          logoutAdmin()
          navigate('/admin/login', { replace: true })
          return
        }
        if (isMounted) {
          const message = apiError.message || 'Unable to load enquiries.'
          setError(message)
          showToast({ message, type: 'error' })
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadInitialEnquiries()

    return () => {
      isMounted = false
    }
  }, [navigate, showToast])

  const filteredEnquiries = useMemo(() => {
    const query = search.toLowerCase()
    return enquiries.filter((enquiry) => {
      const matchesSearch = [
        enquiry.fullName,
        enquiry.email,
        enquiry.whatsappNumber,
        enquiry.enquiryType,
        enquiry.message,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
      const matchesStatus = status === 'All' || enquiry.status === status
      return matchesSearch && matchesStatus
    })
  }, [enquiries, search, status])

  const viewEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry)
    setUpdateForm({
      status: enquiry.status || 'New',
      adminNotes: enquiry.adminNotes || '',
    })
  }

  const saveEnquiry = async () => {
    if (!selectedEnquiry) return
    try {
      const data = await updateEnquiry(selectedEnquiry._id, updateForm)
      setSelectedEnquiry(data.enquiry)
      showToast({ message: 'Enquiry updated successfully.', type: 'success' })
      await loadEnquiries()
    } catch (apiError) {
      if (apiError.status === 401) {
        logoutAdmin()
        navigate('/admin/login', { replace: true })
        return
      }
      showToast({ message: apiError.message || 'Unable to update enquiry.', type: 'error' })
    }
  }

  const confirmArchiveEnquiry = async () => {
    if (!enquiryToArchive) return
    setIsArchiving(true)
    try {
      await archiveEnquiry(enquiryToArchive._id)
      setSelectedEnquiry(null)
      setEnquiryToArchive(null)
      showToast({ message: 'Enquiry archived successfully.', type: 'success' })
      await loadEnquiries()
    } catch (apiError) {
      if (apiError.status === 401) {
        logoutAdmin()
        navigate('/admin/login', { replace: true })
        return
      }
      showToast({ message: apiError.message || 'Unable to archive enquiry.', type: 'error' })
    } finally {
      setIsArchiving(false)
    }
  }

  const columns = [
    { key: 'customer', label: 'Customer' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Created' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = filteredEnquiries.map((enquiry) => ({
    id: enquiry._id,
    customer: (
      <div>
        <p className="font-semibold text-white">{enquiry.fullName}</p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">{enquiry.email}</p>
      </div>
    ),
    type: enquiry.enquiryType,
    status: enquiry.status,
    created: formatDate(enquiry.createdAt),
    actions: (
      <div className="flex flex-wrap gap-2">
        <Button className="px-4 py-2 text-[10px]" onClick={() => viewEnquiry(enquiry)} variant="outline">
          View
        </Button>
        <Button className="px-4 py-2 text-[10px]" onClick={() => setEnquiryToArchive(enquiry)} variant="outline">
          Archive
        </Button>
      </div>
    ),
  }))

  return (
    <AdminLayout subtitle="Review and manage customer contact enquiries.">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
          Enquiries
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white">Customer Enquiries</h2>
      </div>

      <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-2">
        <input
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--color-gold)]"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search enquiries"
          value={search}
        />
        <select className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" onChange={(event) => setStatus(event.target.value)} value={status}>
          {enquiryStatuses.map((item) => <option className="bg-black" key={item}>{item}</option>)}
        </select>
      </div>

      {isLoading ? <p className="mt-6 text-[var(--color-muted)]">Loading enquiries...</p> : null}
      {error ? <p className="mt-6 rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">{error}</p> : null}

      <div className="mt-8">
        <AdminTable columns={columns} emptyMessage="No enquiries found." rows={isLoading ? [] : rows} />
      </div>

      {selectedEnquiry ? (
        <section className="mt-8 rounded-[1.75rem] border border-[rgba(190,151,83,0.38)] bg-white/[0.045] p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
                Enquiry Details
              </p>
              <h3 className="mt-3 font-serif text-3xl text-white">{selectedEnquiry.fullName}</h3>
            </div>
            <Button onClick={() => setSelectedEnquiry(null)} variant="outline">Close</Button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">Customer</p>
              <p className="mt-3 text-white">{selectedEnquiry.email}</p>
              <p className="mt-2 text-white/62">{selectedEnquiry.whatsappNumber || 'No WhatsApp number'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">Message</p>
              <p className="mt-3 text-sm leading-7 text-white/72">{selectedEnquiry.message}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <select className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" onChange={(event) => setUpdateForm((current) => ({ ...current, status: event.target.value }))} value={updateForm.status}>
              {enquiryStatuses.filter((item) => item !== 'All').map((item) => <option className="bg-black" key={item}>{item}</option>)}
            </select>
            <textarea className="min-h-32 rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--color-gold)]" onChange={(event) => setUpdateForm((current) => ({ ...current, adminNotes: event.target.value }))} placeholder="Admin notes" value={updateForm.adminNotes} />
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <Button onClick={saveEnquiry} variant="primary">Save Enquiry Update</Button>
            <Button onClick={() => setEnquiryToArchive(selectedEnquiry)} variant="outline">Archive Enquiry</Button>
          </div>
        </section>
      ) : null}

      <ConfirmModal
        confirmLabel="Archive Enquiry"
        isOpen={Boolean(enquiryToArchive)}
        isWorking={isArchiving}
        onCancel={() => setEnquiryToArchive(null)}
        onConfirm={confirmArchiveEnquiry}
        text="This enquiry will be hidden from the active admin list but kept in backend records."
        title="Archive Enquiry?"
      />
    </AdminLayout>
  )
}

export default AdminEnquiries
