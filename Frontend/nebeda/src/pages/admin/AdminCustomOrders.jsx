import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmModal from '../../components/admin/ConfirmModal'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/toastContext'
import { logoutAdmin } from '../../services/authService'
import { archiveCustomOrder, getAdminCustomOrders, updateCustomOrder } from '../../services/customOrderService'

const orderStatuses = ['All', 'New', 'Reviewed', 'In Progress', 'Awaiting Payment', 'Paid', 'Completed', 'Cancelled']
const paymentStatuses = ['All', 'Pending', 'Paid', 'Failed', 'Refunded']

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
}

function AdminCustomOrders() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderToArchive, setOrderToArchive] = useState(null)
  const [search, setSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState('All')
  const [paymentStatus, setPaymentStatus] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updateForm, setUpdateForm] = useState({})

  const loadOrders = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getAdminCustomOrders({ limit: 100 })
      setOrders(data.orders || [])
    } catch (apiError) {
      if (apiError.status === 401) {
        logoutAdmin()
        navigate('/admin/login', { replace: true })
        return
      }
      setError(apiError.message || 'Unable to load custom orders.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialOrders() {
      setIsLoading(true)
      setError('')
      try {
        const data = await getAdminCustomOrders({ limit: 100 })
        if (isMounted) setOrders(data.orders || [])
      } catch (apiError) {
        if (apiError.status === 401) {
          logoutAdmin()
          navigate('/admin/login', { replace: true })
          return
        }
        if (isMounted) setError(apiError.message || 'Unable to load custom orders.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadInitialOrders()

    return () => {
      isMounted = false
    }
  }, [navigate])

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase()
    return orders.filter((order) => {
      const matchesSearch = [order.fullName, order.email, order.whatsappNumber, order.outfitType, order.occasion]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
      const matchesOrderStatus = orderStatus === 'All' || order.orderStatus === orderStatus
      const matchesPaymentStatus = paymentStatus === 'All' || order.paymentStatus === paymentStatus
      return matchesSearch && matchesOrderStatus && matchesPaymentStatus
    })
  }, [orders, search, orderStatus, paymentStatus])

  const openOrder = (order) => {
    setSelectedOrder(order)
    setUpdateForm({
      orderStatus: order.orderStatus || 'New',
      paymentStatus: order.paymentStatus || 'Pending',
      paymentProvider: order.paymentProvider || 'Not Set',
      estimatedPrice: order.estimatedPrice || '',
      adminNotes: order.adminNotes || '',
    })
  }

  const saveOrder = async () => {
    try {
      const data = await updateCustomOrder(selectedOrder._id, updateForm)
      setSelectedOrder(data.order)
      showToast({ message: 'Custom order updated successfully.', type: 'success' })
      if (data.emailWarning) showToast({ message: data.emailWarning, type: 'warning' })
      await loadOrders()
    } catch (apiError) {
      showToast({ message: apiError.message || 'Unable to update custom order.', type: 'error' })
    }
  }

  const confirmArchive = async () => {
    try {
      await archiveCustomOrder(orderToArchive._id)
      setOrderToArchive(null)
      setSelectedOrder(null)
      showToast({ message: 'Custom order archived successfully.', type: 'success' })
      await loadOrders()
    } catch (apiError) {
      showToast({ message: apiError.message || 'Unable to archive custom order.', type: 'error' })
    }
  }

  return (
    <AdminLayout subtitle="Manage bespoke customer design requests.">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
          Custom Orders
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white">Bespoke Requests</h2>
      </div>

      <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-3">
        <input className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--color-gold)]" onChange={(event) => setSearch(event.target.value)} placeholder="Search custom orders" value={search} />
        <select className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" onChange={(event) => setOrderStatus(event.target.value)} value={orderStatus}>
          {orderStatuses.map((item) => <option className="bg-black" key={item}>{item}</option>)}
        </select>
        <select className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" onChange={(event) => setPaymentStatus(event.target.value)} value={paymentStatus}>
          {paymentStatuses.map((item) => <option className="bg-black" key={item}>{item}</option>)}
        </select>
      </div>

      {isLoading ? <p className="mt-6 text-[var(--color-muted)]">Loading custom orders...</p> : null}
      {error ? <p className="mt-6 rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">{error}</p> : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {filteredOrders.map((order) => (
          <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5" key={order._id}>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">{order.orderStatus} · {order.paymentStatus}</p>
            <h3 className="mt-3 font-serif text-2xl text-white">{order.fullName}</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{order.email} · {order.outfitType} · {order.orderType}</p>
            <p className="mt-2 text-xs text-white/45">{formatDate(order.createdAt)}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => openOrder(order)} variant="outline">View Details</Button>
              <Button onClick={() => setOrderToArchive(order)} variant="outline">Archive</Button>
            </div>
          </article>
        ))}
      </div>

      {!isLoading && !filteredOrders.length ? (
        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-8 text-center text-[var(--color-muted)]">
          No custom orders found.
        </div>
      ) : null}

      {selectedOrder ? (
        <section className="mt-8 rounded-[1.75rem] border border-[rgba(190,151,83,0.38)] bg-white/[0.045] p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">Custom Order Details</p>
              <h3 className="mt-3 font-serif text-3xl text-white">{selectedOrder.fullName}</h3>
            </div>
            <Button onClick={() => setSelectedOrder(null)} variant="outline">Close</Button>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <p className="text-sm leading-7 text-[var(--color-muted)]">Email: {selectedOrder.email}<br />WhatsApp: {selectedOrder.whatsappNumber}<br />Outfit: {selectedOrder.outfitType}<br />Fabric: {selectedOrder.fabricPreference}<br />Occasion: {selectedOrder.occasion}</p>
            <p className="text-sm leading-7 text-[var(--color-muted)]">Shipping: {selectedOrder.shipping?.shippingCountry}<br />Address: {selectedOrder.shipping?.addressLine1}<br />City: {selectedOrder.shipping?.city}<br />Country: {selectedOrder.shipping?.country}</p>
            <p className="text-sm leading-7 text-[var(--color-muted)]">Style Notes: {selectedOrder.styleNotes || 'Not provided'}<br />Admin Notes: {selectedOrder.adminNotes || 'Not provided'}</p>
          </div>
          {selectedOrder.inspirationImages?.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {selectedOrder.inspirationImages.map((image) => <img alt={image.alt} className="h-56 rounded-2xl object-cover" key={image.publicId} src={image.url} />)}
            </div>
          ) : null}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <select className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" onChange={(event) => setUpdateForm((current) => ({ ...current, orderStatus: event.target.value }))} value={updateForm.orderStatus}>
              {orderStatuses.filter((item) => item !== 'All').map((item) => <option className="bg-black" key={item}>{item}</option>)}
            </select>
            <select className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" onChange={(event) => setUpdateForm((current) => ({ ...current, paymentStatus: event.target.value }))} value={updateForm.paymentStatus}>
              {paymentStatuses.filter((item) => item !== 'All').map((item) => <option className="bg-black" key={item}>{item}</option>)}
            </select>
            <input className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--color-gold)]" onChange={(event) => setUpdateForm((current) => ({ ...current, estimatedPrice: event.target.value }))} placeholder="Estimated price" value={updateForm.estimatedPrice} />
            <textarea className="min-h-28 rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--color-gold)] md:col-span-2" onChange={(event) => setUpdateForm((current) => ({ ...current, adminNotes: event.target.value }))} placeholder="Admin notes" value={updateForm.adminNotes} />
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <Button onClick={saveOrder} variant="primary">Save Update</Button>
            <Button onClick={() => setOrderToArchive(selectedOrder)} variant="outline">Archive</Button>
          </div>
        </section>
      ) : null}

      <ConfirmModal
        confirmLabel="Archive Order"
        isOpen={Boolean(orderToArchive)}
        onCancel={() => setOrderToArchive(null)}
        onConfirm={confirmArchive}
        text="This custom order will be hidden from the active admin workflow but kept in backend records."
        title="Archive Custom Order?"
      />
    </AdminLayout>
  )
}

export default AdminCustomOrders
