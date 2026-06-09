import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, Flame, TrendingDown, Zap, BarChart2, ArrowRight, Activity, Calculator, TrendingUp } from 'lucide-react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { carbonAPI, aiAPI, challengeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { SkeletonPage } from '../components/LoadingSkeleton'
import { formatCO2, getEcoLevelColor, getEcoLevelIcon, CATEGORY_COLORS, BADGE_DATA } from '../utils/helpers'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler)

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1f2937', titleColor: '#f9fafb', bodyColor: '#9ca3af',
      borderColor: '#374151', borderWidth: 1, padding: 10,
    }
  },
  scales: {
    x: { grid: { color: 'rgba(55,65,81,0.4)' }, ticks: { color: '#6b7280', font: { size: 11 } } },
    y: { grid: { color: 'rgba(55,65,81,0.4)' }, ticks: { color: '#6b7280', font: { size: 11 } } }
  },
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [insight, setInsight] = useState(null)
  const [activities, setActivities] = useState([])
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [a, i, ac, ch] = await Promise.allSettled([
        carbonAPI.getAnalytics(),
        aiAPI.getInsight(),
        carbonAPI.getActivities(8),
        challengeAPI.getAll(),
      ])
      if (a.status === 'fulfilled') setAnalytics(a.value.data)
      if (i.status === 'fulfilled') setInsight(i.value.data)
      if (ac.status === 'fulfilled') setActivities(ac.value.data)
      if (ch.status === 'fulfilled') setChallenges(ch.value.data.slice(0, 3))
      setLoading(false)
    }
    load(); refreshUser()
  }, [])

  if (loading) return (
    <div className="pt-16 min-h-screen dashboard-bg p-6 max-w-7xl mx-auto">
      <SkeletonPage />
    </div>
  )

  const lastCalc = user?.last_calculation || analytics?.last_calculation
  const ecoColor = getEcoLevelColor(user?.eco_level)
  const ecoIcon = getEcoLevelIcon(user?.eco_level)

  const dailyChart = {
    labels: analytics?.daily_labels || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      label: 'CO₂ (kg)',
      data: analytics?.daily_values || [8,6,9,7,11,5,8],
      backgroundColor: (analytics?.daily_values || []).map((_, i, arr) =>
        i === arr.length - 1 ? 'rgba(16,185,129,0.7)' : 'rgba(16,185,129,0.3)'
      ),
      borderColor: '#10b981', borderWidth: 2, borderRadius: 6,
    }]
  }

  const catLabels = analytics?.category_labels?.length ? analytics.category_labels : ['Transportation','Home Energy','Food']
  const catValues = analytics?.category_values?.length ? analytics.category_values : [30,25,20]
  const catChart = {
    labels: catLabels,
    datasets: [{
      data: catValues,
      backgroundColor: catLabels.map(l => `${CATEGORY_COLORS[l] || '#10b981'}cc`),
      borderColor: catLabels.map(l => CATEGORY_COLORS[l] || '#10b981'),
      borderWidth: 2,
    }]
  }

  const xpProgressPct = Math.min(100, ((user?.xp || 0) % 500) / 5)

  return (
    <div className="pt-16 min-h-screen dashboard-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
          className="glass rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/50 via-emerald-950/20 to-transparent"/>
          <div className="absolute right-0 top-0 w-64 h-full opacity-5"
            style={{background: 'radial-gradient(ellipse at right, #10b981, transparent)'}}/>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-black glow-emerald shrink-0"
                style={{backgroundColor: user?.avatar_color || '#10b981'}}>
                {user?.name?.charAt(0).toUpperCase()}
              </motion.div>
              <div>
                <h1 className="text-xl font-black text-white">
                  {insight?.greeting || `Welcome back, ${user?.name?.split(' ')[0]}! 🌿`}
                </h1>
                <p className="text-gray-400 text-sm mt-0.5 max-w-xl">
                  {insight?.insight || 'Your eco-journey continues — every action counts! 🌱'}
                </p>
              </div>
            </div>
            <Link to="/calculator"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl transition-all glow-emerald-sm shrink-0 group">
              <Calculator className="w-4 h-4"/>
              Calculate Footprint
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"/>
            </Link>
          </div>
        </motion.div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            {
              title: 'Carbon Score',
              value: lastCalc ? Math.round(lastCalc.total_co2_kg_per_year).toLocaleString() : '—',
              unit: lastCalc ? 'kg/yr' : '',
              icon: Leaf, color: '#10b981',
              sub: lastCalc ? lastCalc.eco_level : 'Run calculator',
              delay: 0,
            },
            {
              title: 'XP Points',
              value: (user?.xp || 0).toLocaleString(),
              icon: Zap, color: '#f59e0b',
              sub: `${ecoIcon} ${user?.eco_level || 'Eco Beginner'}`,
              delay: 0.05,
            },
            {
              title: 'Eco Streak',
              value: user?.streak || 0,
              unit: 'days',
              icon: Flame, color: '#ef4444',
              sub: user?.streak >= 7 ? '🔥 On fire!' : 'Keep logging daily',
              delay: 0.1,
            },
            {
              title: 'CO₂ Saved',
              value: formatCO2(user?.total_carbon_saved || 0),
              icon: TrendingDown, color: '#3b82f6',
              sub: 'Total reduction',
              delay: 0.15,
            },
          ].map(s => (
            <motion.div key={s.title}
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:s.delay}}
              whileHover={{y:-2}} className="glass rounded-2xl p-6 card-hover">
              <div className="flex items-start justify-between mb-3">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{s.title}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor:`${s.color}20`}}>
                  <s.icon className="w-4 h-4" style={{color:s.color}}/>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{s.value}</span>
                {s.unit && <span className="text-xs text-gray-400">{s.unit}</span>}
              </div>
              <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
            className="lg:col-span-8 glass rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold">Daily Emissions</h3>
                <p className="text-gray-400 text-xs">Last 7 days (kg CO₂)</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-400 font-medium">
                  Avg: {analytics?.daily_avg_kg || '—'} kg/day
                </span>
                <Link to="/analytics" className="text-xs text-gray-400 hover:text-emerald-400 flex items-center gap-1 transition-colors">
                  Full analytics <TrendingUp className="w-3 h-3"/>
                </Link>
              </div>
            </div>
            <div className="h-64 sm:h-72 mt-4 flex-1">
              <Bar data={dailyChart} options={chartOpts}/>
            </div>
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
            className="lg:col-span-4 glass rounded-2xl p-6 flex flex-col">
            <h3 className="text-white font-bold mb-1">By Category</h3>
            <p className="text-gray-400 text-xs mb-4">Emission sources</p>
            <div className="h-64 sm:h-72 mt-4 flex-1 relative flex items-center justify-center">
              <Doughnut data={catChart} options={{
                ...chartOpts,
                plugins: {
                  ...chartOpts.plugins,
                  legend: {
                    display: true, position: 'bottom',
                    labels: { color: '#9ca3af', boxWidth: 10, font: { size: 10 }, padding: 6 }
                  }
                }
              }}/>
            </div>
          </motion.div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Activity */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
            className="lg:col-span-8 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Recent Activity</h3>
              <Link to="/calculator" className="text-emerald-400 text-xs flex items-center gap-1 hover:text-emerald-300 transition-colors">
                Log activity <ArrowRight className="w-3 h-3"/>
              </Link>
            </div>
            {activities.length === 0 ? (
              <div className="text-center py-10">
                <Activity className="w-10 h-10 text-gray-600 mx-auto mb-3"/>
                <p className="text-gray-400 text-sm">No activities logged yet.</p>
                <Link to="/calculator" className="text-emerald-400 text-sm hover:underline mt-2 inline-block">
                  Start tracking your impact →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((a, i) => (
                  <motion.div key={a.id || i}
                    initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-base shrink-0">
                      {a.category === 'Transportation' ? '🚗' : a.category === 'Food' ? '🍽️' : a.category === 'Energy' ? '⚡' : '♻️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{a.description}</p>
                      <p className="text-gray-400 text-xs">{a.category} • {new Date(a.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-400 text-sm font-bold">{a.co2_kg} kg</p>
                      <p className="text-gray-500 text-xs">+{a.points_earned} XP</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Eco Level */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
              className="glass rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3">Eco Level</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl bounce-gentle">{ecoIcon}</div>
                <div>
                  <p className="font-bold" style={{color:ecoColor}}>{user?.eco_level}</p>
                  <p className="text-gray-400 text-xs">{user?.xp || 0} XP total</p>
                </div>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 mb-1">
                <motion.div
                  initial={{width:0}} animate={{width:`${xpProgressPct}%`}}
                  transition={{duration:1, delay:0.5, ease:'easeOut'}}
                  className="h-2 rounded-full progress-bar"/>
              </div>
              <p className="text-gray-500 text-xs">{500 - ((user?.xp || 0) % 500)} XP to next level</p>
            </motion.div>

            {/* Challenges */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
              className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">Active Challenges</h3>
                <Link to="/challenges" className="text-emerald-400 text-xs hover:text-emerald-300 transition-colors">View all →</Link>
              </div>
              {challenges.length === 0 ? (
                <p className="text-gray-500 text-xs">Join a challenge to earn XP!</p>
              ) : (
                <div className="space-y-2">
                  {challenges.map(c => (
                    <div key={c.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                      <span className="text-lg shrink-0">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{c.title}</p>
                        <p className="text-gray-400 text-xs">+{c.xp_reward} XP</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                        c.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                        c.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{c.difficulty}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Badges */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.45}}
              className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">Badges</h3>
                <span className="text-gray-400 text-xs">{user?.badges?.length || 0} earned</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(user?.badges || ['first_step']).map(id => {
                  const b = BADGE_DATA[id]; if (!b) return null
                  return (
                    <motion.div key={id} title={b.name}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl cursor-default border border-gray-700/50"
                      style={{backgroundColor:`${b.color}20`}}>
                      {b.icon}
                    </motion.div>
                  )
                })}
                {(!user?.badges || user.badges.length === 0) &&
                  <p className="text-gray-500 text-xs">Complete challenges to earn badges! 🏅</p>
                }
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
