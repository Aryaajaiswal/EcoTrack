import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, BarChart2, Activity, Target, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react'
import { carbonAPI, aiAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement, BarElement,
  PointElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { formatCO2 } from '../utils/helpers'

ChartJS.register(CategoryScale, LinearScale, LineElement, BarElement, PointElement, ArcElement, Tooltip, Legend, Filler)

const chartDefaults = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1f2937', titleColor: '#f9fafb', bodyColor: '#9ca3af', borderColor: '#374151', borderWidth: 1, padding: 10 }
  },
  scales: {
    x: { grid: { color: 'rgba(55,65,81,0.5)' }, ticks: { color: '#6b7280', font: { size: 11 } } },
    y: { grid: { color: 'rgba(55,65,81,0.5)' }, ticks: { color: '#6b7280', font: { size: 11 } } }
  }
}

export default function Analytics() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    const load = async () => {
      const [a, p, f] = await Promise.allSettled([
        carbonAPI.getAnalytics(),
        aiAPI.getPredictions(12),
        aiAPI.getForecast(),
      ])
      if (a.status === 'fulfilled') setAnalytics(a.value.data)
      if (p.status === 'fulfilled') setPredictions(p.value.data)
      if (f.status === 'fulfilled') setForecast(f.value.data)
      setLoading(false)
    }
    load()
  }, [])

  const lastCalc = user?.last_calculation

  const predChart = predictions ? {
    labels: predictions.labels,
    datasets: [
      {
        label: 'Optimistic', data: predictions.optimistic_trajectory,
        borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)',
        fill: true, tension: 0.4, pointRadius: 2, pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: 'Current', data: predictions.current_trajectory,
        borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.05)',
        fill: false, tension: 0.4, pointRadius: 2, pointHoverRadius: 5,
        borderWidth: 2, borderDash: [5, 3],
      },
      {
        label: 'Pessimistic', data: predictions.pessimistic_trajectory,
        borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.04)',
        fill: false, tension: 0.4, pointRadius: 2, pointHoverRadius: 5,
        borderWidth: 1.5, borderDash: [3, 3],
      },
    ]
  } : null

  const forecastChart = forecast ? {
    labels: forecast.labels,
    datasets: [{
      label: 'Forecast kg CO₂',
      data: forecast.forecast,
      borderColor: '#3b82f6',
      backgroundColor: forecast.forecast.map((_, i) =>
        i < 3 ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.3)'
      ),
      borderRadius: 6, borderWidth: 2,
    }]
  } : null

  const weeklyChart = analytics ? {
    labels: analytics.weekly_labels,
    datasets: [{
      label: 'Weekly CO₂ (kg)',
      data: analytics.weekly_values,
      backgroundColor: analytics.weekly_values.map((v, i) =>
        i === 3 ? 'rgba(16,185,129,0.7)' : 'rgba(16,185,129,0.3)'
      ),
      borderColor: '#10b981', borderWidth: 2, borderRadius: 8,
    }]
  } : null

  const catChart = analytics?.category_labels?.length ? {
    labels: analytics.category_labels,
    datasets: [{
      data: analytics.category_values,
      backgroundColor: ['rgba(245,158,11,0.7)','rgba(59,130,246,0.7)','rgba(16,185,129,0.7)','rgba(139,92,246,0.7)','rgba(236,72,153,0.7)'],
      borderColor: ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#ec4899'],
      borderWidth: 2,
    }]
  } : null

  if (loading) return (
    <div className="pt-16 min-h-screen dashboard-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="skeleton h-8 w-48 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl"/>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="skeleton h-72 rounded-2xl"/>
            <div className="skeleton h-72 rounded-2xl"/>
          </div>
        </div>
      </div>
    </div>
  )

  const trendIcon = forecast?.trend === 'improving'
    ? <ArrowDownRight className="w-4 h-4 text-emerald-400"/>
    : <ArrowUpRight className="w-4 h-4 text-red-400"/>

  return (
    <div className="pt-16 min-h-screen dashboard-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="mb-8">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-emerald-400"/>
            Analytics & Predictions
          </h1>
          <p className="text-gray-400 text-sm mt-1">AI-powered insights into your carbon footprint trajectory</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Annual Footprint',
              value: lastCalc ? formatCO2(lastCalc.total_co2_kg_per_year) : '—',
              sub: lastCalc ? `${lastCalc.eco_level}` : 'Run calculator',
              icon: Activity, color: '#10b981', delay: 0
            },
            {
              label: 'Monthly Avg',
              value: analytics ? `${analytics.daily_avg_kg} kg` : '—',
              sub: 'CO₂ per day',
              icon: TrendingDown, color: '#3b82f6', delay: 0.05
            },
            {
              label: 'Forecast Trend',
              value: forecast?.trend || '—',
              sub: forecast ? `${forecast.trend_pct}% change/week` : 'Logging needed',
              icon: Target, color: forecast?.trend === 'improving' ? '#10b981' : '#f59e0b', delay: 0.1
            },
            {
              label: 'Potential Savings',
              value: predictions ? formatCO2(predictions.potential_annual_savings) : '—',
              sub: 'With lifestyle changes',
              icon: Zap, color: '#f59e0b', delay: 0.15
            },
          ].map(s => (
            <motion.div key={s.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
              transition={{delay:s.delay}} className="glass rounded-2xl p-5 card-hover">
              <div className="flex items-start justify-between mb-2">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{s.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor:`${s.color}20`}}>
                  <s.icon className="w-4 h-4" style={{color:s.color}}/>
                </div>
              </div>
              <p className="text-2xl font-black text-white mb-1 capitalize">{s.value}</p>
              <p className="text-xs text-gray-500">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Prediction Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
            className="lg:col-span-2 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold">12-Month Emission Forecast</h3>
                <p className="text-gray-400 text-xs mt-0.5">AI-predicted CO₂ trajectories (kg/month)</p>
              </div>
              {predictions && (
                <div className="text-right">
                  <p className="text-emerald-400 text-xs font-medium">
                    {Math.round(predictions.forecast_confidence)}% confidence
                  </p>
                  <p className="text-gray-500 text-xs">
                    {predictions.improvement_rate_monthly_pct}%/mo rate
                  </p>
                </div>
              )}
            </div>
            {predChart ? (
              <>
                <div className="h-64">
                  <Line data={predChart} options={{
                    ...chartDefaults,
                    plugins: {
                      ...chartDefaults.plugins,
                      legend: {
                        display: true, position: 'top',
                        labels: { color: '#9ca3af', boxWidth: 12, font: { size: 11 }, padding: 16 }
                      }
                    }
                  }}/>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-700/50">
                  {[
                    {label:'Annual (Current)', v: `${Math.round(predictions.current_annual_predicted).toLocaleString()} kg`, c:'text-amber-400'},
                    {label:'Annual (Optimistic)', v: `${Math.round(predictions.optimistic_annual).toLocaleString()} kg`, c:'text-emerald-400'},
                    {label:'Potential Savings', v: `${Math.round(predictions.potential_annual_savings).toLocaleString()} kg`, c:'text-blue-400'},
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className={`font-bold text-sm ${s.c}`}>{s.v}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart2 className="w-12 h-12 text-gray-600 mx-auto mb-3"/>
                  <p className="text-gray-400 text-sm">Run the calculator to see predictions</p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
            className="glass rounded-2xl p-6">
            <h3 className="text-white font-bold mb-1">Category Breakdown</h3>
            <p className="text-gray-400 text-xs mb-4">Emission sources this month</p>
            {catChart ? (
              <div className="h-52">
                <Doughnut data={catChart} options={{
                  ...chartDefaults,
                  plugins: {
                    ...chartDefaults.plugins,
                    legend: {
                      display: true, position: 'bottom',
                      labels: { color: '#9ca3af', boxWidth: 10, font: { size: 10 }, padding: 8 }
                    }
                  }
                }}/>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No activity data yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Weekly & Forecast Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
            className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold">Weekly Emissions</h3>
                <p className="text-gray-400 text-xs">CO₂ logged per week (kg)</p>
              </div>
              <span className="text-xs text-gray-500">Last 4 weeks</span>
            </div>
            {weeklyChart ? (
              <div className="h-52">
                <Bar data={weeklyChart} options={chartDefaults}/>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Log activities to see data</p>
              </div>
            )}
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
            className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold">7-Day Ahead Forecast</h3>
                <p className="text-gray-400 text-xs flex items-center gap-1">
                  AI trend analysis {forecast && trendIcon}
                  {forecast && <span className={forecast.trend === 'improving' ? 'text-emerald-400' : 'text-amber-400'}>{forecast.trend}</span>}
                </p>
              </div>
              {forecast && (
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Avg now: <span className="text-white">{forecast.avg_current} kg/day</span></p>
                  <p className="text-gray-400 text-xs">Avg predicted: <span className="text-blue-400">{forecast.avg_forecast} kg/day</span></p>
                </div>
              )}
            </div>
            {forecastChart ? (
              <div className="h-52">
                <Bar data={forecastChart} options={chartDefaults}/>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Need more activity data for forecast</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sustainability Score Card */}
        {lastCalc && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
            className="glass rounded-2xl p-6 mt-6">
            <h3 className="text-white font-bold mb-4">Carbon Footprint Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {Object.entries(lastCalc.category_breakdown || {}).map(([cat, val], i) => {
                const colors = ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#ec4899']
                const pct = Math.round((val / lastCalc.total_co2_kg_per_year) * 100)
                return (
                  <div key={cat} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.91" fill="none" stroke="#1f2937" strokeWidth="3"/>
                        <circle cx="18" cy="18" r="15.91" fill="none" stroke={colors[i % colors.length]}
                          strokeWidth="3" strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{pct}%</span>
                      </div>
                    </div>
                    <p className="text-white text-xs font-bold">{formatCO2(val)}</p>
                    <p className="text-gray-500 text-xs capitalize mt-0.5">{cat.replace('_',' ')}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
