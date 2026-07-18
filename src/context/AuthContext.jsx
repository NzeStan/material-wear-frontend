import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

function tokenFromAuthResponse(data) {
  if (!data) return null
  if (data.key) return { token: data.key, scheme: 'Token' }
  if (data.token) return { token: data.token, scheme: 'Token' }
  if (data.access) return { token: data.access, scheme: 'Bearer' }
  if (data.access_token) return { token: data.access_token, scheme: 'Bearer' }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [permissions, setPermissions] = useState(null)
  const [basicStatus, setBasicStatus] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [initialized, setInitialized] = useState(false)

  const hydrateAuthenticatedUser = useCallback(async () => {
    const [statusData, userData, basicData] = await Promise.all([
      api.get('/auth/social/status/'),
      api.get('/auth/social/user/'),
      api.get('/auth/social/status/basic/').catch(() => null),
    ])

    if (statusData?.is_authenticated && !api.getToken()) {
      const tokenData = await api.get('/auth/social/token/').catch(() => null)
      if (tokenData?.key) api.setToken(tokenData.key)
    }

    setBasicStatus(basicData || (statusData?.is_authenticated != null ? { is_authenticated: statusData.is_authenticated, user: statusData.user } : null))
    setPermissions(statusData?.permissions || null)
    const mergedUser = { ...statusData?.user, ...userData }
    setUser(mergedUser)
    return mergedUser
  }, [])

  const hydrateAfterAuthResponse = useCallback(async (data) => {
    const authToken = tokenFromAuthResponse(data)
    if (authToken) api.setToken(authToken.token, authToken.scheme)
    return hydrateAuthenticatedUser()
  }, [hydrateAuthenticatedUser])

  // ── Initial auth check ──────────────────────────────────────────────────────
  const checkAuth = useCallback(async () => {
    try {
      const basic = await api.get('/auth/social/status/basic/')
      setBasicStatus(basic)

      if (!basic?.is_authenticated) {
        api.setToken(null)
        setUser(null)
        setPermissions(null)
        return
      }

      if (!api.getToken()) {
        const tokenData = await api.get('/auth/social/token/').catch(() => null)
        if (tokenData?.key) api.setToken(tokenData.key)
      }

      const [statusData, userData] = await Promise.all([
        api.get('/auth/social/status/'),
        api.get('/auth/social/user/'),
      ])

      setPermissions(statusData?.permissions || null)
      setUser({ ...statusData?.user, ...userData })
    } catch {
      api.setToken(null)
      setUser(null)
      setPermissions(null)
      setBasicStatus(null)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [])

  useEffect(() => { checkAuth() }, [checkAuth])

  // ── Auth actions ─────────────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    const data = await api.post('/auth/social/login/', { email, password })
    return hydrateAfterAuthResponse(data)
  }

  const register = async ({ first_name, last_name, username, email, password1, password2 }) => {
    const data = await api.post('/auth/social/register/', {
      first_name,
      last_name,
      username,
      email,
      password1,
      password2,
    })
    try {
      return await hydrateAfterAuthResponse(data)
    } catch (error) {
      if (tokenFromAuthResponse(data)) throw error

      const loginData = await api.post('/auth/social/login/', {
        email,
        password: password1,
      })
      return hydrateAfterAuthResponse(loginData)
    }
  }

  const loginWithGoogleToken = async (access_token) => {
    const data = await api.post('/auth/social/social/google/', { access_token })
    return hydrateAfterAuthResponse(data)
  }

  const loginWithGithubToken = async (access_token) => {
    const data = await api.post('/auth/social/social/github/', { access_token })
    return hydrateAfterAuthResponse(data)
  }

  const logout = async () => {
    try { await api.post('/auth/social/logout/', {}) } catch { /* ignore */ }
    api.setToken(null)
    setUser(null)
    setPermissions(null)
    setBasicStatus(null)
  }

  const updateProfile = async (data) => {
    const payload = {
      first_name: data.first_name ?? '',
      last_name: data.last_name ?? '',
    }
    const updated = await api.patch('/auth/social/user/', payload)
    setUser(prev => ({ ...prev, ...updated }))
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
    permissions,
    basicStatus,
    loading,
    initialized,
    isAuthenticated: !!user,
    canAccessAdmin: !!permissions?.roles?.can_access_admin || !!user?.is_staff || !!user?.is_superuser,
    login,
    register,
    loginWithGoogleToken,
    loginWithGithubToken,
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
