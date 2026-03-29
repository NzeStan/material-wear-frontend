import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [initialized, setInitialized] = useState(false)

  // ── Initial auth check ──────────────────────────────────────────────────────
  const checkAuth = useCallback(async () => {
    if (!api.getToken()) {
      setLoading(false)
      setInitialized(true)
      return
    }
    try {
      const data = await api.get('/auth/social/user/')
      setUser(data)
    } catch {
      api.setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [])

  useEffect(() => { checkAuth() }, [checkAuth])

  // ── Auth actions ─────────────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    const data = await api.post('/auth/social/login/', { email, password })
    api.setToken(data.key)
    const userData = await api.get('/auth/social/user/')
    setUser(userData)
    return userData
  }

  const register = async ({ username, email, password1, password2 }) => {
    const data = await api.post('/auth/social/register/', { username, email, password1, password2 })
    api.setToken(data.key)
    const userData = await api.get('/auth/social/user/')
    setUser(userData)
    return userData
  }

  const logout = async () => {
    try { await api.post('/auth/social/logout/', {}) } catch { /* ignore */ }
    api.setToken(null)
    setUser(null)
  }

  const updateProfile = async (data) => {
    const updated = await api.patch('/auth/social/user/', data)
    setUser(updated)
    return updated
  }

  const changePassword = async ({ old_password, new_password1, new_password2 }) =>
    api.post('/auth/social/password/change/', { old_password, new_password1, new_password2 })

  const requestPasswordReset = async ({ email }) =>
    api.post('/auth/social/password/reset/', { email })

  const confirmPasswordReset = async ({ uid, token, new_password1, new_password2 }) =>
    api.post('/auth/social/password/reset/confirm/', { uid, token, new_password1, new_password2 })

  // ── Context value ─────────────────────────────────────────────────────────────
  const value = {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
    refreshUser: checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
