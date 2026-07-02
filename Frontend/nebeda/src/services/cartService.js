const CART_STORAGE_KEY = 'nebedaCart'

function getCartItemId(productId, selectedSize = '', selectedColour = '') {
  return [productId, selectedSize || '-', selectedColour || '-'].join('::')
}

function loadStoredCart() {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)
    const items = storedCart ? JSON.parse(storedCart) : []
    if (!Array.isArray(items)) return []
    return items.filter((item) => item?.productId).map((item) => ({
      ...item,
      cartItemId: item.cartItemId || getCartItemId(item.productId, item.selectedSize, item.selectedColour),
      selectedSize: item.selectedSize || '',
      selectedColour: item.selectedColour || '',
    }))
  } catch {
    return []
  }
}

function saveStoredCart(cartItems) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
}

function parsePriceValue(product) {
  for (const candidate of [product.priceAmount, product.numericPrice]) {
    const amount = Number(candidate)
    if (Number.isFinite(amount) && amount > 0) return amount
  }
  const match = String(product.price || product.displayPrice || '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

export { CART_STORAGE_KEY, getCartItemId, loadStoredCart, parsePriceValue, saveStoredCart }
