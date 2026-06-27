import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmModal from '../../components/admin/ConfirmModal'
import Button from '../../components/ui/Button'
import fallbackProductImage from '../../assets/images/products/product-1.jpg'
import { useToast } from '../../components/ui/toastContext'
import { logoutAdmin } from '../../services/authService'
import {
  deleteProduct,
  getAdminProducts,
  permanentlyDeleteProduct,
  restoreProduct,
} from '../../services/productService'

const categories = ['All', 'Men', 'Women', 'Ready to Wear', 'Bespoke', 'Wedding']
const statuses = ['All', 'Active', 'Inactive']
const productsPerPage = 8

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
}

function productImage(product) {
  const mainImage = product.mainImage?.url
  const firstImage = product.images?.[0]?.url

  if (typeof mainImage === 'string' && mainImage.startsWith('http')) {
    return mainImage
  }

  if (typeof firstImage === 'string' && firstImage.startsWith('http')) {
    return firstImage
  }

  return fallbackProductImage
}

function StatusPill({ active }) {
  return (
    <span
      className={[
        'inline-flex max-w-full rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
        active
          ? 'border-[rgba(190,151,83,0.6)] bg-[rgba(190,151,83,0.12)] text-[var(--color-gold)]'
          : 'border-white/10 bg-white/[0.04] text-white/52',
      ].join(' ')}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function MetaItem({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-black/30 px-3 py-3">
      <p className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)]">
        {label}
      </p>
      <p className="mt-1 min-w-0 break-words text-sm font-semibold text-white/86">{value}</p>
    </div>
  )
}

function Pagination({ currentPage, onPageChange, totalPages }) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Admin products pagination"
      className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4 sm:flex-row"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/52">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          className="rounded-full border border-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/72 transition hover:border-[rgba(190,151,83,0.72)] hover:text-[var(--color-gold)] disabled:cursor-not-allowed disabled:opacity-35"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
          const isActive = page === currentPage

          return (
            <button
              aria-current={isActive ? 'page' : undefined}
              className={[
                'grid size-9 place-items-center rounded-full border text-sm font-semibold transition',
                isActive
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-black'
                  : 'border-white/12 text-white/72 hover:border-[rgba(190,151,83,0.72)] hover:text-[var(--color-gold)]',
              ].join(' ')}
              key={page}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          )
        })}
        <button
          className="rounded-full border border-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/72 transition hover:border-[rgba(190,151,83,0.72)] hover:text-[var(--color-gold)] disabled:cursor-not-allowed disabled:opacity-35"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </nav>
  )
}

function ProductSkeletonCard() {
  return (
    <article className="flex min-h-[31rem] animate-pulse flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04]">
      <div className="aspect-[4/3] bg-white/10" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="h-5 w-3/4 rounded-full bg-white/10" />
        <div className="h-4 w-1/2 rounded-full bg-white/10" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 rounded-2xl bg-white/10" />
          <div className="h-16 rounded-2xl bg-white/10" />
        </div>
        <div className="mt-auto h-11 rounded-full bg-white/10" />
      </div>
    </article>
  )
}

function ProductCard({
  isWorking,
  onArchive,
  onDelete,
  onRestore,
  product,
}) {
  const image = productImage(product)

  return (
    <article className="group flex min-h-[31rem] min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.045] shadow-[0_24px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:border-[rgba(190,151,83,0.55)] hover:bg-white/[0.06]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/50">
        <img
          alt={product.mainImage?.alt || product.name || 'Nebeda Threads product'}
          className="size-full object-cover transition duration-500 group-hover:scale-[1.035]"
          loading="lazy"
          src={image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/12 to-transparent" />
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
          <span className="max-w-full rounded-full border border-[rgba(190,151,83,0.55)] bg-black/70 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold)] backdrop-blur">
            {product.badge}
          </span>
          <StatusPill active={product.isActive} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 break-words font-serif text-xl leading-tight text-white">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-white/58">
            {product.displayCategory || 'Uncategorised'}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MetaItem label="Price" value={product.price || 'Not set'} />
          <MetaItem label="Inventory" value={product.inventory ?? 0} />
          <MetaItem label="Featured" value={product.isFeatured ? 'Yes' : 'No'} />
          <MetaItem label="Created" value={formatDate(product.createdAt)} />
        </div>

        <div className="mt-auto pt-5">
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            <Button
              className="w-full px-3 py-2 text-[9px] tracking-[0.13em]"
              to={`/admin/products/edit/${product._id}`}
              variant="outline"
            >
              Edit
            </Button>
            {product.isActive ? (
              <Button
                className="w-full px-3 py-2 text-[9px] tracking-[0.13em]"
                onClick={() => onArchive(product)}
                variant="outline"
              >
                Archive
              </Button>
            ) : (
              <Button
                className="w-full px-3 py-2 text-[9px] tracking-[0.13em]"
                disabled={isWorking}
                onClick={() => onRestore(product)}
                variant="outline"
              >
                Restore
              </Button>
            )}
            <Button
              className="w-full border-red-400/70 px-3 py-2 text-[9px] tracking-[0.13em] text-red-100 hover:border-red-300 hover:bg-red-400/10"
              onClick={() => onDelete(product)}
              variant="outline"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

function AdminProducts() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)
  const [isWorking, setIsWorking] = useState(false)

  const handleUnauthorized = useCallback(() => {
    logoutAdmin()
    navigate('/admin/login', { replace: true })
  }, [navigate])

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getAdminProducts({ limit: 200, sort: '-createdAt' })
      setProducts(data.products || [])
    } catch (apiError) {
      if (apiError.status === 401) {
        handleUnauthorized()
        return
      }
      const message = apiError.message || 'Unable to load products.'
      setError(message)
      showToast({ message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [handleUnauthorized, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadProducts()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadProducts, location.state])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All' || product.categories?.includes(category)
      const matchesStatus =
        status === 'All' ||
        (status === 'Active' && product.isActive) ||
        (status === 'Inactive' && !product.isActive)
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [category, products, search, status])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const activePage = Math.min(currentPage, totalPages)

  const paginatedProducts = useMemo(() => {
    const start = (activePage - 1) * productsPerPage
    return filteredProducts.slice(start, start + productsPerPage)
  }, [activePage, filteredProducts])

  const runConfirmedAction = async () => {
    if (!confirmAction?.product) return
    setIsWorking(true)

    try {
      if (confirmAction.type === 'archive') {
        await deleteProduct(confirmAction.product._id)
        showToast({ message: 'Product archived successfully.', type: 'success' })
      }

      if (confirmAction.type === 'delete') {
        await permanentlyDeleteProduct(confirmAction.product._id)
        showToast({ message: 'Product deleted permanently.', type: 'success' })
      }

      setConfirmAction(null)
      await loadProducts()
    } catch (apiError) {
      if (apiError.status === 401) {
        handleUnauthorized()
        return
      }
      showToast({ message: apiError.message || 'Product action failed.', type: 'error' })
    } finally {
      setIsWorking(false)
    }
  }

  const restoreArchivedProduct = async (product) => {
    setIsWorking(true)
    try {
      await restoreProduct(product._id)
      showToast({ message: 'Product restored successfully.', type: 'success' })
      await loadProducts()
    } catch (apiError) {
      if (apiError.status === 401) {
        handleUnauthorized()
        return
      }
      showToast({ message: apiError.message || 'Unable to restore product.', type: 'error' })
    } finally {
      setIsWorking(false)
    }
  }

  const modalContent =
    confirmAction?.type === 'delete'
      ? {
          confirmLabel: 'Delete Permanently',
          text: 'This will permanently remove the product from the database. This action cannot be undone.',
          title: 'Delete Product Permanently?',
          tone: 'danger',
        }
      : {
          confirmLabel: 'Archive Product',
          text: 'This product will be hidden from the public shop but kept in the admin dashboard.',
          title: 'Archive Product?',
          tone: 'warning',
        }

  return (
    <AdminLayout subtitle="Manage product catalogue, inventory, and product visibility.">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
            Products
          </p>
          <h2 className="mt-3 font-serif text-4xl text-white">Product Management</h2>
        </div>
        <Button to="/admin/products/add" variant="primary">Add Product</Button>
      </div>

      <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-3">
        <input
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition placeholder:text-white/32 focus:border-[var(--color-gold)]"
          onChange={(event) => {
            setSearch(event.target.value)
            setCurrentPage(1)
          }}
          placeholder="Search product name"
          value={search}
        />
        <select
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]"
          onChange={(event) => {
            setCategory(event.target.value)
            setCurrentPage(1)
          }}
          value={category}
        >
          {categories.map((item) => <option className="bg-black" key={item}>{item}</option>)}
        </select>
        <select
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[var(--color-gold)]"
          onChange={(event) => {
            setStatus(event.target.value)
            setCurrentPage(1)
          }}
          value={status}
        >
          {statuses.map((item) => <option className="bg-black" key={item}>{item}</option>)}
        </select>
      </div>

      {error ? <p className="mt-6 rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">{error}</p> : null}

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1900px]:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <ProductSkeletonCard key={index} />
          ))}
        </div>
      ) : null}

      {!isLoading && !filteredProducts.length ? (
        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-6 py-16 text-center">
          <p className="font-serif text-3xl text-white">No products found</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/58">
            Add your first Nebeda Threads product to begin managing your shop.
          </p>
          <Button className="mt-7" to="/admin/products/add" variant="primary">
            Add Product
          </Button>
        </div>
      ) : null}

      {!isLoading && filteredProducts.length ? (
        <>
          <div className="mt-8 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1900px]:grid-cols-5">
            {paginatedProducts.map((product) => (
              <ProductCard
                isWorking={isWorking}
                key={product._id}
                onArchive={(selectedProduct) =>
                  setConfirmAction({ product: selectedProduct, type: 'archive' })
                }
                onDelete={(selectedProduct) =>
                  setConfirmAction({ product: selectedProduct, type: 'delete' })
                }
                onRestore={restoreArchivedProduct}
                product={product}
              />
            ))}
          </div>
          <Pagination
            currentPage={activePage}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
          />
        </>
      ) : null}

      <ConfirmModal
        confirmLabel={modalContent.confirmLabel}
        isOpen={Boolean(confirmAction)}
        isWorking={isWorking}
        onCancel={() => setConfirmAction(null)}
        onConfirm={runConfirmedAction}
        text={modalContent.text}
        title={modalContent.title}
        tone={modalContent.tone}
      />
    </AdminLayout>
  )
}

export default AdminProducts
