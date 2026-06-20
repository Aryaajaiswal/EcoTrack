export const formatNumber = (n, d = 0) => Number(n).toLocaleString('en-US', { maximumFractionDigits: d })
export const formatCO2 = kg => kg >= 1000 ? `${(kg/1000).toFixed(1)} tonnes` : `${formatNumber(kg,1)} kg`
export const getEcoLevelColor = l => ({ 'Eco Beginner':'#6b7280','Aware Citizen':'#10b981','Green Warrior':'#3b82f6','Climate Hero':'#f59e0b' }[l] || '#10b981')
export const getEcoLevelIcon = l => ({ 'Eco Beginner':'🌱','Aware Citizen':'🌿','Green Warrior':'⚔️','Climate Hero':'🦸' }[l] || '🌱')
export const getScoreColor = s => s >= 80 ? '#10b981' : s >= 60 ? '#3b82f6' : s >= 40 ? '#f59e0b' : '#ef4444'
export const getInitials = n => n ? n.split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2) : '?'
export const formatDate = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
export const timeAgo = d => {
  const s = Math.floor((Date.now()-new Date(d))/1000)
  if(s<60) return 'just now'
  if(s<3600) return `${Math.floor(s/60)}m ago`
  if(s<86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}
export const CATEGORY_COLORS = { Transportation:'#f59e0b','Home Energy':'#3b82f6',Food:'#10b981',Shopping:'#8b5cf6',Lifestyle:'#ec4899',Other:'#6b7280' }
export const BADGE_DATA = {
  first_step:{name:'First Step',icon:'🌱',color:'#10b981'},
  eco_week:{name:'Eco Week',icon:'🔥',color:'#f59e0b'},
  green_warrior:{name:'Green Warrior',icon:'⚔️',color:'#3b82f6'},
  carbon_ninja:{name:'Carbon Ninja',icon:'🥷',color:'#8b5cf6'},
  climate_champion:{name:'Climate Champion',icon:'🏆',color:'#f97316'},
  challenge_master:{name:'Challenge Master',icon:'🎯',color:'#ec4899'},
  streak_legend:{name:'Streak Legend',icon:'⚡',color:'#eab308'},
  planet_protector:{name:'Planet Protector',icon:'🌍',color:'#06b6d4'},
}
