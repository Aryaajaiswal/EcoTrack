import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Crown } from 'lucide-react'
import { leaderboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getEcoLevelColor, getEcoLevelIcon, formatCO2 } from '../utils/helpers'

const RANK_COLORS = ['#f59e0b','#9ca3af','#b45309']
const RANK_ICONS = ['👑','🥈','🥉']

export default function Leaderboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [sortBy, setSortBy] = useState('xp')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try { const r = await leaderboardAPI.get(sortBy,20); setData(r.data) }
      finally { setLoading(false) }
    }
    load()
  }, [sortBy])

  const getSortVal = e => sortBy==='xp'?`${e.xp.toLocaleString()} XP`:sortBy==='streak'?`${e.streak} days`:formatCO2(e.total_carbon_saved)

  return (
    <div className="pt-16 min-h-screen dashboard-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-1 flex items-center justify-center gap-2"><Trophy className="w-6 h-6 text-yellow-400"/>Global Leaderboard</h1>
          <p className="text-gray-400 text-sm">Top eco warriors making real change</p>
        </div>

        <div className="flex gap-2 justify-center mb-6 flex-wrap">
          {[{v:'xp',l:'⚡ By XP'},{v:'streak',l:'🔥 By Streak'},{v:'carbon_saved',l:'🌿 By CO₂ Saved'}].map(o=>(
            <button key={o.v} onClick={()=>setSortBy(o.v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${sortBy===o.v?'bg-emerald-500 text-black':'glass text-gray-400 hover:text-emerald-400'}`}>
              {o.l}
            </button>
          ))}
        </div>

        {data && (
          <div className="glass rounded-2xl p-4 mb-6 border border-emerald-500/20 flex items-center gap-4">
            <div className="text-2xl font-black text-emerald-400">#{data.current_user_rank}</div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Your Global Rank</p>
              <p className="text-gray-400 text-xs">Out of {data.total_participants.toLocaleString()} participants</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-bold">{getSortVal({xp:user?.xp||0,streak:user?.streak||0,total_carbon_saved:user?.total_carbon_saved||0})}</p>
              <p className="text-gray-400 text-xs">{user?.eco_level}</p>
            </div>
          </div>
        )}

        {!loading&&data?.entries?.length>=3&&(
          <div className="flex items-end justify-center gap-4 mb-8">
            {[data.entries[1],data.entries[0],data.entries[2]].map((e,pi)=>{
              const rank=pi===1?1:pi===0?2:3
              const heights=['h-24','h-32','h-20']
              return (
                <motion.div key={e.user_id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:pi*.1}} className="flex flex-col items-center gap-2">
                  {rank===1&&<Crown className="w-5 h-5 text-yellow-400"/>}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-black text-lg" style={{backgroundColor:e.avatar_color||'#10b981'}}>{e.name?.charAt(0)}</div>
                  <p className="text-white text-xs font-bold text-center">{e.name?.split(' ')[0]}</p>
                  <div className={`w-20 ${heights[pi]} rounded-t-xl flex flex-col items-center justify-center gap-1`} style={{backgroundColor:`${RANK_COLORS[rank-1]}20`,border:`1px solid ${RANK_COLORS[rank-1]}40`}}>
                    <span className="text-xl">{RANK_ICONS[rank-1]}</span>
                    <span className="text-xs font-bold" style={{color:RANK_COLORS[rank-1]}}>#{rank}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"/></div>
        ) : (
          <div className="space-y-2">
            {data?.entries.map((e,i)=>(
              <motion.div key={e.user_id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*.03}}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${e.is_current_user?'glass border-emerald-500/30 glow-emerald-sm':'glass border-transparent hover:border-gray-600/50'}`}>
                <div className="w-8 text-center font-black" style={{color:i<3?RANK_COLORS[i]:'#6b7280'}}>
                  {i<3?RANK_ICONS[i]:`#${e.rank}`}
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black text-sm shrink-0" style={{backgroundColor:e.avatar_color||'#10b981'}}>
                  {e.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-sm truncate">{e.name} {e.is_current_user&&<span className="text-emerald-400">(You)</span>}</p>
                    <span className="text-base">{getEcoLevelIcon(e.eco_level)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                    <span style={{color:getEcoLevelColor(e.eco_level)}}>{e.eco_level}</span>
                    <span>🏅 {e.badges_count}</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-orange-400 text-xs"><Flame className="w-3.5 h-3.5"/>{e.streak}d</div>
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 font-bold text-sm">{getSortVal(e)}</p>
                  <p className="text-gray-500 text-xs">{formatCO2(e.total_carbon_saved)} saved</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
