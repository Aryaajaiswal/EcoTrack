/**
 * Eco Challenges page — browse, join, and complete sustainability challenges.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, CheckCircle, Clock, Zap, Leaf, Filter } from 'lucide-react'
import { challengeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const DIFFICULTY_COLORS = {
  easy: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  hard: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
}

export default function Challenges() {
  const { refreshUser } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | easy | medium | hard | active | completed
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    setLoading(true)
    try {
      const res = await challengeAPI.getAll()
      setChallenges(res.data)
    } catch {
      toast.error('Failed to load challenges.')
    } finally {
      setLoading(false)
    }
  }

  const joinChallenge = async (challengeId, title) => {
    setActionLoading(challengeId)
    try {
      await challengeAPI.join(challengeId)
      toast.success(`Joined "${title}"! 🌿 Good luck!`)
      await loadChallenges()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to join challenge.')
    } finally {
      setActionLoading(null)
    }
  }

  const completeChallenge = async (userChallengeId, title) => {
    setActionLoading(userChallengeId)
    try {
      const res = await challengeAPI.complete(userChallengeId)
      toast.success(`🎉 "${title}" completed! +${res.data.xp_earned} XP earned!`)
      if (res.data.new_badges?.length > 0) {
        setTimeout(() => toast.success(`🏆 New badge unlocked!`), 800)
      }
      await loadChallenges()
      await refreshUser()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to complete challenge.')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredChallenges = challenges.filter(c => {
    if (filter === 'all') return true
    if (filter === 'active') return c.user_status === 'active'
    if (filter === 'completed') return c.user_status === 'completed'
    return c.difficulty === filter
  })

  const stats = {
    total: challenges.length,
    active: challenges.filter(c => c.user_status === 'active').length,
    completed: challenges.filter(c => c.user_status === 'completed').length,
    available: challenges.filter(c => c.user_status === 'available').length,
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Eco Challenges
          </h1>
          <p className="text-gray-400 text-sm">Complete real-world sustainability missions to earn XP and reduce your footprint.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Available', value: stats.available, color: 'text-emerald-400' },
            { label: 'Active', value: stats.active, color: 'text-yellow-400' },
            { label: 'Completed', value: stats.completed, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'active', 'completed', 'easy', 'medium', 'hard'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-emerald-500 text-black' : 'glass text-gray-400 hover:text-emerald-400'}`}
            >
              {f === 'all' ? '🌿 All' : f === 'active' ? '⚡ Active' : f === 'completed' ? '✅ Done' : f}
            </button>
          ))}
        </div>

        {/* Challenges grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map((c, i) => {
              const dc = DIFFICULTY_COLORS[c.difficulty]
              const isCompleted = c.user_status === 'completed'
              const isActive = c.user_status === 'active'
              const key = c.user_challenge_id || c.id

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass rounded-2xl p-5 card-hover flex flex-col gap-3 ${isCompleted ? 'opacity-70' : ''}`}
                >
                  {/* Icon + title */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.icon}</span>
                      <div>
                        <h3 className="text-white font-bold text-sm">{c.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${dc.bg} ${dc.text} ${dc.border}`}>
                          {c.difficulty}
                        </span>
                      </div>
                    </div>
                    {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {isActive && <Clock className="w-5 h-5 text-yellow-400 shrink-0 animate-pulse" />}
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-xs leading-relaxed">{c.description}</p>

                  {/* Rewards */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Zap className="w-3 h-3" />
                      <span>{c.xp_reward} XP</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Leaf className="w-3 h-3" />
                      <span>{c.co2_savings_kg} kg CO₂</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{c.duration_days}d</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-auto pt-2">
                    {isCompleted ? (
                      <div className="text-center py-2 text-emerald-400 text-xs font-medium">✅ Completed!</div>
                    ) : isActive ? (
                      <button
                        onClick={() => completeChallenge(c.user_challenge_id, c.title)}
                        disabled={actionLoading === c.user_challenge_id}
                        className="w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 font-semibold text-sm rounded-xl transition-all"
                      >
                        {actionLoading === c.user_challenge_id
                          ? <span className="flex items-center justify-center gap-2"><div className="w-3 h-3 border border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" /> Processing...</span>
                          : '✅ Mark Complete'}
                      </button>
                    ) : (
                      <button
                        onClick={() => joinChallenge(c.id, c.title)}
                        disabled={actionLoading === c.id}
                        className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-semibold text-sm rounded-xl transition-all"
                      >
                        {actionLoading === c.id
                          ? <span className="flex items-center justify-center gap-2"><div className="w-3 h-3 border border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" /> Joining...</span>
                          : '🌿 Join Challenge'}
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {!loading && filteredChallenges.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No challenges match this filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
