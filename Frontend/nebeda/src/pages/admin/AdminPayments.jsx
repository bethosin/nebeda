import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import DashboardCard from '../../components/admin/DashboardCard'
import { logoutAdmin } from '../../services/authService'
import { getAdminCustomOrders } from '../../services/customOrderService'

function AdminPayments() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadOrders() {
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
        if (isMounted) setError(apiError.message || 'Unable to load payment data.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadOrders()

    return () => {
      isMounted = false
    }
  }, [navigate])

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.paymentStatus === 'Pending').length
    const paid = orders.filter((order) => order.paymentStatus === 'Paid').length
    return [
      { label: 'Pending Payments', value: String(pending) },
      { label: 'Paid Orders', value: String(paid) },
      { label: 'Stripe Status', value: 'Pending' },
    ]
  }, [orders])

  const pendingOrders = orders.filter((order) => order.paymentStatus === 'Pending')

  return (
    <AdminLayout subtitle="Payment readiness view. Stripe will be connected in a later backend stage.">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
          Payments
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white">Payment Overview</h2>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {stats.map((stat, index) => (
          <DashboardCard index={index} key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {isLoading ? <p className="mt-6 text-[var(--color-muted)]">Loading payment overview...</p> : null}
      {error ? <p className="mt-6 rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">{error}</p> : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
            Pending Payments
          </p>
          <div className="mt-5 space-y-3">
            {pendingOrders.length ? (
              pendingOrders.map((order) => (
                <div className="rounded-2xl border border-white/10 bg-black/35 p-4" key={order._id}>
                  <p className="font-semibold text-white">{order.fullName}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {order.outfitType} · {order.estimatedPrice || 'Price not set'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--color-muted)]">No pending payments yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-[rgba(190,151,83,0.38)] bg-[rgba(190,151,83,0.08)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
            Stripe Setup Notice
          </p>
          <h3 className="mt-4 font-serif text-3xl text-white">Stripe Integration Status: Pending Setup</h3>
          <p className="mt-5 text-base leading-8 text-[var(--color-muted)]">
            Stripe Checkout will be connected through secure backend routes later. No payment logic is active yet.
          </p>
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminPayments
