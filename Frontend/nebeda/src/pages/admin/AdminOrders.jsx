import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmModal from '../../components/admin/ConfirmModal'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/toastContext'
import { logoutAdmin } from '../../services/authService'
import {
  archiveAdminOrder,
  getAdminOrders,
  updateAdminOrder,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
} from '../../services/orderService'

const orderStatuses = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
const paymentStatuses = ['All', 'Pending', 'Paid', 'Failed', 'Refunded']

function formatAmount(value) {
  return `£${Number(value || 0).toFixed(2)}`
}

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">{label}</p>
      <p className="mt-2 font-serif text-2xl text-white">{value}</p>
    </article>
  )
}

function AdminOrders() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({})
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderToArchive, setOrderToArchive] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    orderStatus: 'All',
    paymentStatus: 'All',
    startDate: '',
    endDate: '',
  })
  const [updateForm, setUpdateForm] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getAdminOrders({
        search: filters.search,
        orderStatus: filters.orderStatus,
        paymentStatus: filters.paymentStatus,
        startDate: filters.startDate,
        endDate: filters.endDate,
      })
      setOrders(data.orders || [])
      setStats(data.stats || {})
    } catch (apiError) {
      if (apiError.status === 401) {
        logoutAdmin()
        navigate('/admin/login', { replace: true })
        return
      }
      setError(apiError.message || 'Unable to load orders.')
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
        const data = await getAdminOrders({
          search: '',
          orderStatus: 'All',
          paymentStatus: 'All',
          startDate: '',
          endDate: '',
        })
        if (isMounted) {
          setOrders(data.orders || [])
          setStats(data.stats || {})
        }
      } catch (apiError) {
        if (apiError.status === 401) {
          logoutAdmin()
          navigate('/admin/login', { replace: true })
          return
        }
        if (isMounted) setError(apiError.message || 'Unable to load orders.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadInitialOrders()

    return () => {
      isMounted = false
    }
  }, [navigate])

  const filteredOrders = useMemo(() => orders, [orders])

  const updateFilter = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const openOrder = (order) => {
    setSelectedOrder(order)
    setUpdateForm({
      orderStatus: order.orderStatus || 'Pending',
      paymentStatus: order.paymentStatus || 'Pending',
      paymentProvider: order.paymentProvider || 'Not Set',
      trackingNumber: order.shipping?.trackingNumber || '',
      trackingCarrier: order.shipping?.trackingCarrier || '',
      trackingUrl: order.shipping?.trackingUrl || '',
      adminNotes: order.adminNotes || '',
    })
  }

  const saveStatus = async () => {
    try {
      const data = await updateAdminOrderStatus(selectedOrder._id, {
        orderStatus: updateForm.orderStatus,
        adminNotes: updateForm.adminNotes,
      })
      setSelectedOrder(data.order)
      showToast({ message: 'Order status updated.', type: 'success' })
      if (data.emailWarning) showToast({ message: data.emailWarning, type: 'warning' })
      await loadOrders()
    } catch (apiError) {
      showToast({ message: apiError.message || 'Unable to update order status.', type: 'error' })
    }
  }

  const savePayment = async () => {
    try {
      const data = await updateAdminPaymentStatus(selectedOrder._id, {
        paymentStatus: updateForm.paymentStatus,
        paymentProvider: updateForm.paymentProvider,
        adminNotes: updateForm.adminNotes,
      })
      setSelectedOrder(data.order)
      showToast({ message: 'Payment status updated.', type: 'success' })
      if (data.emailWarning) showToast({ message: data.emailWarning, type: 'warning' })
      await loadOrders()
    } catch (apiError) {
      showToast({ message: apiError.message || 'Unable to update payment status.', type: 'error' })
    }
  }

  const saveAll = async () => {
    try {
      const data = await updateAdminOrder(selectedOrder._id, updateForm)
      setSelectedOrder(data.order)
      showToast({ message: 'Order updated successfully.', type: 'success' })
      if (data.emailWarning) showToast({ message: data.emailWarning, type: 'warning' })
      await loadOrders()
    } catch (apiError) {
      showToast({ message: apiError.message || 'Unable to update order.', type: 'error' })
    }
  }

  const confirmArchive = async () => {
    try {
      await archiveAdminOrder(orderToArchive._id)
      setOrderToArchive(null)
      setSelectedOrder(null)
      showToast({ message: 'Order archived successfully.', type: 'success' })
      await loadOrders()
    } catch (apiError) {
      showToast({ message: apiError.message || 'Unable to archive order.', type: 'error' })
    }
  }

  return (
    <AdminLayout subtitle="Manage customer purchases from the Shop checkout.">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
          Orders
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white">Checkout Orders</h2>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Orders" value={stats.totalOrders || 0} />
        <StatCard label="Pending" value={stats.pendingOrders || 0} />
        <StatCard label="Processing" value={stats.processingOrders || 0} />
        <StatCard label="Paid Orders" value={stats.paidOrders || 0} />
        <StatCard label="Total Revenue" value={formatAmount(stats.totalRevenue)} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Confirmed" value={stats.confirmedOrders || 0} />
        <StatCard label="Shipped" value={stats.shippedOrders || 0} />
        <StatCard label="Delivered" value={stats.deliveredOrders || 0} />
        <StatCard label="Cancelled" value={stats.cancelledOrders || 0} />
        <StatCard label="Pending Payments" value={stats.pendingPayments || 0} />
      </div>

      <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-3 xl:grid-cols-6">
        <input className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--color-gold)]" name="search" onChange={updateFilter} placeholder="Reference, customer, email" value={filters.search} />
        <select className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" name="orderStatus" onChange={updateFilter} value={filters.orderStatus}>
          {orderStatuses.map((item) => <option className="bg-black" key={item}>{item}</option>)}
        </select>
        <select className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" name="paymentStatus" onChange={updateFilter} value={filters.paymentStatus}>
          {paymentStatuses.map((item) => <option className="bg-black" key={item}>{item}</option>)}
        </select>
        <input className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" name="startDate" onChange={updateFilter} type="date" value={filters.startDate} />
        <input className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" name="endDate" onChange={updateFilter} type="date" value={filters.endDate} />
        <Button onClick={loadOrders} variant="primary">Apply</Button>
      </div>

      {isLoading ? <p className="mt-6 text-[var(--color-muted)]">Loading orders...</p> : null}
      {error ? <p className="mt-6 rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">{error}</p> : null}

      <div className="mt-8 hidden overflow-hidden rounded-[1.5rem] border border-white/10 lg:block">
        <table className="w-full table-fixed border-collapse bg-white/[0.035] text-left text-sm">
          <thead className="bg-white/[0.055] text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
            <tr>
              {['Reference', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date', 'Actions'].map((item) => <th className="px-4 py-4" key={item}>{item}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr className="border-t border-white/10 align-top" key={order._id}>
                <td className="break-all px-4 py-4 text-xs text-white/70">{order._id}</td>
                <td className="px-4 py-4"><p className="font-semibold text-white">{order.customer?.fullName}</p><p className="mt-1 truncate text-xs text-[var(--color-muted)]">{order.customer?.email}</p></td>
                <td className="px-4 py-4 text-white/70">{order.items?.length || 0}</td>
                <td className="px-4 py-4 text-[var(--color-gold)]">{formatAmount(order.totals?.total)}</td>
                <td className="px-4 py-4 text-white/70">{order.orderStatus}</td>
                <td className="px-4 py-4 text-white/70">{order.paymentStatus}</td>
                <td className="px-4 py-4 text-white/70">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-4"><button className="text-[var(--color-gold)] hover:text-white" onClick={() => openOrder(order)} type="button">View Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-4 lg:hidden">
        {filteredOrders.map((order) => (
          <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5" key={order._id}>
            <p className="break-all text-xs uppercase tracking-[0.18em] text-[var(--color-gold)]">{order._id}</p>
            <h3 className="mt-3 font-serif text-2xl text-white">{order.customer?.fullName}</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{order.customer?.email}</p>
            <p className="mt-3 text-sm text-white/70">{order.items?.length || 0} items · {formatAmount(order.totals?.total)}</p>
            <p className="mt-2 text-sm text-white/70">{order.orderStatus} · Payment {order.paymentStatus}</p>
            <Button className="mt-5" onClick={() => openOrder(order)} variant="outline">View Details</Button>
          </article>
        ))}
      </div>

      {!isLoading && !filteredOrders.length ? (
        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-8 text-center text-[var(--color-muted)]">No orders found.</div>
      ) : null}

      {selectedOrder ? (
        <section className="mt-8 rounded-[1.75rem] border border-[rgba(190,151,83,0.38)] bg-white/[0.045] p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="break-all text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">Order {selectedOrder._id}</p>
              <h3 className="mt-3 font-serif text-3xl text-white">{selectedOrder.customer?.fullName}</h3>
            </div>
            <Button onClick={() => setSelectedOrder(null)} variant="outline">Close</Button>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 p-5 text-sm leading-7 text-[var(--color-muted)]">
              <p className="font-semibold text-white">Customer Information</p>
              <p>{selectedOrder.customer?.email}</p>
              <p>{selectedOrder.customer?.whatsappNumber || 'No WhatsApp provided'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 p-5 text-sm leading-7 text-[var(--color-muted)]">
              <p className="font-semibold text-white">Shipping Information</p>
              <p>{selectedOrder.shipping?.addressLine1}</p>
              <p>{selectedOrder.shipping?.city}, {selectedOrder.shipping?.country}</p>
              <p>Method: {selectedOrder.shipping?.shippingMethod || 'Not set'}</p>
              <p>Cost: {formatAmount(selectedOrder.shipping?.shippingCost ?? selectedOrder.totals?.deliveryFee, selectedOrder.currency)}</p>
              <p>Region: {selectedOrder.shipping?.shippingRegion || 'Not set'}</p>
              <p>Carrier: {selectedOrder.shipping?.shippingCarrier || 'Not set'}</p>
              <p>Estimated delivery: {selectedOrder.shipping?.estimatedDelivery || 'Not set'}</p>
              <p>Tracking number: {selectedOrder.shipping?.trackingNumber || 'Not assigned'}</p>
              <p>Tracking carrier: {selectedOrder.shipping?.trackingCarrier || 'Not assigned'}</p>
              {selectedOrder.shipping?.trackingUrl ? <a className="break-all text-[var(--color-gold)]" href={selectedOrder.shipping.trackingUrl} rel="noreferrer" target="_blank">Open tracking link</a> : null}
            </div>
            <div className="rounded-2xl border border-white/10 p-5 text-sm leading-7 text-[var(--color-muted)]">
              <p className="font-semibold text-white">Stripe Information</p>
              <p>Provider: {selectedOrder.paymentProvider}</p>
              <p>Session: {selectedOrder.stripeSessionId || 'Not set'}</p>
              <p>Intent: {selectedOrder.paymentIntentId || 'Not set'}</p>
              <p>Paid at: {selectedOrder.paidAt ? formatDate(selectedOrder.paidAt) : 'Not paid'}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 p-5">
              <p className="font-semibold text-white">Totals</p>
              <div className="mt-4 space-y-3 text-sm">
                <p className="flex justify-between"><span className="text-[var(--color-muted)]">Subtotal</span><span>{formatAmount(selectedOrder.totals?.subtotal)}</span></p>
                <p className="flex justify-between"><span className="text-[var(--color-muted)]">Delivery</span><span>{formatAmount(selectedOrder.totals?.deliveryFee)}</span></p>
                <p className="flex justify-between font-semibold"><span>Total</span><span className="text-[var(--color-gold)]">{formatAmount(selectedOrder.totals?.total)}</span></p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 p-5">
              <p className="font-semibold text-white">Timeline</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step) => (
                  <span
                    className={[
                      'rounded-full border px-3 py-2',
                      selectedOrder.orderStatus === step
                        ? 'border-[var(--color-gold)] bg-[rgba(190,151,83,0.14)] text-[var(--color-gold)]'
                        : 'border-white/10 text-white/55',
                    ].join(' ')}
                    key={step}
                  >
                    {step}
                  </span>
                ))}
                {selectedOrder.orderStatus === 'Cancelled' ? <span className="rounded-full border border-[var(--color-gold)] bg-[rgba(190,151,83,0.14)] px-3 py-2 text-[var(--color-gold)]">Cancelled</span> : null}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 p-5">
            <h4 className="font-serif text-2xl text-white">Products Purchased</h4>
            <div className="mt-5 space-y-4">
              {selectedOrder.items?.map((item) => (
                <div className="flex flex-col gap-4 border-b border-white/10 pb-4 last:border-b-0 sm:flex-row sm:items-center" key={`${item.name}-${item.product}`}>
                  {item.image ? <img alt={item.name} className="size-20 rounded-2xl object-cover" src={item.image} /> : null}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-[var(--color-muted)]">Qty {item.quantity} · Unit {item.price}</p>
                  </div>
                  <p className="text-[var(--color-gold)]">{formatAmount(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <select className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" onChange={(event) => setUpdateForm((current) => ({ ...current, orderStatus: event.target.value }))} value={updateForm.orderStatus}>
              {orderStatuses.filter((item) => item !== 'All').map((item) => <option className="bg-black" key={item}>{item}</option>)}
            </select>
            <select className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" onChange={(event) => setUpdateForm((current) => ({ ...current, paymentStatus: event.target.value }))} value={updateForm.paymentStatus}>
              {paymentStatuses.filter((item) => item !== 'All').map((item) => <option className="bg-black" key={item}>{item}</option>)}
            </select>
            <select className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]" onChange={(event) => setUpdateForm((current) => ({ ...current, paymentProvider: event.target.value }))} value={updateForm.paymentProvider}>
              {['Stripe', 'Manual', 'Not Set'].map((item) => <option className="bg-black" key={item}>{item}</option>)}
            </select>
            <input className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--color-gold)]" onChange={(event) => setUpdateForm((current) => ({ ...current, trackingNumber: event.target.value }))} placeholder="Tracking number" value={updateForm.trackingNumber} />
            <input className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--color-gold)]" onChange={(event) => setUpdateForm((current) => ({ ...current, trackingCarrier: event.target.value }))} placeholder="Tracking carrier" value={updateForm.trackingCarrier} />
            <input className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--color-gold)] md:col-span-2" onChange={(event) => setUpdateForm((current) => ({ ...current, trackingUrl: event.target.value }))} placeholder="Tracking URL" type="url" value={updateForm.trackingUrl} />
            <textarea className="min-h-28 rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--color-gold)] md:col-span-2" onChange={(event) => setUpdateForm((current) => ({ ...current, adminNotes: event.target.value }))} placeholder="Admin notes" value={updateForm.adminNotes} />
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Button onClick={saveStatus} variant="primary">Update Status</Button>
            <Button onClick={savePayment} variant="outline">Update Payment</Button>
            <Button onClick={saveAll} variant="outline">Save All</Button>
            <Button onClick={() => showToast({ message: 'Invoice printing will be added later.', type: 'info' })} variant="outline">Print Invoice</Button>
            <Button onClick={() => setOrderToArchive(selectedOrder)} variant="outline">Archive</Button>
          </div>
        </section>
      ) : null}

      <ConfirmModal
        confirmLabel="Archive Order"
        isOpen={Boolean(orderToArchive)}
        onCancel={() => setOrderToArchive(null)}
        onConfirm={confirmArchive}
        text="This order will be hidden from active order management but kept in backend records."
        title="Archive Order?"
      />
    </AdminLayout>
  )
}

export default AdminOrders
