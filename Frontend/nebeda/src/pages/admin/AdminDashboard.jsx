import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminLayout from '../../components/admin/AdminLayout'
import DashboardCard from '../../components/admin/DashboardCard'
import Button from '../../components/ui/Button'
import { logoutAdmin } from '../../services/authService'
import { getDashboardStats } from '../../services/dashboardService'

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
}

function ActivityList({ emptyText, items, renderItem, title }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map(renderItem)
        ) : (
          <p className="text-sm text-[var(--color-muted)]">{emptyText}</p>
        )}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await getDashboardStats()
      setDashboardData(data)
    } catch (apiError) {
      if (apiError.status === 401) {
        logoutAdmin()
        navigate('/admin/login', { replace: true })
        return
      }
      setError(apiError.message || 'Unable to load dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboardData()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadDashboardData])

  const recent = dashboardData?.recent || {}

  const dashboardStats = useMemo(() => {
    const stats = dashboardData?.stats || {}

    return [
      { label: 'Total Users', value: String(stats.totalUsers ?? 0) },
      { label: 'Total Orders', value: String(stats.totalOrders ?? 0) },
      { label: 'Processing Orders', value: String(stats.processingOrders ?? 0) },
      { label: 'Shipped Orders', value: String(stats.shippedOrders ?? 0) },
      { label: 'Delivered Orders', value: String(stats.deliveredOrders ?? 0) },
      { label: 'Pending Payments', value: String(stats.pendingPayments ?? 0) },
      { label: 'Paid Orders', value: String(stats.paidOrders ?? 0) },
      { label: 'Total Revenue', value: `£${Number(stats.totalRevenue || 0).toFixed(2)}` },
      { label: 'Custom Orders', value: String(stats.customOrders ?? 0) },
      { label: 'Enquiries', value: String(stats.enquiries ?? 0) },
      { label: 'Newsletter Subscribers', value: String(stats.newsletterSubscribers ?? 0) },
      { label: 'Products', value: String(stats.totalProducts ?? 0) },
    ]
  }, [dashboardData])

  const latestUsers = recent.users || []
  const latestOrders = recent.orders || []
  const latestCustomOrders = recent.customOrders || []
  const latestProducts = recent.products || []

  return (
    <AdminLayout subtitle="Live overview of Nebeda Threads customers, orders, and products.">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <DashboardCard index={index} key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {isLoading ? (
        <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-[var(--color-muted)]">
          Loading live dashboard data...
        </p>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">
          <p>{error}</p>
          <Button className="mt-4 px-4 py-2 text-[10px]" onClick={loadDashboardData} variant="outline">
            Retry
          </Button>
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.045)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.25 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
            Recent Activity
          </p>
          {latestUsers.length || latestOrders.length || latestCustomOrders.length || latestProducts.length ? (
            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              <ActivityList
                emptyText="No users yet."
                items={latestUsers}
                renderItem={(user) => (
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4" key={user._id}>
                    <p className="font-semibold text-white">{user.fullName}</p>
                    <p className="mt-1 break-all text-sm text-[var(--color-muted)]">
                      {user.email} · {formatDate(user.createdAt)}
                    </p>
                  </div>
                )}
                title="Latest Users"
              />
              <ActivityList
                emptyText="No cart orders yet."
                items={latestOrders}
                renderItem={(order) => (
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4" key={order._id}>
                    <p className="font-semibold text-white">{order.customer?.fullName}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {order.orderStatus} · {order.paymentStatus} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                )}
                title="Latest Orders"
              />
              <ActivityList
                emptyText="No custom orders yet."
                items={latestCustomOrders}
                renderItem={(order) => (
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4" key={order._id}>
                    <p className="font-semibold text-white">{order.fullName}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {order.outfitType} · {order.orderStatus} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                )}
                title="Latest Custom Orders"
              />
              <ActivityList
                emptyText="No products yet."
                items={latestProducts}
                renderItem={(product) => (
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4" key={product._id}>
                    <p className="font-semibold text-white">{product.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {product.displayCategory} · {formatDate(product.createdAt)}
                    </p>
                  </div>
                )}
                title="Latest Products"
              />
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-6">
              <h2 className="font-serif text-3xl text-white">No recent activity yet.</h2>
              <p className="mt-4 text-base leading-8 text-[var(--color-muted)]">
                Customer, product, and order updates will appear here once records are created.
              </p>
            </div>
          )}
        </motion.section>

        <motion.section
          className="rounded-[1.5rem] border border-[rgba(190,151,83,0.38)] bg-[linear-gradient(135deg,rgba(243,234,217,0.1),rgba(255,255,255,0.035))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.65, ease: 'easeOut', delay: 0.08 }}
          viewport={{ once: true, amount: 0.25 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
            Quick Actions
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <Button to="/admin/products/add" variant="primary">Add New Product</Button>
            <Button to="/admin/products" variant="outline">View Products</Button>
            <Button to="/admin/users" variant="outline">View Users</Button>
            <Button to="/admin/newsletter" variant="outline">View Newsletter</Button>
            <Button to="/admin/orders" variant="outline">View Custom Orders</Button>
          </div>
        </motion.section>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
