import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { authExtraAPI } from '../services/api'
import ParticleBackground from '../components/ParticleBackground'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault(); setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await authExtraAPI.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) { setError(err.response?.data?.detail || 'Invalid or expired token') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen hero-bg flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <ParticleBackground count={6} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Leaf className="w-5 h-5 text-emerald-400" /></div>
            <span className="font-black text-xl gradient-text">EcoTrack AI</span>
          </Link>
          <h1 className="text-3xl font-black text-white">Set new password</h1>
        </div>
        <div className="glass-strong rounded-2xl p-6 sm:p-10 shadow-2xl">
          {done ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-semibold">Password reset!</p>
              <p className="text-gray-400 text-sm mt-2">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white placeholder-gray-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white placeholder-gray-500 text-sm" />
                </div>
              </div>
              <button type="submit" disabled={loading || !token}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all glow-emerald-sm mt-2 cursor-pointer">
                {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto" /> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
