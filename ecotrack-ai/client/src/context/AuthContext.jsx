import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, userAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('ecotrack_token')
    const u = localStorage.getItem('ecotrack_user')
    if (t && u) {
      try { setToken(t); setUser(JSON.parse(u)) } catch { localStorage.removeItem('ecotrack_token'); localStorage.removeItem('ecotrack_user') }
    }
    setLoading(false)
  }, [])

  const saveAuth = (t, u) => {
    setToken(t); setUser(u)
    localStorage.setItem('ecotrack_token', t)
    localStorage.setItem('ecotrack_user', JSON.stringify(u))
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
    setUser(null); setToken(null)
    localStorage.removeItem('ecotrack_token')
    localStorage.removeItem('ecotrack_user')
    toast.success('Logged out successfully.')
  }

  const refreshUser = useCallback(async () => {
    try {
      const res = await userAPI.getMe()
      setUser(res.data)
      localStorage.setItem('ecotrack_user', JSON.stringify(res.data))
    } catch {}
  }, [])

  const updateUser = u => { setUser(u); localStorage.setItem('ecotrack_user', JSON.stringify(u)) }

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!token, register, login, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
