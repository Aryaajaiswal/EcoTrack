/**
 * Main navigation bar — responsive with mobile hamburger menu.
 */
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Menu, X, BarChart2, Zap, Trophy, User, LogOut, Calculator } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: BarChart2 },
  { path: '/calculator', label: 'Calculator', icon: Calculator },
  { path: '/ai-coach', label: 'AI Coach', icon: Zap },
  { path: '/challenges', label: 'Challenges', icon: Trophy },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/profile', label: 'Profile', icon: User },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-emerald-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center glow-emerald-sm group-hover:scale-110 transition-transform">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-bold text-lg gradient-text">EcoTrack AI</span>
          </Link>

          {/* Desktop nav */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-gray-300 hover:text-emerald-400 text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-lg transition-all duration-200 glow-emerald-sm"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* User avatar + logout (desktop) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black"
                  style={{ backgroundColor: user?.avatar_color || '#10b981' }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs">
                  <div className="text-white font-medium">{user?.name?.split(' ')[0]}</div>
                  <div className="text-emerald-400">{user?.eco_level}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-emerald-400 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-emerald-900/30"
          >
            <div className="px-4 py-3 space-y-1">
              {isAuthenticated ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 py-3 border-b border-gray-700/50 mb-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black"
                      style={{ backgroundColor: user?.avatar_color || '#10b981' }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium">{user?.name}</div>
                      <div className="text-emerald-400 text-xs">{user?.eco_level} • {user?.xp} XP</div>
                    </div>
                  </div>
                  {navLinks.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                        location.pathname === path
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false) }}
                    className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-red-400 text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-gray-300 text-sm">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 bg-emerald-500 text-black font-semibold text-sm rounded-lg text-center">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
