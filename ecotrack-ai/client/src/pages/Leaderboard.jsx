/**
 * Global Leaderboard — top eco warriors with animated ranks.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, TrendingDown, Award, Crown } from 'lucide-react'
import { leaderboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getEcoLevelColor, getEcoLevelIcon, formatCO2 } from '../utils/helpers'

const SORT_OPTIONS = [
  { value: 'xp', label: '⚡ By XP', icon: Trophy },
  { value: 'streak', label: '🔥 By Streak', icon: Flame },
  { value: 'carbon_saved', label: '🌿 By CO₂ Saved', icon: TrendingDown },
]

const RANK_COLORS = ['#f59e0b', '#9ca3af', '#b45309', '#10b981']
const RANK_ICONS = ['👑', '🥈', '🥉']

export default function Leaderboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [sortBy, setSortBy] = useState('xp')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await leaderboardAPI.get(sortBy, 20)
        setData(res.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sortBy])

  const getSortValue = (entry) => {
    if (sortBy === 'xp') return `${entry.xp.toLocaleString()} XP`
    if (sortBy === 'streak') return `${entry.streak} days`
    return formatCO2(entry.total_carbon_saved)
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-1 flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Global Leaderboard
          </h1>
          <p className="text-gray-400 text-sm">Top eco warriors making real change</p>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 justify-center mb-6 flex-wrap">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${sortBy === opt.value ? 'bg-emerald-500 text-black' : 'glass text-gray-400 hover:text-emerald-400'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Current user rank */}
        {data && (
          <div className="glass rounded-2xl p-4 mb-6 border border-emerald-500/20 flex items-center gap-4">
            <div className="text-2xl font-black text-emerald-400">#{data.current_user_rank}</div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Your Global Rank</p>
              <p className="text-gray-400 text-xs">Out of {data.total_participants.toLocaleString()} participants</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-bold">{getSortValue({ xp: user?.xp || 0, streak: user?.streak || 0, total_carbon_saved: user?.total_carbon_saved || 0 })}</p>
              <p className="text-gray-400 text-xs">{user?.eco_level}</p>
            </div>
          </div>
        )}

        {/* Top 3 podium */}
        {!loading && data?.entries?.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {[data.entries[1], data.entries[0], data.entries[2]].map((entry, podiumIdx) => {
              const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3
              const heights = ['h-24', 'h-32', 'h-20']
              const realIdx = podiumIdx

              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: realIdx * 0.1 }}
                  className="flex flex-col items-center gap-2"
                >
                  {rank === 1 && <Crown className="w-5 h-5 text-yellow-400" />}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-black text-black text-lg"
                    style={{ backgroundColor: entry.avatar_color || '#10b981' }}
                  >
                    {entry.name?.charAt(0)}
                  </div>
                  <p className="text-white text-xs font-bold text-center">{entry.name?.split(' ')[0]}</p>
                  <div
                    className={`w-20 ${heights[realIdx]} rounded-t-xl flex flex-col items-center justify-center gap-1`}
                    style={{ backgroundColor: `${RANK_COLORS[rank - 1]}20`, border: `1px solid ${RANK_COLORS[rank - 1]}40` }}
                  >
                    <span className="text-xl">{RANK_ICONS[rank - 1]}</span>
                    <span className="text-xs font-bold" style={{ color: RANK_COLORS[rank - 1] }}>#{rank}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Full leaderboard list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {data?.entries.map((entry, i) => {
              const isCurrentUser = entry.is_current_user
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isCurrentUser ? 'glass border border-emerald-500/30 glow-emerald-sm' : 'glass hover:border-gray-600/50 border border-transparent'}`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center font-black" style={{ color: i < 3 ? RANK_COLORS[i] : '#6b7280' }}>
                    {i < 3 ? RANK_ICONS[i] : `#${entry.rank}`}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black text-sm shrink-0"
                    style={{ backgroundColor: entry.avatar_color || '#10b981' }}
                  >
                    {entry.name?.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-sm truncate">{entry.name} {isCurrentUser && <span className="text-emerald-400">(You)</span>}</p>
                      <span className="text-base">{getEcoLevelIcon(entry.eco_level)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span style={{ color: getEcoLevelColor(entry.eco_level) }}>{entry.eco_level}</span>
                      <span>🏅 {entry.badges_count} badges</span>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="hidden sm:flex items-center gap-1 text-orange-400 text-xs">
                    <Flame className="w-3.5 h-3.5" />
                    {entry.streak}d
                  </div>

                  {/* Primary stat */}
                  <div className="text-right shrink-0">
                    <p className="text-emerald-400 font-bold text-sm">{getSortValue(entry)}</p>
                    <p className="text-gray-500 text-xs">{formatCO2(entry.total_carbon_saved)} saved</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
