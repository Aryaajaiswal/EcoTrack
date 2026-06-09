import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ParticleBackground from '../components/ParticleBackground'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault(); setError('')
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try { await login(form.email, form.password); navigate(from, { replace: true }) }
    catch (err) { setError(err.response?.data?.detail || 'Login failed. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 relative overflow-hidden">
      <ParticleBackground count={8} />
      <motion.div initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.5 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Leaf className="w-6 h-6 text-emerald-400" /></div>
            <span className="font-black text-xl gradient-text">EcoTrack AI</span>
          </Link>
          <h1 className="text-2xl font-black text-white">Welcome back 🌿</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to continue your eco-journey</p>
        </div>
        <div className="glass-strong rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </motion.div>
            )}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="your@email.com" autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white placeholder-gray-500 text-sm transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type={showPass?'text':'password'} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white placeholder-gray-500 text-sm transition-colors" />
                <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all glow-emerald-sm">
              {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"/> : <>Sign In <ArrowRight className="w-4 h-4"/></>}
            </button>
          </form>
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
            <p className="text-emerald-400 text-xs">Don't have an account? <Link to="/register" className="font-semibold hover:underline">Create one free</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
