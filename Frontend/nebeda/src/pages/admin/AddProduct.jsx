import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import ProductForm from '../../components/admin/ProductForm'
import {
  buildProductFormData,
  initialProductForm,
} from '../../components/admin/productFormUtils'
import { useToast } from '../../components/ui/toastContext'
import { logoutAdmin } from '../../services/authService'
import { createProduct } from '../../services/productService'

function AddProduct() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState(initialProductForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

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
      await createProduct(buildProductFormData(form))
      showToast({ message: 'Product created successfully.', type: 'success' })
      navigate('/admin/products', { replace: true, state: { refreshProducts: true } })
    } catch (apiError) {
      if (apiError.status === 401) {
        logoutAdmin()
        navigate('/admin/login', { replace: true })
        return
      }
      const message = apiError.message || 'Unable to create product.'
      setError(message)
      setFieldErrors(apiError.data?.errors || {})
      showToast({ message, type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout subtitle="Upload real Nebeda Threads products for the public shop.">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
          Add Product
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white">Create Product</h2>
      </div>

      <ProductForm
        error={error}
        fieldErrors={fieldErrors}
        form={form}
        isSubmitting={isSubmitting}
        onChange={updateField}
        onSubmit={submitProduct}
        submitLabel="Create Product"
        submittingLabel="Creating Product..."
      />
    </AdminLayout>
  )
}

export default AddProduct
