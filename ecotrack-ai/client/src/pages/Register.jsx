/**
 * Registration page with full form validation and animated feedback.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, Mail, Lock, Eye, EyeOff, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ParticleBackground from '../components/ParticleBackground'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordStrength = () => {
    const p = form.password
    if (!p) return 0
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500']
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']
  const strength = passwordStrength()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <ParticleBackground count={8} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center glow-emerald-sm">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="font-black text-xl gradient-text">EcoTrack AI</span>
          </Link>
          <h1 className="text-2xl font-black text-white">Join the movement 🌍</h1>
          <p className="text-gray-400 text-sm mt-1">Create your free account and start tracking</p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white placeholder-gray-500 text-sm transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white placeholder-gray-500 text-sm transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white placeholder-gray-500 text-sm transition-colors"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength indicator */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthColors[strength - 1] : 'bg-gray-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Password strength: <span className="text-white">{strengthLabels[strength - 1] || ''}</span></p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white placeholder-gray-500 text-sm transition-colors"
                />
                {form.confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {form.password === form.confirmPassword
                      ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                      : <AlertCircle className="w-4 h-4 text-red-400" />}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all glow-emerald-sm mt-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <><Leaf className="w-4 h-4" /> Create Account</>}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Perks */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
          {['🆓 Free forever', '🔒 Secure & private', '🌱 No ads ever'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
