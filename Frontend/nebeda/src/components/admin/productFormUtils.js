const initialProductForm = {
  name: '',
  shortDescription: '',
  description: '',
  categories: [],
  displayCategory: '',
  gender: '',
  priceAmount: '',
  currency: 'GBP',
  isQuoteOnly: false,
  badge: 'Ready to Wear',
  stockType: 'Ready to Wear',
  inventory: '0',
  trackInventory: false,
  sizes: [],
  colors: [],
  variations: [],
  fabric: '',
  careInstructions: '',
  isFeatured: false,
  isActive: true,
  images: [],
}

function parseLegacyAmount(product) {
  const direct = Number(product?.priceAmount ?? product?.numericPrice)
  if (Number.isFinite(direct) && direct > 0) return direct
  const match = String(product?.price || product?.displayPrice || '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : ''
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
    priceAmount: parseLegacyAmount(product),
    currency: product?.currency === 'EUR' ? 'EUR' : 'GBP',
    isQuoteOnly: Boolean(product?.isQuoteOnly),
    badge: product?.badge || 'Ready to Wear',
    stockType: product?.stockType || 'Ready to Wear',
    inventory: product?.inventory ?? '0',
    trackInventory: Boolean(product?.trackInventory),
    sizes: product?.sizes || [],
    colors: product?.colors || [],
    variations: product?.variations || [],
    fabric: product?.fabric || '',
    careInstructions: product?.careInstructions || '',
    isFeatured: Boolean(product?.isFeatured),
    isActive: product?.isActive !== false,
    images: [],
  }
}

function buildVariations(form) {
  const sizes = form.sizes.length ? form.sizes : ['']
  const colors = form.colors.length ? form.colors : ['']
  return sizes.flatMap((size) => colors.map((color) => {
    const existing = form.variations.find((entry) => entry.size === size && entry.color === color)
    return {
      size: size || undefined,
      color: color || undefined,
      stock: existing?.stock,
      image: existing?.image,
      isActive: existing?.isActive !== false,
    }
  }))
}

function buildProductFormData(form) {
  const formData = new FormData()
  formData.append('name', form.name)
  formData.append('shortDescription', form.shortDescription)
  formData.append('description', form.shortDescription)
  formData.append('categories', JSON.stringify(form.categories))
  formData.append('displayCategory', form.displayCategory)
  formData.append('gender', form.gender)
  formData.append('currency', form.currency)
  formData.append('isQuoteOnly', String(form.isQuoteOnly))
  if (!form.isQuoteOnly) formData.append('priceAmount', form.priceAmount)
  formData.append('badge', form.badge)
  formData.append('stockType', form.stockType)
  formData.append('inventory', form.inventory)
  formData.append('trackInventory', String(form.trackInventory))
  formData.append('sizes', JSON.stringify(form.sizes))
  formData.append('colors', JSON.stringify(form.colors))
  formData.append('variations', JSON.stringify(buildVariations(form)))
  formData.append('fabric', form.fabric)
  formData.append('careInstructions', form.careInstructions || 'Please follow fabric care guidance.')
  formData.append('isFeatured', String(form.isFeatured))
  formData.append('isActive', String(form.isActive))
  form.images.forEach((image) => formData.append('images', image))
  return formData
}

export { buildProductFormData, initialProductForm, productToForm }
