/**
 * Landing page — hero, features, how it works, stats, testimonials, CTA.
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Leaf, BarChart2, Zap, Trophy, Shield, Globe, ArrowRight,
  CheckCircle, Star, TrendingDown, Users, Award
} from 'lucide-react'
import ParticleBackground from '../components/ParticleBackground'

const features = [
  { icon: BarChart2, title: 'Carbon Calculator', desc: 'Measure your full carbon footprint across transport, energy, food, and lifestyle with precision.', color: '#10b981' },
  { icon: Zap, title: 'AI Sustainability Coach', desc: 'Get personalized recommendations and predictions from our intelligent AI system.', color: '#3b82f6' },
  { icon: TrendingDown, title: 'Predictive Analytics', desc: 'ML-powered trend analysis forecasts your future emissions and improvement trajectory.', color: '#8b5cf6' },
  { icon: Trophy, title: 'Gamification', desc: 'Earn XP, badges, and climb the leaderboard while building sustainable habits.', color: '#f59e0b' },
  { icon: Globe, title: 'Eco Challenges', desc: 'Complete real-world sustainability challenges and track your environmental impact.', color: '#ec4899' },
  { icon: Shield, title: 'Privacy First', desc: 'Your data is encrypted and never sold. Your eco-journey stays private and secure.', color: '#06b6d4' },
]

const steps = [
  { num: '01', title: 'Sign Up Free', desc: 'Create your account in 30 seconds and set your sustainability goals.' },
  { num: '02', title: 'Calculate Your Footprint', desc: 'Answer simple questions about your lifestyle to get your precise carbon score.' },
  { num: '03', title: 'Get AI Insights', desc: 'Receive intelligent recommendations tailored to your unique carbon profile.' },
  { num: '04', title: 'Track & Improve', desc: 'Log daily activities, complete challenges, and watch your impact shrink.' },
]

const stats = [
  { value: '2.8M', label: 'Tonnes CO₂ Tracked', icon: '🌍' },
  { value: '145K', label: 'Eco Warriors', icon: '🌿' },
  { value: '89%', label: 'Reduced Emissions', icon: '📉' },
  { value: '4.8★', label: 'User Rating', icon: '⭐' },
]

const testimonials = [
  { name: 'Sarah Chen', role: 'UX Designer', text: 'EcoTrack AI helped me cut my carbon footprint by 34% in just 3 months. The AI coach is genuinely insightful!', avatar: '#10b981' },
  { name: 'Marcus Webb', role: 'Software Engineer', text: 'The gamification system kept me engaged. I\'ve completed 18 challenges and earned the Climate Hero badge!', avatar: '#3b82f6' },
  { name: 'Priya Patel', role: 'Climate Researcher', text: 'Finally a carbon tracker that uses real emission factors. The predictive analytics are surprisingly accurate.', avatar: '#8b5cf6' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#030712]">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-bold text-lg gradient-text">EcoTrack AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">Features</a>
            <a href="#how" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">How It Works</a>
            <a href="#stats" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-300 hover:text-emerald-400 text-sm font-medium transition-colors">Sign In</Link>
            <Link to="/register" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-lg transition-all glow-emerald-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center hero-bg pt-16 overflow-hidden">
        <ParticleBackground count={14} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/30 text-emerald-400 text-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-green" />
            AI-Powered Climate Tech Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight mb-6"
          >
            Track Your Carbon Footprint.
            <br />
            <span className="gradient-text text-glow">Build a Greener Future.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Measure your environmental impact, receive AI-powered insights, complete eco challenges,
            and join 145,000+ climate warriors building a sustainable world.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl transition-all duration-200 glow-emerald"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/calculator"
              className="flex items-center justify-center gap-2 px-8 py-4 glass border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 font-bold text-lg rounded-xl transition-all duration-200"
            >
              Calculate Footprint
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500"
          >
            <div className="flex -space-x-2">
              {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-black" style={{ backgroundColor: c }}>
                  {['S', 'M', 'P', 'J'][i]}
                </div>
              ))}
            </div>
            <span>Joined by <span className="text-emerald-400 font-semibold">145,000+</span> eco warriors</span>
          </motion.div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030712] to-transparent" />
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="py-16 border-y border-emerald-900/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="text-center"
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-black text-white gradient-text">{s.value}</div>
                <div className="text-gray-400 text-sm mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              POWERFUL FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Everything You Need to Go Green
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From precise carbon calculations to AI-powered coaching — EcoTrack AI gives you
              all the tools to understand and reduce your environmental impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i}
                className="glass rounded-2xl p-6 card-hover"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${f.color}20` }}>
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="py-24 bg-emerald-950/10">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Start in Minutes. Impact for Life.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i}
                className="relative"
              >
                <div className="glass rounded-2xl p-6 h-full card-hover">
                  <div className="text-4xl font-black gradient-text mb-4">{step.num}</div>
                  <h3 className="text-white font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 text-emerald-600 text-xl">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Loved by Eco Warriors</h2>
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              <span className="text-gray-400 text-sm ml-2">4.8/5 from 2,400+ reviews</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i}
                className="glass rounded-2xl p-6 card-hover"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-black font-bold text-sm" style={{ backgroundColor: t.avatar }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Ready to Build a <span className="gradient-text">Greener Future?</span>
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Join 145,000+ people who are measuring, reducing, and celebrating their environmental progress.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl transition-all glow-emerald"
            >
              Start Free Today <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              {['No credit card required', 'Free forever plan', 'Cancel anytime'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-emerald-900/20 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="font-bold gradient-text">EcoTrack AI</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 EcoTrack AI. Built for a sustainable future 🌍</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
