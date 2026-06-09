import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Home, Leaf, ShoppingBag, Recycle, ChevronRight, ChevronLeft, CheckCircle, Zap, BarChart2 } from 'lucide-react'
import { carbonAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { formatCO2, getScoreColor, CATEGORY_COLORS } from '../utils/helpers'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const STEPS = ['Transportation','Home Energy','Food','Shopping','Lifestyle']
const STEP_ICONS = [Car, Home, Leaf, ShoppingBag, Recycle]

const defaultForm = {
  transportation: { car_km_per_week:100, car_type:'petrol', bike_km_per_week:0, public_transport_km_per_week:20, flights_per_year:2, flight_type:'domestic' },
  home_energy: { electricity_kwh_per_month:250, renewable_energy_percent:0, ac_hours_per_day:4, num_people_in_home:2 },
  food: { diet_type:'omnivore', dairy_servings_per_week:7, food_waste_level:'medium' },
  shopping: { clothing_items_per_month:2, online_orders_per_month:4, plastic_usage:'medium', buys_secondhand:false },
  lifestyle: { water_liters_per_day:150, recycling_habit:'sometimes', waste_kg_per_week:5, uses_renewable_energy:false },
}

const Sel = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-gray-300 text-sm mb-1.5">{label}</label>
    <select value={value} onChange={e=>onChange(e.target.value)}
      className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white text-sm transition-colors">
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
)

const Num = ({ label, value, onChange, min=0, max, step=1, unit }) => (
  <div>
    <label className="block text-gray-300 text-sm mb-1.5">{label}{unit&&<span className="text-gray-500 ml-1">({unit})</span>}</label>
    <input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} min={min} max={max} step={step}
      className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl text-white text-sm transition-colors"/>
  </div>
)

const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30">
    <span className="text-gray-300 text-sm">{label}</span>
    <button onClick={()=>onChange(!value)} className={`relative w-12 h-6 rounded-full transition-colors ${value?'bg-emerald-500':'bg-gray-600'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${value?'left-7':'left-1'}`}/>
    </button>
  </div>
)

export default function Calculator() {
  const { refreshUser } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(defaultForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const upd = (sec, key, val) => setForm(f=>({...f,[sec]:{...f[sec],[key]:val}}))

  const handleCalc = async () => {
    setLoading(true)
    try {
      const res = await carbonAPI.calculate(form)
      setResult(res.data)
      await refreshUser()
      toast.success('Carbon footprint calculated! 🌿 +50 XP earned')
    } catch(err) { toast.error(err.response?.data?.detail||'Calculation failed.') }
    finally { setLoading(false) }
  }

  const renderStep = () => {
    switch(step) {
      case 0: return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Num label="Car travel" unit="km/week" value={form.transportation.car_km_per_week} onChange={v=>upd('transportation','car_km_per_week',v)}/>
          <Sel label="Car type" value={form.transportation.car_type} onChange={v=>upd('transportation','car_type',v)}
            options={[{value:'petrol',label:'Petrol/Gasoline'},{value:'diesel',label:'Diesel'},{value:'electric',label:'Electric'},{value:'hybrid',label:'Hybrid'}]}/>
          <Num label="Public transport" unit="km/week" value={form.transportation.public_transport_km_per_week} onChange={v=>upd('transportation','public_transport_km_per_week',v)}/>
          <Num label="Cycling/Walking" unit="km/week" value={form.transportation.bike_km_per_week} onChange={v=>upd('transportation','bike_km_per_week',v)}/>
          <Num label="Flights per year" value={form.transportation.flights_per_year} onChange={v=>upd('transportation','flights_per_year',v)}/>
          <Sel label="Flight type" value={form.transportation.flight_type} onChange={v=>upd('transportation','flight_type',v)}
            options={[{value:'domestic',label:'Mostly Domestic'},{value:'international',label:'Mostly International'}]}/>
        </div>
      )
      case 1: return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Num label="Monthly electricity" unit="kWh" value={form.home_energy.electricity_kwh_per_month} onChange={v=>upd('home_energy','electricity_kwh_per_month',v)}/>
          <Num label="Renewable energy" unit="%" max={100} value={form.home_energy.renewable_energy_percent} onChange={v=>upd('home_energy','renewable_energy_percent',v)}/>
          <Num label="AC usage" unit="hrs/day" max={24} step={0.5} value={form.home_energy.ac_hours_per_day} onChange={v=>upd('home_energy','ac_hours_per_day',v)}/>
          <Num label="People in home" min={1} max={20} value={form.home_energy.num_people_in_home} onChange={v=>upd('home_energy','num_people_in_home',v)}/>
        </div>
      )
      case 2: return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Sel label="Diet type" value={form.food.diet_type} onChange={v=>upd('food','diet_type',v)}
            options={[{value:'vegan',label:'🌱 Vegan'},{value:'vegetarian',label:'🥦 Vegetarian'},{value:'omnivore',label:'🍽️ Omnivore'},{value:'heavy_meat',label:'🥩 Heavy Meat Eater'}]}/>
          <Num label="Dairy servings" unit="per week" max={30} step={0.5} value={form.food.dairy_servings_per_week} onChange={v=>upd('food','dairy_servings_per_week',v)}/>
          <div className="sm:col-span-2">
            <Sel label="Food waste level" value={form.food.food_waste_level} onChange={v=>upd('food','food_waste_level',v)}
              options={[{value:'low',label:'✅ Low — Barely waste food'},{value:'medium',label:'🔶 Medium — Some waste'},{value:'high',label:'❌ High — Waste a lot'}]}/>
          </div>
        </div>
      )
      case 3: return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Num label="New clothing items" unit="per month" value={form.shopping.clothing_items_per_month} onChange={v=>upd('shopping','clothing_items_per_month',v)}/>
          <Num label="Online orders" unit="per month" value={form.shopping.online_orders_per_month} onChange={v=>upd('shopping','online_orders_per_month',v)}/>
          <Sel label="Plastic usage" value={form.shopping.plastic_usage} onChange={v=>upd('shopping','plastic_usage',v)}
            options={[{value:'low',label:'✅ Low — Reusable'},{value:'medium',label:'🔶 Medium — Mixed'},{value:'high',label:'❌ High — Lots of single-use'}]}/>
          <Toggle label="Buy secondhand clothing?" value={form.shopping.buys_secondhand} onChange={v=>upd('shopping','buys_secondhand',v)}/>
        </div>
      )
      case 4: return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Num label="Daily water usage" unit="liters" value={form.lifestyle.water_liters_per_day} onChange={v=>upd('lifestyle','water_liters_per_day',v)}/>
          <Num label="Weekly waste" unit="kg" step={0.5} value={form.lifestyle.waste_kg_per_week} onChange={v=>upd('lifestyle','waste_kg_per_week',v)}/>
          <div className="sm:col-span-2">
            <Sel label="Recycling habit" value={form.lifestyle.recycling_habit} onChange={v=>upd('lifestyle','recycling_habit',v)}
              options={[{value:'always',label:'✅ Always — Dedicated recycler'},{value:'sometimes',label:'🔶 Sometimes — When convenient'},{value:'never',label:'❌ Never — I don\'t recycle'}]}/>
          </div>
        </div>
      )
      default: return null
    }
  }

  if (result) {
    const scoreColor = getScoreColor(result.sustainability_score)
    const catLabels = Object.keys(result.category_breakdown)
    const catValues = Object.values(result.category_breakdown)
    const colors = ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#ec4899']
    return (
      <div className="pt-16 min-h-screen dashboard-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} className="space-y-6 sm:space-y-8">
            <div className="glass rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 to-transparent"/>
              <div className="relative">
                <div className="text-5xl font-black mb-2" style={{color:scoreColor}}>{result.sustainability_score}</div>
                <p className="text-gray-400 text-sm mb-4">Sustainability Score (out of 100)</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold" style={{borderColor:scoreColor,color:scoreColor,backgroundColor:`${scoreColor}15`}}>{result.eco_level}</div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div><p className="text-2xl font-black text-white">{formatCO2(result.total_co2_kg_per_year)}</p><p className="text-gray-400 text-xs">per year</p></div>
                  <div><p className="text-2xl font-black text-white">{formatCO2(result.monthly_co2_kg)}</p><p className="text-gray-400 text-xs">per month</p></div>
                  <div><p className="text-2xl font-black text-emerald-400">{result.percentile_better_than}%</p><p className="text-gray-400 text-xs">better than global avg</p></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="glass rounded-2xl p-6 sm:p-8">
                <h3 className="text-white font-bold mb-4">Emission Breakdown</h3>
                <div className="h-48">
                  <Doughnut data={{ labels:catLabels.map(l=>l.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())), datasets:[{data:catValues,backgroundColor:colors.map(c=>`${c}cc`),borderWidth:2}] }}
                    options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#9ca3af',boxWidth:10,font:{size:10}}}}}}/>
                </div>
              </div>
              <div className="glass rounded-2xl p-6 sm:p-8">
                <h3 className="text-white font-bold mb-4">vs Global Averages</h3>
                <div className="h-48">
                  <Bar data={{labels:['You','Global Avg','US Avg'],datasets:[{data:[result.total_co2_kg_per_year,4700,15000],backgroundColor:['rgba(16,185,129,.6)','rgba(251,191,36,.6)','rgba(239,68,68,.6)'],borderColor:['#10b981','#fbbf24','#ef4444'],borderWidth:2,borderRadius:6}]}}
                    options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#6b7280'},grid:{color:'#1f2937'}},y:{ticks:{color:'#6b7280'},grid:{color:'#1f2937'}}}}}/>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-6 sm:p-8">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-emerald-400"/>AI Recommendations</h3>
              <div className="space-y-3">
                {result.recommendations.map((r,i)=>(
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"/>
                    <p className="text-gray-300 text-sm">{r}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 border border-emerald-500/20">
              <div className="text-4xl">💚</div>
              <div>
                <p className="text-white font-bold">Potential Annual Savings</p>
                <p className="text-gray-400 text-sm">With moderate changes, save up to <span className="text-emerald-400 font-bold">{formatCO2(result.potential_savings_kg)}</span> CO₂/year.</p>
              </div>
            </div>
            <button onClick={()=>{setResult(null);setStep(0)}} className="w-full py-3 glass border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 font-semibold rounded-xl transition-all">
              Recalculate
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  const StepIcon = STEP_ICONS[step]
  return (
    <div className="pt-16 min-h-screen dashboard-bg flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white mb-2">Carbon Footprint Calculator</h1>
            <p className="text-gray-400 text-sm">5 sections to get your precise carbon score</p>
          </div>
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s,i)=>{const Icon=STEP_ICONS[i]; return (
              <div key={s} className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${i===step?'bg-emerald-500 glow-emerald-sm':i<step?'bg-emerald-700':'bg-gray-700'}`}>
                  {i<step?<CheckCircle className="w-4 h-4 text-white"/>:<Icon className={`w-4 h-4 ${i===step?'text-black':'text-gray-400'}`}/>}
                </div>
                <span className={`text-xs hidden sm:block ${i===step?'text-emerald-400':i<step?'text-emerald-600':'text-gray-600'}`}>{s}</span>
              </div>
            )})}
          </div>
          <div className="glass rounded-2xl p-6 sm:p-10 shadow-2xl border border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <StepIcon className="w-5 h-5 text-emerald-400"/>
              </div>
              <div>
                <h2 className="text-white font-bold">{STEPS[step]}</h2>
                <p className="text-gray-400 text-xs">Step {step+1} of {STEPS.length}</p>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.25}}>
                {renderStep()}
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-700/50">
              <button onClick={()=>setStep(s=>s-1)} disabled={step===0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm">
                <ChevronLeft className="w-4 h-4"/>Back
              </button>
              {step<STEPS.length-1 ? (
                <button onClick={()=>setStep(s=>s+1)} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all text-sm">
                  Next<ChevronRight className="w-4 h-4"/>
                </button>
              ) : (
                <button onClick={handleCalc} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-black font-bold rounded-xl transition-all glow-emerald-sm text-sm">
                  {loading?<div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>:<><BarChart2 className="w-4 h-4"/>Calculate</>}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
