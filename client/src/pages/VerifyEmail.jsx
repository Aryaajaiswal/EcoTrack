import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, CheckCircle, XCircle, Loader } from 'lucide-react'
import { authExtraAPI } from '../services/api'
import ParticleBackground from '../components/ParticleBackground'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token provided'); return }
    authExtraAPI.verifyEmail(token)
      .then(() => { setStatus('success'); setMessage('Email verified successfully! You can now log in.') })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.detail || 'Verification failed. The token may be expired.') })
  }, [token])

  return (
    <div className="min-h-screen hero-bg flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <ParticleBackground count={6} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Leaf className="w-5 h-5 text-emerald-400" /></div>
          <span className="font-black text-xl gradient-text">EcoTrack AI</span>
        </Link>
        <div className="glass-strong rounded-2xl p-10">
          {status === 'verifying' && (
            <div><Loader className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" /><p className="text-white font-semibold">Verifying your email...</p></div>
          )}
          {status === 'success' && (
            <div><CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" /><p className="text-white font-semibold">Verified!</p><p className="text-gray-400 text-sm mt-2">{message}</p>
              <Link to="/login" className="inline-block mt-6 px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl">Go to Login</Link>
            </div>
          )}
          {status === 'error' && (
            <div><XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" /><p className="text-white font-semibold">Verification failed</p><p className="text-gray-400 text-sm mt-2">{message}</p>
              <Link to="/login" className="inline-block mt-6 px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl">Back to Login</Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
