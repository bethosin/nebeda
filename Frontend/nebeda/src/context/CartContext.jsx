import { useCallback, useEffect, useMemo, useState } from 'react'
import productFallback from '../assets/images/products/product-1.jpg'
import { CartContext } from './cartContextValue'
import { loadStoredCart, parsePriceValue, saveStoredCart } from '../services/cartService'

function getProductImage(product) {
  const mainImage = product.mainImage?.url
  const firstImage = product.images?.[0]?.url

  if (typeof mainImage === 'string' && mainImage.startsWith('http')) return mainImage
  if (typeof firstImage === 'string' && firstImage.startsWith('http')) return firstImage
  return productFallback
}

function createCartItem(product) {
  return {
    productId: product._id || product.id,
    name: product.name,
    price: product.price || 'Price pending',
    numericPrice: parsePriceValue(product),
    image: getProductImage(product),
    displayCategory: product.displayCategory || 'Nebeda Threads',
    quantity: 1,
  }
}

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => loadStoredCart())

  useEffect(() => {
    saveStoredCart(cartItems)
  }, [cartItems])

  const addToCart = useCallback((product) => {
    const nextItem = createCartItem(product)
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === nextItem.productId)

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === nextItem.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentItems, nextItem]
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.productId !== productId))
  }, [])

  const increaseQuantity = useCallback((productId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    )
  }, [])

  const decreaseQuantity = useCallback((productId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item,
      ),
    )
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.numericPrice || 0) * item.quantity,
        0,
      ),
    [cartItems],
  )

  const totalItems = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  const getCartTotal = useCallback(() => subtotal, [subtotal])
  const getCartCount = useCallback(() => totalItems, [totalItems])

  const value = useMemo(
    () => ({
      addToCart,
      cartItems,
      clearCart,
      decreaseQuantity,
      getCartCount,
      getCartTotal,
      increaseQuantity,
      removeFromCart,
      subtotal,
      totalItems,
    }),
    [
      addToCart,
      cartItems,
      clearCart,
      decreaseQuantity,
      getCartCount,
      getCartTotal,
      increaseQuantity,
      removeFromCart,
      subtotal,
      totalItems,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export { CartProvider }
