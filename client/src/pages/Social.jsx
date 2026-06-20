import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, UserCheck, UserX, Search, X, MessageCircle, Trash2 } from 'lucide-react'
import { friendAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Social() {
  const { user } = useAuth()
  const [tab, setTab] = useState('friends')
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [f, r] = await Promise.all([friendAPI.list(), friendAPI.requests()])
      setFriends(f.data.friends)
      setRequests(r.data.requests)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!search || search.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      try { const res = await friendAPI.search(search); setResults(res.data.users) } catch { setResults([]) }
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const sendRequest = async email => {
    try { await friendAPI.sendRequest(email); load(); setSearch(''); setResults([]) } catch (e) { alert(e.response?.data?.detail || 'Failed') }
  }

  const respond = async (id, accept) => {
    try { await friendAPI.respond(id, accept); load() } catch {}
  }

  const remove = async id => {
    if (!confirm('Remove this friend?')) return
    try { await friendAPI.remove(id); load() } catch {}
  }

  const tabs = [
    { key: 'friends', label: 'Friends', icon: Users },
    { key: 'requests', label: `Requests (${requests.length})`, icon: UserCheck },
    { key: 'add', label: 'Add Friend', icon: UserPlus },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><Users className="w-6 h-6 text-emerald-400" /> Social</h1>
        <p className="text-gray-400 text-sm mt-1">Connect with friends and compete together</p>
      </motion.div>

      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${tab === t.key ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'friends' && (
        <div className="space-y-3">
          {loading ? <Skeleton /> : friends.length === 0 ? (
            <div className="glass-strong rounded-2xl p-8 text-center">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No friends yet. Search by email to add friends!</p>
            </div>
          ) : friends.map(f => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-strong rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black" style={{ backgroundColor: f.avatar_color }}>
                  {f.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{f.name}</p>
                  <p className="text-xs text-gray-400">{f.eco_level} • {f.xp} XP • {f.streak} day streak</p>
                </div>
              </div>
              <button onClick={() => remove(f.id)} className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="glass-strong rounded-2xl p-8 text-center">
              <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No pending friend requests</p>
            </div>
          ) : requests.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-strong rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black" style={{ backgroundColor: r.from_user.avatar_color }}>
                  {r.from_user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{r.from_user.name}</p>
                  <p className="text-xs text-gray-400">{r.from_user.eco_level}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => respond(r.id, true)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold hover:bg-emerald-500/30 transition-all cursor-pointer">
                  <UserCheck className="w-3.5 h-3.5" /> Accept
                </button>
                <button onClick={() => respond(r.id, false)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-all cursor-pointer">
                  <UserX className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'add' && (
        <div className="glass-strong rounded-2xl p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." autoFocus
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm" />
          </div>
          {results.length > 0 && (
            <div className="space-y-2">
              {results.filter(r => r.id !== user?.id).map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black" style={{ backgroundColor: u.avatar_color }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.eco_level} • {u.xp} XP</p>
                    </div>
                  </div>
                  <button onClick={() => sendRequest(u.email)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold hover:bg-emerald-500/30 transition-all cursor-pointer">
                    <UserPlus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              ))}
            </div>
          )}
          {search.length >= 2 && results.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No users found</p>
          )}
        </div>
      )}
    </div>
  )
}

function Skeleton() {
  return <div className="space-y-3">{[...Array(3)].map((_, i) => (
    <div key={i} className="glass-strong rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-700" /><div className="space-y-2"><div className="h-4 w-32 bg-gray-700 rounded" /><div className="h-3 w-48 bg-gray-700 rounded" /></div></div>
    </div>
  ))}</div>
}
