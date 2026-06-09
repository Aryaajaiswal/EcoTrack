import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, CheckCircle, Clock, Zap, Leaf, Filter, Star } from 'lucide-react'
import { challengeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

// Difficulty styles
const DC = {
  easy: { bg:'bg-emerald-500/15', text:'text-emerald-400', border:'border-emerald-500/25', pill:'Easy' },
  medium: { bg:'bg-yellow-500/15', text:'text-yellow-400', border:'border-yellow-500/25', pill:'Medium' },
  hard: { bg:'bg-red-500/15', text:'text-red-400', border:'border-red-500/25', pill:'Hard' }
}

function triggerConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981','#34d399','#6ee7b7','#f59e0b'],
  })
}

export default function Challenges() {
  const { refreshUser } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try { const r = await challengeAPI.getAll(); setChallenges(r.data) }
    catch { toast.error('Failed to load challenges.') }
    finally { setLoading(false) }
  }

  const join = async (id, title) => {
    setBusy(id)
    try {
      await challengeAPI.join(id)
      toast.success(`Joined "${title}"! 🌿 Good luck!`)
      await load()
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to join.') }
    finally { setBusy(null) }
  }

  const complete = async (ucId, title) => {
    setBusy(ucId)
    try {
      const r = await challengeAPI.complete(ucId)
      triggerConfetti()
      toast.success(`🎉 "${title}" completed! +${r.data.xp_earned} XP earned!`)
      if (r.data.new_badges?.length > 0) {
        setTimeout(() => toast.success(`🏆 New badge unlocked! Check your profile!`), 1000)
      }
      await load(); await refreshUser()
    } catch(e) { toast.error(e.response?.data?.detail || 'Failed to complete.') }
    finally { setBusy(null) }
  }

  const filtered = challenges.filter(c => {
    if (filter === 'all') return true
    if (filter === 'active') return c.user_status === 'active'
    if (filter === 'completed') return c.user_status === 'completed'
    if (filter === 'available') return c.user_status === 'available'
    return c.difficulty === filter
  })

  const stats = {
    available: challenges.filter(c => c.user_status === 'available').length,
    active: challenges.filter(c => c.user_status === 'active').length,
    completed: challenges.filter(c => c.user_status === 'completed').length,
    totalXP: challenges.filter(c => c.user_status === 'completed').reduce((a,c) => a + c.xp_reward, 0),
  }

  const filters = [
    { v:'all', l:'🌿 All' }, { v:'active', l:'⚡ Active' },
    { v:'completed', l:'✅ Done' }, { v:'available', l:'🔓 Open' },
    { v:'easy', l:'Easy' }, { v:'medium', l:'Medium' }, { v:'hard', l:'Hard' }
  ]

  return (
    <div className="pt-16 min-h-screen dashboard-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400"/>
            Eco Challenges
          </h1>
          <p className="text-gray-400 text-sm">Complete real-world sustainability missions to earn XP and save the planet.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { label:'Available', value:stats.available, color:'text-gray-300', bg:'bg-gray-700/30' },
            { label:'Active', value:stats.active, color:'text-yellow-400', bg:'bg-yellow-500/10' },
            { label:'Completed', value:stats.completed, color:'text-emerald-400', bg:'bg-emerald-500/10' },
            { label:'XP Earned', value:`+${stats.totalXP}`, color:'text-amber-400', bg:'bg-amber-500/10' },
          ].map((s,i) => (
            <motion.div key={s.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
              className={`glass rounded-xl p-4 text-center ${s.bg}`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {filters.map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.v ? 'bg-emerald-500 text-black' : 'glass text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30'
              }`}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Challenge Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_,i) => <div key={i} className="skeleton h-52 rounded-2xl"/>)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={filter}
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filtered.map((c, i) => {
                const dc = DC[c.difficulty]
                const done = c.user_status === 'completed'
                const active = c.user_status === 'active'
                return (
                  <motion.div key={c.id}
                    initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                    className={`glass rounded-2xl p-6 flex flex-col gap-4 card-hover relative overflow-hidden ${done ? 'opacity-75' : ''}`}>

                    {/* Completed overlay glow */}
                    {done && (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 to-transparent pointer-events-none"/>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 relative">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.icon}</span>
                        <div>
                          <h3 className="text-white font-bold text-sm">{c.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${dc.bg} ${dc.text} ${dc.border}`}>
                            {dc.pill}
                          </span>
                        </div>
                      </div>
                      {done && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0"/>}
                      {active && <Clock className="w-5 h-5 text-yellow-400 shrink-0 animate-pulse"/>}
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-xs leading-relaxed flex-1">{c.description}</p>

                    {/* Rewards */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 text-yellow-400 font-medium">
                        <Zap className="w-3 h-3"/>{c.xp_reward} XP
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Leaf className="w-3 h-3"/>{c.co2_savings_kg} kg CO₂
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 ml-auto">
                        <Clock className="w-3 h-3"/>{c.duration_days}d
                      </div>
                    </div>

                    {/* Badge reward */}
                    {c.badge_reward && (
                      <div className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 rounded-lg px-2 py-1">
                        <Star className="w-3 h-3"/>Badge reward: {c.badge_reward.replace('_',' ')}
                      </div>
                    )}

                    {/* Action button */}
                    <div className="mt-auto pt-4">
                      {done ? (
                        <div className="text-center py-2 text-emerald-400 text-xs font-medium flex items-center justify-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5"/>Challenge Completed!
                        </div>
                      ) : active ? (
                        <button onClick={() => complete(c.user_challenge_id, c.title)}
                          disabled={busy === c.user_challenge_id}
                          className="w-full py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 font-semibold text-sm rounded-xl transition-all">
                          {busy === c.user_challenge_id ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-3 h-3 border border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"/>
                              Processing...
                            </span>
                          ) : '✅ Mark Complete'}
                        </button>
                      ) : (
                        <button onClick={() => join(c.id, c.title)} disabled={busy === c.id}
                          className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 font-semibold text-sm rounded-xl transition-all">
                          {busy === c.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-3 h-3 border border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"/>
                              Joining...
                            </span>
                          ) : '🌿 Join Challenge'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && filtered.length === 0 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            className="text-center py-20">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3"/>
            <p className="text-gray-400">No challenges match this filter.</p>
            <button onClick={() => setFilter('all')} className="mt-3 text-emerald-400 text-sm hover:underline">
              Show all challenges
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
