import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { authExtraAPI } from '../services/api'
import ParticleBackground from '../components/ParticleBackground'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await authExtraAPI.forgotPassword(email)
      setSent(true)
    } catch (err) { setError(err.response?.data?.detail || 'Something went wrong') }
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
          <h1 className="text-3xl font-black text-white">Reset password</h1>
          <p className="text-gray-400 text-sm mt-1.5">Enter your email and we'll send you a reset link</p>
        </div>
        <div className="glass-strong rounded-2xl p-6 sm:p-10 shadow-2xl">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-semibold">Check your email</p>
              <p className="text-gray-400 text-sm mt-2">If an account with that email exists, we've sent a password reset link.</p>
              <p className="text-gray-500 text-xs mt-4">Check the server console for the token in development mode</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white placeholder-gray-500 text-sm transition-colors" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all glow-emerald-sm mt-2 cursor-pointer">
                {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto" /> : 'Send Reset Link'}
              </button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-emerald-400 text-sm font-bold hover:underline">Back to sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
