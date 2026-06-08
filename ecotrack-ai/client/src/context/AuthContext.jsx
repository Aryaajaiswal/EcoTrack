/**
 * Authentication Context — provides auth state and actions throughout the app.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, userAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ecotrack_token')
    const savedUser = localStorage.getItem('ecotrack_user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('ecotrack_token')
        localStorage.removeItem('ecotrack_user')
      }
    }
    setLoading(false)
  }, [])

  const saveAuth = (tokenVal, userData) => {
    setToken(tokenVal)
    setUser(userData)
    localStorage.setItem('ecotrack_token', tokenVal)
    localStorage.setItem('ecotrack_user', JSON.stringify(userData))
  }

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password })
    saveAuth(res.data.access_token, res.data.user)
    toast.success(`Welcome to EcoTrack AI, ${res.data.user.name.split(' ')[0]}! 🌱`)
    return res.data
  }

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    saveAuth(res.data.access_token, res.data.user)
    toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}! 🌿`)
    return res.data
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ecotrack_token')
    localStorage.removeItem('ecotrack_user')
    toast.success('Logged out successfully.')
  }

  const refreshUser = useCallback(async () => {
    try {
      const res = await userAPI.getMe()
      setUser(res.data)
      localStorage.setItem('ecotrack_user', JSON.stringify(res.data))
    } catch {
      // Token may be expired — handled by interceptor
    }
  }, [])

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('ecotrack_user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token,
      register,
      login,
      logout,
      refreshUser,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
