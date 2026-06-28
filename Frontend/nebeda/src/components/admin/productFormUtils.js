const initialProductForm = {
  name: '',
  shortDescription: '',
  description: '',
  categories: [],
  displayCategory: '',
  gender: '',
  price: '',
  numericPrice: '',
  currency: 'GBP',
  badge: 'Ready to Wear',
  stockType: 'Ready to Wear',
  inventory: '0',
  sizes: '',
  colors: '',
  fabric: '',
  careInstructions: '',
  isFeatured: false,
  isActive: true,
  images: [],
}

function productToForm(product) {
  return {
    ...initialProductForm,
    name: product?.name || '',
    shortDescription: product?.shortDescription || '',
    description: product?.description || '',
    categories: product?.categories || [],
    displayCategory: product?.displayCategory || '',
    gender: product?.gender || '',
    price: product?.price || '',
    numericPrice: product?.numericPrice ?? '',
    currency: product?.currency || 'GBP',
    badge: product?.badge || 'Ready to Wear',
    stockType: product?.stockType || 'Ready to Wear',
    inventory: product?.inventory ?? '0',
    sizes: product?.sizes?.join(', ') || '',
    colors: product?.colors?.join(', ') || '',
    fabric: product?.fabric || '',
    careInstructions: product?.careInstructions || '',
    isFeatured: Boolean(product?.isFeatured),
    isActive: product?.isActive !== false,
    images: [],
  }
}

function buildProductFormData(form) {
  const formData = new FormData()
  const sizes = form.sizes.split(',').map((item) => item.trim()).filter(Boolean)
  const colors = form.colors.split(',').map((item) => item.trim()).filter(Boolean)

  formData.append('name', form.name)
  formData.append('shortDescription', form.shortDescription)
  formData.append('description', form.shortDescription)
  formData.append('categories', JSON.stringify(form.categories))
  formData.append('displayCategory', form.displayCategory)
  formData.append('gender', form.gender)
  formData.append('price', form.price)
  formData.append('currency', form.currency)
  formData.append('badge', form.badge)
  formData.append('stockType', form.stockType)
  formData.append('inventory', form.inventory)
  formData.append('sizes', JSON.stringify(sizes))
  formData.append('colors', JSON.stringify(colors))
  formData.append('fabric', form.fabric)
  formData.append(
    'careInstructions',
    form.careInstructions || 'Please follow fabric care guidance.',
  )
  formData.append('isFeatured', String(form.isFeatured))
  formData.append('isActive', String(form.isActive))

  if (form.numericPrice !== '') formData.append('numericPrice', form.numericPrice)
  form.images.forEach((image) => formData.append('images', image))

  return formData
}

export { buildProductFormData, initialProductForm, productToForm }
