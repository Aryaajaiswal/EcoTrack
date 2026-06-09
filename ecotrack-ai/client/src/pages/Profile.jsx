import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Edit3, MapPin, Save, X, Award, Flame, Zap, Leaf, TrendingDown } from 'lucide-react'
import { userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { formatCO2, getEcoLevelColor, getEcoLevelIcon, BADGE_DATA } from '../utils/helpers'

const COLORS = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ec4899','#06b6d4','#f97316','#84cc16']

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [stats, setStats] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({name:'',bio:'',location:'',avatar_color:'#10b981'})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if(user) setForm({name:user.name||'',bio:user.bio||'',location:user.location||'',avatar_color:user.avatar_color||'#10b981'})
    userAPI.getStats().then(r=>setStats(r.data)).catch(()=>{})
  }, [user])

  const save = async () => {
    setSaving(true)
    try { const r=await userAPI.updateMe(form); updateUser(r.data); setEditing(false); toast.success('Profile updated! ✅') }
    catch { toast.error('Failed to save profile.') }
    finally { setSaving(false) }
  }

  const ecoColor=getEcoLevelColor(user?.eco_level)
  const ecoIcon=getEcoLevelIcon(user?.eco_level)

  return (
    <div className="pt-16 min-h-screen dashboard-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent"/>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-black glow-emerald shrink-0"
                style={{backgroundColor:user?.avatar_color||'#10b981'}}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-sm border-2 border-[#030712]" style={{backgroundColor:ecoColor}}>
                {ecoIcon}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-white">{user?.name}</h1>
                  <p className="font-bold mt-0.5" style={{color:ecoColor}}>{ecoIcon} {user?.eco_level}</p>
                  {user?.bio&&<p className="text-gray-400 text-sm mt-1">{user.bio}</p>}
                  {user?.location&&<div className="flex items-center gap-1 text-gray-400 text-xs mt-1"><MapPin className="w-3 h-3"/>{user.location}</div>}
                  <p className="text-gray-500 text-xs mt-1">{user?.email}</p>
                </div>
                <button onClick={()=>setEditing(!editing)} className="flex items-center gap-1.5 px-3 py-2 glass border border-gray-600 hover:border-emerald-500 text-gray-300 hover:text-emerald-400 rounded-xl text-xs transition-all shrink-0">
                  <Edit3 className="w-3.5 h-3.5"/>Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                {[{l:'XP',v:(user?.xp||0).toLocaleString(),i:'⚡'},{l:'Streak',v:`${user?.streak||0}d`,i:'🔥'},{l:'CO₂ Saved',v:formatCO2(user?.total_carbon_saved||0),i:'🌿'},{l:'Badges',v:user?.badges?.length||0,i:'🏅'}].map(s=>(
                  <div key={s.l} className="text-center">
                    <p className="text-white font-bold text-sm">{s.i} {s.v}</p>
                    <p className="text-gray-500 text-xs">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {editing && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className="mt-6 pt-6 border-t border-gray-700/50 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm mb-1.5 block">Name</label>
                  <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white text-sm transition-colors"/>
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-1.5 block">Location</label>
                  <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="City, Country"
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white text-sm transition-colors"/>
                </div>
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-1.5 block">Bio</label>
                <textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} rows={2} placeholder="Tell the community about your eco-journey..."
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white text-sm transition-colors resize-none"/>
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Avatar Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c=>(
                    <button key={c} onClick={()=>setForm(f=>({...f,avatar_color:c}))}
                      className={`w-8 h-8 rounded-full transition-all ${form.avatar_color===c?'ring-2 ring-white scale-110':'hover:scale-105'}`} style={{backgroundColor:c}}/>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl transition-all">
                  {saving?<div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>:<Save className="w-4 h-4"/>}Save Changes
                </button>
                <button onClick={()=>setEditing(false)} className="flex items-center gap-2 px-4 py-2 glass border border-gray-600 text-gray-300 text-sm rounded-xl">
                  <X className="w-4 h-4"/>Cancel
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[{l:'XP Points',v:stats.xp?.toLocaleString(),I:Zap,c:'#f59e0b'},{l:'Eco Streak',v:`${stats.streak}d`,I:Flame,c:'#ef4444'},{l:'CO₂ Saved',v:formatCO2(stats.total_carbon_saved),I:TrendingDown,c:'#3b82f6'},{l:'Activities',v:stats.activity_count,I:Leaf,c:'#10b981'}].map((s,i)=>(
              <motion.div key={s.l} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.05}} className="glass rounded-2xl p-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{backgroundColor:`${s.c}20`}}>
                  <s.I className="w-4 h-4" style={{color:s.c}}/>
                </div>
                <p className="text-white font-black text-xl">{s.v}</p>
                <p className="text-gray-400 text-xs">{s.l}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Badges */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.2}} className="glass rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-white font-bold mb-6 flex items-center gap-2"><Award className="w-5 h-5 text-yellow-400"/>Badges Earned ({user?.badges?.length||0})</h2>
          {user?.badges?.length>0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {user.badges.map(id=>{
                const b=BADGE_DATA[id]; if(!b) return null
                return (
                  <div key={id} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-700/50 hover:border-gray-500/50 transition-all" style={{backgroundColor:`${b.color}10`}}>
                    <span className="text-2xl">{b.icon}</span>
                    <span className="text-white text-xs font-bold text-center">{b.name}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8"><Award className="w-10 h-10 text-gray-600 mx-auto mb-2"/><p className="text-gray-400 text-sm">Complete challenges to earn your first badge!</p></div>
          )}
        </motion.div>

        {/* Level progress */}
        {stats?.level_progress && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.25}} className="glass rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">Level Progress</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-400 font-bold">{stats.level_progress.current_level}</span>
              <span className="text-gray-400 text-sm">{stats.level_progress.next_level}</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-3 mb-2">
              <motion.div initial={{width:0}} animate={{width:`${stats.level_progress.progress_pct}%`}} transition={{duration:1,delay:.5}}
                className="h-3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"/>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.level_progress.total_xp} XP</span>
              {stats.level_progress.xp_to_next>0&&<span>{stats.level_progress.xp_to_next} XP to next level</span>}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
