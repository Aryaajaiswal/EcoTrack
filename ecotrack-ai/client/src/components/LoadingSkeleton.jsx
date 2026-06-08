/** Loading skeleton cards for async data. */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      <div className="skeleton h-3 w-24 mb-3 rounded" />
      <div className="skeleton h-7 w-16 mb-2 rounded" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  )
}

export function SkeletonLine({ width = 'full', height = 4 }) {
  return <div className={`skeleton h-${height} w-${width} rounded`} />
}

export function SkeletonPage() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="skeleton h-10 w-64 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  )
}
