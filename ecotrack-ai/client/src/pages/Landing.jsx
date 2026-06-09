import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import {
  Leaf, BarChart2, Zap, Trophy, Shield, ArrowRight,
  CheckCircle, Star, Sparkles, Sprout, Globe2, Twitter, Github, Linkedin
} from 'lucide-react'
import ParticleBackground from '../components/ParticleBackground'

// --- Data ---
const features = [
  { icon: BarChart2, title: 'Precision Carbon Tracking', desc: 'Log your transport, energy, and food habits. Our engine uses real IPCC emission factors for highly accurate CO₂ calculations.', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { icon: Trophy, title: 'Gamified Sustainability', desc: 'Turn climate action into a rewarding experience. Earn XP, unlock eco-badges, and climb the global leaderboard.', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { icon: Shield, title: 'Private & Secure', desc: 'Your personal data and habits are encrypted and never sold. Your environmental journey stays completely private.', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
]

const impacts = [
  { value: '1.2M+', label: 'Trees Equivalent Saved' },
  { value: '2.8M', label: 'Tonnes CO₂ Prevented' },
  { value: '145K+', label: 'Active Eco Warriors' },
  { value: '12+', label: 'Countries Represented' },
]

const testimonials = [
  { name: 'S. Chen', role: 'Reduced emissions by 34%', text: '"The AI coach doesn\'t just give generic advice. It actually looked at my flight habits and suggested realistic train alternatives that fit my schedule. Game changer."', avatar: 'S', color: '#10b981' },
  { name: 'M. Webb', role: 'Level 12 Eco Warrior', text: '"I started this for a hackathon, but the gamification hooked me. I\'m currently on a 14-day streak of zero-waste lunches. It makes being green genuinely fun."', avatar: 'M', color: '#3b82f6' },
  { name: 'P. Patel', role: 'Carbon Analyst', text: '"As someone who works in climate tech, I\'m incredibly impressed by the accuracy of the IPCC factors used here. This is a robust tool disguised as a beautiful app."', avatar: 'P', color: '#8b5cf6' },
]

const footerLinks = {
  Product: ['Features', 'Carbon Calculator', 'AI Coach', 'Pricing', 'Changelog'],
  Resources: ['Sustainability Blog', 'IPCC Methodology', 'API Documentation', 'Community Forum'],
  Company: ['About Us', 'Careers', 'Climate Pledge', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
}

// --- Animations ---
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: 'easeOut' } }) }
const floatAnimation = { y: [-10, 10, -10], transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }

export default function Landing() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <div className="min-h-screen bg-[#030712] font-sans selection:bg-emerald-500/30 selection:text-emerald-200" ref={ref}>
      
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-emerald-900/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center glow-emerald-xs group-hover:bg-emerald-500/20 transition-all">
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-black text-lg tracking-tight text-white">EcoTrack<span className="text-emerald-400">.ai</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#product" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Product</a>
            <a href="#ai-coach" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">AI Coach</a>
            <a href="#impact" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Impact</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-400 hover:text-white text-sm font-medium transition-colors hidden sm:block">Sign In</Link>
            <Link to="/register"
              className="px-5 py-2.5 bg-white text-black hover:bg-gray-100 font-semibold text-sm rounded-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-emerald-900/20">
        <ParticleBackground count={20} />
        
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Text */}
            <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-2xl">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen Climate Tech
              </motion.div>
              
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                Track Carbon.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400">
                  Build the Future.
                </span>
              </motion.h1>
              
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
                className="text-gray-400 text-lg sm:text-xl mb-10 leading-relaxed font-light max-w-xl">
                The intelligent sustainability platform that helps you measure your footprint, receive AI-driven insights, and take real-world climate action.
              </motion.p>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link to="/register"
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl transition-all glow-emerald">
                  Start for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/calculator"
                  className="flex items-center justify-center gap-2 px-8 py-4 glass border border-white/10 hover:border-white/20 text-white font-semibold text-lg rounded-xl transition-all">
                  Calculate Impact
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
                className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#030712] bg-gray-800 flex items-center justify-center`}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Eco${i}&backgroundColor=transparent`} alt="avatar" className="w-full h-full rounded-full opacity-80" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-yellow-500 mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                  </div>
                  <span className="text-xs">Joined by <span className="text-gray-300 font-medium">145,000+</span> users</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image / Dashboard Mockup */}
            <motion.div 
              initial={{ opacity: 0, x: 40, rotateY: -15 }} 
              animate={{ opacity: 1, x: 0, rotateY: -5 }} 
              transition={{ delay: 0.4, duration: 0.8, type: 'spring', bounce: 0.4 }}
              className="relative lg:ml-10 perspective-1000"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 blur-3xl rounded-[2rem] transform -rotate-6" />
              <motion.div animate={floatAnimation} className="relative rounded-[1.5rem] border border-white/10 bg-[#0a0f1a] overflow-hidden shadow-2xl shadow-emerald-900/20 transform rotate-y-[-5deg]">
                <div className="h-8 bg-[#0f1523] border-b border-white/5 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <img src="/images/dashboard.png" alt="EcoTrack AI Dashboard" className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity" />
              </motion.div>
              
              {/* Floating Element */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 glass border border-white/10 p-4 rounded-xl flex items-center gap-4 shadow-xl"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Carbon Saved</div>
                  <div className="text-2xl font-black text-white">4,850 <span className="text-sm font-normal text-gray-500">kg</span></div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── LOGOS SECTION ─── */}
      <section className="py-16 border-b border-emerald-900/20 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-10">Powered by Industry Leading Tech</p>
          <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Generic placeholder tech text instead of complex SVG logos for simplicity */}
            <span className="text-xl font-bold font-mono">React 19</span>
            <span className="text-xl font-bold font-mono">FastAPI</span>
            <span className="text-xl font-bold font-mono">MongoDB</span>
            <span className="text-xl font-bold font-mono">TailwindCSS</span>
            <span className="text-xl font-bold font-mono">Chart.js</span>
          </div>
        </div>
      </section>

      {/* ─── AI COACH SECTION (Alternating Layout) ─── */}
      <section id="ai-coach" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Image Side */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              className="order-2 lg:order-1 relative"
            >
              <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full" />
              <div className="relative rounded-2xl border border-white/10 bg-[#0a0f1a] overflow-hidden shadow-2xl">
                <img src="/images/ai_coach.png" alt="AI Sustainability Coach" className="w-full h-auto" />
              </div>
            </motion.div>

            {/* Text Side */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                <Zap className="w-3.5 h-3.5" /> Intelligence
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                Meet your personal <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Sustainability Coach</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed font-light">
                Generic advice doesn't work. Our AI analyzes your specific lifestyle data to deliver highly actionable, personalized recommendations that drastically reduce your footprint without compromising your quality of life.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  '12-Month Predictive Emission Forecasts',
                  'Context-aware transport alternatives',
                  'Dietary impact simulations'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── IMPACT / EMOTIONAL HOOK SECTION ─── */}
      <section id="impact" className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-emerald-950/20 to-[#030712]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">Real World <span className="text-emerald-400">Impact</span></h2>
            <p className="text-gray-400 text-lg font-light">
              Numbers on a screen are good. But we translate your digital efforts into physical reality. Here is what our community has accomplished so far.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Earth Visualization */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative flex justify-center">
               <div className="absolute inset-0 bg-emerald-500/20 blur-[120px] rounded-full" />
               <img src="/images/earth.png" alt="Global Impact" className="relative w-full max-w-md animate-[spin_120s_linear_infinite]" />
            </motion.div>

            {/* Impact Stats */}
            <div className="grid sm:grid-cols-2 gap-6">
              {impacts.map((stat, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                  className="glass p-8 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                  <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                  <div className="text-emerald-400 font-medium text-sm uppercase tracking-wide">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID (Refined) ─── */}
      <section id="product" className="py-24 lg:py-32 bg-[#050b14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Core Platform Features</h2>
            <p className="text-gray-400 max-w-2xl font-light">Everything you need to track, understand, and reduce your emissions.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="bg-[#0a0f1a] border border-white/5 p-8 rounded-2xl hover:bg-white/[0.02] transition-colors group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: f.bg }}>
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REFINED TESTIMONIALS ─── */}
      <section className="py-24 lg:py-32 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Stories from the Community</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="glass p-8 rounded-2xl border border-white/5">
                <p className="text-gray-300 text-sm leading-relaxed mb-8 italic font-light">{t.text}</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-sm" style={{ backgroundColor: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-emerald-500 text-xs font-medium">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/20" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <Globe2 className="w-16 h-16 text-emerald-400 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">
            Ready to change your trajectory?
          </h2>
          <p className="text-emerald-100/70 text-lg sm:text-xl mb-10 font-light max-w-2xl mx-auto">
            Join thousands of individuals using EcoTrack AI to take meaningful, data-driven action against climate change.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black hover:bg-gray-100 font-bold text-lg rounded-xl transition-all shadow-xl hover:scale-105">
            Create Your Free Account
          </Link>
          <p className="mt-6 text-sm text-emerald-200/50">No credit card required. 100% free for individuals.</p>
        </div>
      </section>

      {/* ─── EXPANDED FOOTER ─── */}
      <footer className="bg-[#020408] pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <Leaf className="w-5 h-5 text-emerald-500" />
                <span className="font-black text-xl text-white">EcoTrack<span className="text-emerald-500">.ai</span></span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs font-light">
                An open-source initiative leveraging artificial intelligence to help individuals track, understand, and reduce their carbon footprint.
              </p>
              <div className="flex items-center gap-4 text-gray-400">
                <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-white font-semibold mb-4">{title}</h4>
                <ul className="space-y-3">
                  {links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors font-light">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm font-light">© 2026 EcoTrack AI. Built for the Hackathon. 🌍</p>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-600 bg-white/5 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
