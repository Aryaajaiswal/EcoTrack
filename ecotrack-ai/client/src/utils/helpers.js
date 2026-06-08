/**
 * Shared utility functions for EcoTrack AI.
 */

/** Format a number with commas */
export const formatNumber = (n, decimals = 0) =>
  Number(n).toLocaleString('en-US', { maximumFractionDigits: decimals })

/** Format kg CO2 */
export const formatCO2 = (kg) => {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} tonnes`
  return `${formatNumber(kg, 1)} kg`
}

/** Get eco level color */
export const getEcoLevelColor = (level) => {
  const colors = {
    'Eco Beginner': '#6b7280',
    'Aware Citizen': '#10b981',
    'Green Warrior': '#3b82f6',
    'Climate Hero': '#f59e0b',
  }
  return colors[level] || '#10b981'
}

/** Get eco level icon */
export const getEcoLevelIcon = (level) => {
  const icons = {
    'Eco Beginner': '🌱',
    'Aware Citizen': '🌿',
    'Green Warrior': '⚔️',
    'Climate Hero': '🦸',
  }
  return icons[level] || '🌱'
}

/** Category colors for charts */
export const CATEGORY_COLORS = {
  Transportation: '#f59e0b',
  'Home Energy': '#3b82f6',
  Food: '#10b981',
  Shopping: '#8b5cf6',
  Lifestyle: '#ec4899',
  Other: '#6b7280',
}

/** Get initials from name */
export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

/** Format date */
export const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Format relative time */
export const timeAgo = (dateStr) => {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/** Calculate sustainability score color */
export const getScoreColor = (score) => {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#3b82f6'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

/** Badge display data */
export const BADGE_DATA = {
  first_step: { name: 'First Step', icon: '🌱', color: '#10b981' },
  eco_week: { name: 'Eco Week', icon: '🔥', color: '#f59e0b' },
  green_warrior: { name: 'Green Warrior', icon: '⚔️', color: '#3b82f6' },
  carbon_ninja: { name: 'Carbon Ninja', icon: '🥷', color: '#8b5cf6' },
  climate_champion: { name: 'Climate Champion', icon: '🏆', color: '#f97316' },
  challenge_master: { name: 'Challenge Master', icon: '🎯', color: '#ec4899' },
  streak_legend: { name: 'Streak Legend', icon: '⚡', color: '#eab308' },
  planet_protector: { name: 'Planet Protector', icon: '🌍', color: '#06b6d4' },
}
