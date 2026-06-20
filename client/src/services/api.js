import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

// Request interceptor — attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ecotrack_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecotrack_token')
      localStorage.removeItem('ecotrack_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: d => api.post('/auth/register', d),
  login: d => api.post('/auth/login', d),
}

// ─── Users ─────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: d => api.put('/users/me', d),
  getStats: () => api.get('/users/stats'),
}

// ─── Carbon ─────────────────────────────────────────────
export const carbonAPI = {
  calculate: d => api.post('/carbon/calculate', d),
  logActivity: d => api.post('/carbon/activity', d),
  getActivities: (limit = 20) => api.get(`/carbon/activities?limit=${limit}`),
  getAnalytics: () => api.get('/carbon/analytics'),
}

// ─── AI Coach ──────────────────────────────────────────
export const aiAPI = {
  chat: msg => api.post('/ai/chat', { message: msg }),
  getTips: (count = 3) => api.get(`/ai/tips?count=${count}`),
  getInsight: () => api.get('/ai/insight'),
  getPredictions: (months = 12) => api.get(`/ai/predictions?months=${months}`),
  getForecast: () => api.get('/ai/forecast'),
}

// ─── Challenges ─────────────────────────────────────────
export const challengeAPI = {
  getAll: () => api.get('/challenges/'),
  join: id => api.post('/challenges/join', { challenge_id: id }),
  complete: id => api.post('/challenges/complete', { user_challenge_id: id }),
  getMyChallenges: () => api.get('/challenges/my'),
}

// ─── Leaderboard ────────────────────────────────────────
export const leaderboardAPI = {
  get: (sortBy = 'xp', limit = 20) =>
    api.get(`/leaderboard/?sort_by=${sortBy}&limit=${limit}`),
}

// ─── Notifications ───────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications/'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: id => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
}

// ─── Friends / Social ────────────────────────────────────
export const friendAPI = {
  sendRequest: email => api.post('/friends/request', { email }),
  respond: (id, accept) => api.post(`/friends/respond/${id}`, { accept }),
  list: () => api.get('/friends/'),
  requests: () => api.get('/friends/requests'),
  remove: id => api.delete(`/friends/${id}`),
  search: q => api.get(`/friends/search?q=${encodeURIComponent(q)}`),
}

// ─── Admin ───────────────────────────────────────────────
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
  getChallenges: () => api.get('/admin/challenges'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: id => api.delete(`/admin/users/${id}`),
}

// ─── Export ──────────────────────────────────────────────
export const exportAPI = {
  carbonCSV: () => `${API_BASE}/export/carbon-data`,
  profileJSON: () => `${API_BASE}/export/profile`,
}

// ─── Auth Extras ─────────────────────────────────────────
export const authExtraAPI = {
  verifyEmail: token => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: email => api.post('/auth/resend-verification', { email }),
  forgotPassword: email => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

// ─── Keep Alive (Render free tier) ───────────────────────
const BACKEND_BASE = API_BASE.replace('/api/v1', '')
export const startKeepAlive = () => {
  const ping = () => axios.get(`${BACKEND_BASE}/health`).catch(() => {})
  ping() // immediate on load
  setInterval(ping, 14 * 60 * 1000) // every 14 min
}

export default api
