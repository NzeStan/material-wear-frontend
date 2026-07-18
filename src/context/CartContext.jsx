import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart,        setCart]        = useState(null)
  const [summary,     setSummary]     = useState(null)
  const [cartLoading, setCartLoading] = useState(true)
  const [drawerOpen,  setDrawerOpen]  = useState(false)

  const fetchSummary = useCallback(async () => {
    try {
      const data = await api.get('/cart/summary/')
      setSummary(data)
    } catch {
      setSummary(null)
    }
  }, [])

  const fetchCart = useCallback(async () => {
    setCartLoading(true)
    try {
      const data = await api.get('/cart/')
      setCart(data)
    } catch {
      setCart(null)
    } finally {
      setCartLoading(false)
    }
  }, [])

  const refreshCartState = useCallback(async () => {
    setCartLoading(true)
    await Promise.all([fetchCart(), fetchSummary()])
  }, [fetchCart, fetchSummary])

  useEffect(() => { refreshCartState() }, [refreshCartState])

  async function addToCart(payload) {
    const data = await api.post('/cart/add/', payload)
    await refreshCartState()
    setDrawerOpen(true)
    return data
  }

  async function removeItem(itemKey) {
    await api.delete(`/cart/remove/${encodeURIComponent(itemKey)}/`)
    await refreshCartState()
  }

  async function updateQuantity(itemKey, quantity) {
    await api.patch(`/cart/update/${encodeURIComponent(itemKey)}/`, { quantity })
    await refreshCartState()
  }

  async function clearCart() {
    await api.post('/cart/clear/')
    await refreshCartState()
  }

  return (
    <CartContext.Provider value={{
      cart,
      summary,
      cartLoading,
      itemCount: summary?.count ?? cart?.total_items ?? 0,
      drawerOpen,
      setDrawerOpen,
      fetchCart,
      fetchSummary,
      refreshCartState,
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
