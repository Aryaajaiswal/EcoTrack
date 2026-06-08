/**
 * User profile page — stats, badges, editable settings.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Edit3, MapPin, Save, X, Award, Flame, Zap, Leaf, TrendingDown } from 'lucide-react'
import { userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { formatCO2, getEcoLevelColor, getEcoLevelIcon, BADGE_DATA } from '../utils/helpers'

const AVATAR_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#84cc16']

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [stats, setStats] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', location: '', avatar_color: '#10b981' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', bio: user.bio || '', location: user.location || '', avatar_color: user.avatar_color || '#10b981' })
    }
    userAPI.getStats().then(res => setStats(res.data)).catch(() => {})
  }, [user])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await userAPI.updateMe(form)
      updateUser(res.data)
      setEditing(false)
      toast.success('Profile updated! ✅')
    } catch {
      toast.error('Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const ecoColor = getEcoLevelColor(user?.eco_level)
  const ecoIcon = getEcoLevelIcon(user?.eco_level)

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-black glow-emerald shrink-0"
                style={{ backgroundColor: user?.avatar_color || '#10b981' }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-sm border-2 border-[#030712]"
                style={{ backgroundColor: ecoColor }}
              >
                {ecoIcon}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-white">{user?.name}</h1>
                  <p className="font-bold mt-0.5" style={{ color: ecoColor }}>{ecoIcon} {user?.eco_level}</p>
                  {user?.bio && <p className="text-gray-400 text-sm mt-1">{user.bio}</p>}
                  {user?.location && (
                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                      <MapPin className="w-3 h-3" />
                      {user.location}
                    </div>
                  )}
                  <p className="text-gray-500 text-xs mt-1">{user?.email}</p>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-1.5 px-3 py-2 glass border border-gray-600 hover:border-emerald-500 text-gray-300 hover:text-emerald-400 rounded-xl text-xs transition-all shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { label: 'XP', value: (user?.xp || 0).toLocaleString(), icon: '⚡' },
                  { label: 'Streak', value: `${user?.streak || 0}d`, icon: '🔥' },
                  { label: 'CO₂ Saved', value: formatCO2(user?.total_carbon_saved || 0), icon: '🌿' },
                  { label: 'Badges', value: user?.badges?.length || 0, icon: '🏅' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-white font-bold text-sm">{s.icon} {s.value}</p>
                    <p className="text-gray-500 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-700/50 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm mb-1.5 block">Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-1.5 block">Location</label>
                  <input
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="City, Country"
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white text-sm transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-1.5 block">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell the community about your eco-journey..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white text-sm transition-colors resize-none"
                />
              </div>

              {/* Avatar color picker */}
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Avatar Color</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setForm(f => ({ ...f, avatar_color: color }))}
                      className={`w-8 h-8 rounded-full transition-all ${form.avatar_color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl transition-all"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 glass border border-gray-600 text-gray-300 text-sm rounded-xl">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'XP Points', value: stats.xp?.toLocaleString(), icon: Zap, color: '#f59e0b' },
              { label: 'Eco Streak', value: `${stats.streak}d`, icon: Flame, color: '#ef4444' },
              { label: 'CO₂ Saved', value: formatCO2(stats.total_carbon_saved), icon: TrendingDown, color: '#3b82f6' },
              { label: 'Activities', value: stats.activity_count, icon: Leaf, color: '#10b981' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${s.color}20` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-gray-400 text-xs">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Badges Earned ({user?.badges?.length || 0})
          </h2>
          {user?.badges?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {user.badges.map(badgeId => {
                const b = BADGE_DATA[badgeId]
                if (!b) return null
                return (
                  <div
                    key={badgeId}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-700/50 hover:border-gray-500/50 transition-all cursor-default"
                    style={{ backgroundColor: `${b.color}10` }}
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <span className="text-white text-xs font-bold text-center">{b.name}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Complete challenges to earn your first badge!</p>
            </div>
          )}
        </motion.div>

        {/* Level progress */}
        {stats?.level_progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-white font-bold mb-4">Level Progress</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-400 font-bold">{stats.level_progress.current_level}</span>
              <span className="text-gray-400 text-sm">{stats.level_progress.next_level}</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-3 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.level_progress.progress_pct}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.level_progress.total_xp} XP</span>
              {stats.level_progress.xp_to_next > 0 && (
                <span>{stats.level_progress.xp_to_next} XP to next level</span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
