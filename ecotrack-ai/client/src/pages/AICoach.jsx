import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Zap, TrendingDown, Lightbulb, Bot, User, Loader2 } from 'lucide-react'
import { aiAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler)

const QUICK_PROMPTS = [
  "How can I reduce my transport emissions?",
  "What's the best diet for low carbon?",
  "How do I improve my eco level?",
  "Tell me about renewable energy",
  "What challenge should I start?",
]

export default function AICoach() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([{
    role:'assistant',
    content:`Hello ${user?.name?.split(' ')[0]||'eco warrior'}! 🌿 I'm your AI Sustainability Coach. Ask me about reducing emissions, improving your score, challenges, or eco tips!`,
    timestamp: new Date()
  }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [tips, setTips] = useState([])
  const [predictions, setPredictions] = useState(null)
  const [tab, setTab] = useState('chat')
  const endRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      const [t, p] = await Promise.allSettled([aiAPI.getTips(3), aiAPI.getPredictions(12)])
      if(t.status==='fulfilled') setTips(t.value.data.tips)
      if(p.status==='fulfilled') setPredictions(p.value.data)
    }
    load()
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const send = async (text) => {
    const msg = text || input.trim(); if(!msg) return
    setInput('')
    setMessages(p=>[...p,{role:'user',content:msg,timestamp:new Date()}])
    setSending(true)
    try {
      const res = await aiAPI.chat(msg)
      setMessages(p=>[...p,{role:'assistant',content:res.data.message,timestamp:new Date()}])
    } catch {
      setMessages(p=>[...p,{role:'assistant',content:"Sorry, I'm having trouble connecting. Please try again! 🌿",timestamp:new Date()}])
    } finally { setSending(false) }
  }

  const predChart = predictions ? {
    labels: predictions.labels,
    datasets: [
      { label:'Current', data:predictions.current_trajectory, borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,.08)', fill:true, tension:0.4, pointRadius:2 },
      { label:'Optimistic', data:predictions.optimistic_trajectory, borderColor:'#10b981', backgroundColor:'rgba(16,185,129,.08)', fill:true, tension:0.4, pointRadius:2 },
    ]
  } : null

  return (
    <div className="pt-16 min-h-screen dashboard-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2"><Zap className="w-6 h-6 text-emerald-400"/>AI Sustainability Coach</h1>
          <p className="text-gray-400 text-sm">Personalized guidance, predictions, and daily eco tips.</p>
        </div>

        <div className="flex gap-2 mb-6">
          {[{id:'chat',label:'💬 Chat'},{id:'predictions',label:'📈 Predictions'},{id:'tips',label:'💡 Daily Tips'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab===t.id?'bg-emerald-500 text-black':'glass text-gray-400 hover:text-emerald-400'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab==='chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 glass rounded-2xl overflow-hidden flex flex-col" style={{height:'600px'}}>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg,i)=>(
                    <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className={`flex gap-3 ${msg.role==='user'?'flex-row-reverse':''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role==='assistant'?'bg-emerald-500/20':'bg-gray-700'}`}>
                        {msg.role==='assistant'?<Bot className="w-4 h-4 text-emerald-400"/>:<User className="w-4 h-4 text-gray-300"/>}
                      </div>
                      <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role==='assistant'?'bg-gray-800/60 text-gray-100 rounded-tl-sm':'bg-emerald-500/20 border border-emerald-500/20 text-white rounded-tr-sm'}`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {sending && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><Bot className="w-4 h-4 text-emerald-400"/></div>
                      <div className="px-4 py-3 rounded-2xl bg-gray-800/60 rounded-tl-sm">
                        <div className="flex gap-1 items-center h-4">
                          {[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay:`${i*.15}s`}}/>)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={endRef}/>
              </div>
              <div className="border-t border-gray-700/50 p-4">
                <div className="flex gap-2">
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
                    placeholder="Ask about sustainability, footprint, challenges..."
                    className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white placeholder-gray-500 text-sm transition-colors"/>
                  <button onClick={()=>send()} disabled={sending||!input.trim()}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 text-black font-bold rounded-xl transition-all">
                    {sending?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>}
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-white font-bold text-sm">Quick Questions</h3>
              {QUICK_PROMPTS.map((p,i)=>(
                <button key={i} onClick={()=>send(p)} className="w-full text-left p-3 glass rounded-xl text-gray-300 hover:text-emerald-400 border border-gray-700/50 hover:border-emerald-500/30 text-xs transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab==='predictions' && (
          <div className="space-y-6">
            {predictions ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {[
                    {label:'Annual Forecast',value:`${Math.round(predictions.current_annual_predicted).toLocaleString()} kg`,sub:'CO₂ this year',color:'text-white'},
                    {label:'Optimistic Scenario',value:`${Math.round(predictions.optimistic_annual).toLocaleString()} kg`,sub:'With lifestyle changes',color:'text-emerald-400'},
                    {label:'Potential Savings',value:`${Math.round(predictions.potential_annual_savings).toLocaleString()} kg`,sub:'Achievable reduction',color:'text-blue-400'},
                  ].map(s=>(
                    <div key={s.label} className="glass rounded-2xl p-6">
                      <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                      <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-gray-500 text-xs">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4">12-Month Emission Forecast</h3>
                  <div className="h-64">
                    <Line data={predChart} options={{responsive:true,maintainAspectRatio:false,
                      plugins:{legend:{display:true,labels:{color:'#9ca3af',boxWidth:12,font:{size:11}}},tooltip:{backgroundColor:'#1f2937',titleColor:'#f9fafb',bodyColor:'#9ca3af'}},
                      scales:{x:{ticks:{color:'#6b7280',maxRotation:45},grid:{color:'#1f2937'}},y:{ticks:{color:'#6b7280'},grid:{color:'#1f2937'}}}}}/>
                  </div>
                  <p className="text-gray-500 text-xs mt-3 text-center">
                    Confidence: <span className="text-emerald-400">{Math.round(predictions.forecast_confidence)}%</span> •
                    Improvement rate: <span className="text-emerald-400">{predictions.improvement_rate_monthly_pct}%/month</span>
                  </p>
                </div>
              </>
            ) : <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"/></div>}
          </div>
        )}

        {tab==='tips' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {tips.length>0 ? tips.map((tip,i)=>(
              <motion.div key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.1}} className="glass rounded-2xl p-6 card-hover">
                <div className="text-3xl mb-3">{tip.icon}</div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{tip.category}</span>
                <p className="text-gray-200 text-sm mt-3 leading-relaxed">{tip.tip}</p>
                <p className="text-emerald-400 text-xs mt-3 font-medium">💚 {tip.impact}</p>
              </motion.div>
            )) : <div className="col-span-3 flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"/></div>}
          </div>
        )}
      </div>
    </div>
  )
}
