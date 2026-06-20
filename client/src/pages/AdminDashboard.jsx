import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, TrendingUp, Award, Trash2, BarChart3, Activity, Bell } from 'lucide-react'
import { adminAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (!user?.is_admin) { navigate('/dashboard'); return }
    const load = async () => {
      try {
        const [s, u] = await Promise.all([adminAPI.getStats(), adminAPI.getUsers()])
        setStats(s.data)
        setUsers(u.data.users)
      } catch {}
    }
    load()
  }, [])

  const deleteUser = async id => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    try { await adminAPI.deleteUser(id); setUsers(p => p.filter(u => u.id !== id)) } catch {}
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><Shield className="w-6 h-6 text-red-400" /> Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Platform management and analytics</p>
      </motion.div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Users', value: stats.total_users, icon: Users, color: '#3b82f6' },
            { label: 'Total XP', value: stats.total_xp.toLocaleString(), icon: Award, color: '#f59e0b' },
            { label: 'CO₂ Saved (kg)', value: stats.total_carbon_saved_kg.toLocaleString(), icon: TrendingUp, color: '#10b981' },
            { label: 'Active Today', value: stats.active_today, icon: Activity, color: '#8b5cf6' },
            { label: 'Activities', value: stats.total_activities, icon: BarChart3, color: '#ec4899' },
            { label: 'Notifications', value: stats.total_notifications, icon: Bell, color: '#06b6d4' },
          ].map(s => (
            <div key={s.label} className="glass-strong rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1"><s.icon className="w-4 h-4" style={{ color: s.color }} /><span className="text-xs text-gray-400">{s.label}</span></div>
              <p className="text-lg font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="glass-strong rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-emerald-400" /> Users ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700/50">
                <th className="text-left py-2 px-2">Name</th>
                <th className="text-left py-2 px-2">Email</th>
                <th className="text-center py-2 px-2">Level</th>
                <th className="text-center py-2 px-2">XP</th>
                <th className="text-center py-2 px-2">Streak</th>
                <th className="text-center py-2 px-2">CO₂ Saved</th>
                <th className="text-center py-2 px-2">Badges</th>
                <th className="text-center py-2 px-2">Admin</th>
                <th className="text-center py-2 px-2">Verified</th>
                <th className="text-center py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-800/50 text-gray-300 hover:bg-gray-800/30">
                  <td className="py-2.5 px-2 font-medium text-white">{u.name}</td>
                  <td className="py-2.5 px-2 text-xs">{u.email}</td>
                  <td className="py-2.5 px-2 text-center">{u.eco_level}</td>
                  <td className="py-2.5 px-2 text-center">{u.xp}</td>
                  <td className="py-2.5 px-2 text-center">{u.streak}</td>
                  <td className="py-2.5 px-2 text-center">{u.total_carbon_saved.toFixed(1)}</td>
                  <td className="py-2.5 px-2 text-center">{u.badges.length}</td>
                  <td className="py-2.5 px-2 text-center">{u.is_admin ? '✅' : '—'}</td>
                  <td className="py-2.5 px-2 text-center">{u.email_verified ? '✅' : '❌'}</td>
                  <td className="py-2.5 px-2 text-center">
                    <button onClick={() => deleteUser(u.id)} className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
