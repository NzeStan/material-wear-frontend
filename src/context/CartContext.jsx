import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart,        setCart]        = useState(null)
  const [cartLoading, setCartLoading] = useState(true)
  const [drawerOpen,  setDrawerOpen]  = useState(false)

  const fetchCart = useCallback(async () => {
    try {
      const data = await api.get('/cart/')
      setCart(data)
    } catch {
      setCart(null)
    } finally {
      setCartLoading(false)
    }
  }, [])

  useEffect(() => { fetchCart() }, [fetchCart])

  async function addToCart(payload) {
    const data = await api.post('/cart/add/', payload)
    await fetchCart()
    setDrawerOpen(true)
    return data
  }

  async function removeItem(itemKey) {
    await api.delete(`/cart/remove/${encodeURIComponent(itemKey)}/`)
    await fetchCart()
  }

  async function updateQuantity(itemKey, quantity) {
    await api.patch(`/cart/update/${encodeURIComponent(itemKey)}/`, { quantity })
    await fetchCart()
  }

  async function clearCart() {
    await api.post('/cart/clear/')
    await fetchCart()
  }

  return (
    <CartContext.Provider value={{
      cart,
      cartLoading,
      itemCount: cart?.total_items ?? 0,
      drawerOpen,
      setDrawerOpen,
      fetchCart,
      addToCart,
      removeItem,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
