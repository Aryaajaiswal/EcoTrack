import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, X } from 'lucide-react'
import { notificationAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function NotificationBell() {
  const { token } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef()

  useEffect(() => {
    if (!token) return
    const fetch = async () => {
      try {
        const res = await notificationAPI.getAll()
        setNotifs(res.data.notifications)
        setUnread(res.data.unread_count)
      } catch {}
    }
    fetch()
    const interval = setInterval(fetch, 30000)
    return () => clearInterval(interval)
  }, [token])

  useEffect(() => {
    const handleClick = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markRead = async id => {
    await notificationAPI.markRead(id)
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(p => Math.max(0, p - 1))
  }

  const markAllRead = async () => {
    await notificationAPI.markAllRead()
    setNotifs(p => p.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  const iconMap = {
    badge_earned: '🏅', friend_request: '👋', friend_accepted: '🤝',
    challenge_complete: '✅', streak_milestone: '🔥',
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 max-h-96 overflow-y-auto rounded-2xl border border-gray-700/50 bg-gray-900/95 backdrop-blur-xl shadow-2xl z-50">
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl flex items-center justify-between p-3 border-b border-gray-700/50">
              <span className="text-sm font-bold text-white">Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>
            {notifs.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No notifications yet</div>
            ) : (
              notifs.map(n => (
                <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                  className={`flex items-start gap-3 p-3 border-b border-gray-800/50 transition-colors cursor-pointer ${n.read ? 'opacity-60' : 'bg-emerald-500/5 hover:bg-emerald-500/10'}`}>
                  <span className="text-lg shrink-0">{iconMap[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                    <p className="text-xs text-gray-400 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1" />}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
