import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import ProductForm from '../../components/admin/ProductForm'
import {
  buildProductFormData,
  initialProductForm,
  productToForm,
} from '../../components/admin/productFormUtils'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/toastContext'
import { logoutAdmin } from '../../services/authService'
import {
  deleteProductImage,
  getAdminProductById,
  updateProduct,
} from '../../services/productService'

function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState(initialProductForm)
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removingImageId, setRemovingImageId] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    let isMounted = true

    async function loadProduct() {
      setIsLoading(true)
      setError('')
      try {
        const data = await getAdminProductById(id)
        if (!isMounted) return
        setProduct(data.product)
        setForm(productToForm(data.product))
      } catch (apiError) {
        if (apiError.status === 401) {
          logoutAdmin()
          navigate('/admin/login', { replace: true })
          return
        }
        const message = apiError.message || 'Unable to load product.'
        if (isMounted) setError(message)
        showToast({ message, type: 'error' })
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [id, navigate, showToast])

  const updateField = (event) => {
    const { checked, files, name, type, value } = event.target
    setError('')
    setFieldErrors({})

    if (type === 'file') {
      setForm((current) => ({ ...current, images: Array.from(files || []).slice(0, 6) }))
      return
    }

    if (type === 'checkbox' && name === 'categories') {
      setForm((current) => ({
        ...current,
        categories: checked
          ? [...current.categories, value]
          : current.categories.filter((category) => category !== value),
      }))
      return
    }

    if (type === 'checkbox') {
      setForm((current) => ({ ...current, [name]: checked }))
      return
    }

    setForm((current) => ({ ...current, [name]: value }))
  }

  const submitProduct = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setFieldErrors({})

    try {
      await updateProduct(id, buildProductFormData(form))
      showToast({ message: 'Product updated successfully.', type: 'success' })
      navigate('/admin/products', { replace: true, state: { refreshProducts: true } })
    } catch (apiError) {
      if (apiError.status === 401) {
        logoutAdmin()
        navigate('/admin/login', { replace: true })
        return
      }
      const errors = apiError.data?.errors || {}
      const message = Object.values(errors).join(' ') || apiError.message || 'Unable to update product.'
      setError(message)
      setFieldErrors(errors)
      showToast({ message, type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeImage = async (publicId) => {
    setRemovingImageId(publicId)
    try {
      const data = await deleteProductImage(id, publicId)
      setProduct(data.product)
      showToast({ message: 'Product image removed successfully.', type: 'success' })
    } catch (apiError) {
      if (apiError.status === 401) {
        logoutAdmin()
        navigate('/admin/login', { replace: true })
        return
      }
      showToast({ message: apiError.message || 'Unable to remove product image.', type: 'error' })
    } finally {
      setRemovingImageId('')
    }
  }

  return (
    <AdminLayout subtitle="Edit product details, images, and shop visibility.">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
          Edit Product
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white">
          {product?.name || 'Product Details'}
        </h2>
      </div>

      {isLoading ? (
        <p className="mt-8 text-[var(--color-muted)]">Loading product...</p>
      ) : null}

      {!isLoading && product?.images?.length ? (
        <section className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
            Existing Images
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.images.map((image) => (
              <article className="rounded-2xl border border-white/10 bg-black/35 p-3" key={image.publicId}>
                <img
                  alt={image.alt || product.name}
                  className="h-48 w-full rounded-xl object-cover"
                  src={image.url}
                />
                <Button
                  className="mt-3 w-full px-4 py-2 text-[10px]"
                  disabled={removingImageId === image.publicId}
                  onClick={() => removeImage(image.publicId)}
                  variant="outline"
                >
                  {removingImageId === image.publicId ? 'Removing...' : 'Remove Image'}
                </Button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!isLoading ? (
        <ProductForm
          error={error}
          fieldErrors={fieldErrors}
          form={form}
          isSubmitting={isSubmitting}
          onChange={updateField}
          onSubmit={submitProduct}
          submitLabel="Update Product"
          submittingLabel="Updating Product..."
        />
      ) : null}
    </AdminLayout>
  )
}

export default EditProduct
