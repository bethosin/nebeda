const CART_STORAGE_KEY = 'nebedaCart'

function loadStoredCart() {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)
    return storedCart ? JSON.parse(storedCart) : []
  } catch {
    return []
  }
}

function saveStoredCart(cartItems) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
}

function parsePriceValue(product) {
  if (typeof product.numericPrice === 'number' && product.numericPrice > 0) {
    return product.numericPrice
  }

  const priceText = String(product.price || '')
  const match = priceText.match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

// Future backend cart syncing can be added here without changing UI components.
// Example later: syncCartToBackend(cartItems), loadCartFromBackend(), mergeGuestCart().

export { CART_STORAGE_KEY, loadStoredCart, parsePriceValue, saveStoredCart }
