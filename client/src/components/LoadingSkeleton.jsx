import { motion } from 'framer-motion'

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      <div className="skeleton h-3 w-24 mb-3 rounded-full" />
      <div className="skeleton h-7 w-20 mb-2 rounded-lg" />
      <div className="skeleton h-3 w-32 rounded-full" />
    </div>
  )
}

export function SkeletonPage() {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
      {/* Welcome banner skeleton */}
      <div className="skeleton h-24 rounded-2xl" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => <SkeletonCard key={i} />)}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 skeleton h-72 rounded-2xl"/>
        <div className="skeleton h-72 rounded-2xl"/>
      </div>

      {/* Bottom grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 skeleton h-64 rounded-2xl"/>
        <div className="space-y-4">
          <div className="skeleton h-28 rounded-2xl"/>
          <div className="skeleton h-32 rounded-2xl"/>
          <div className="skeleton h-24 rounded-2xl"/>
        </div>
      </div>
    </motion.div>
  )
}

export function SkeletonList({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_,i) => (
        <div key={i} className="flex items-center gap-3 p-3 glass rounded-xl">
          <div className="skeleton w-9 h-9 rounded-xl shrink-0"/>
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-3/4 rounded-full"/>
            <div className="skeleton h-3 w-1/2 rounded-full"/>
          </div>
          <div className="skeleton h-4 w-12 rounded-full"/>
        </div>
      ))}
    </div>
  )
}
