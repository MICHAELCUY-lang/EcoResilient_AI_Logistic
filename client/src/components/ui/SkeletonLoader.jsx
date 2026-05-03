export default function SkeletonLoader({ rows = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-100 rounded-lg animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-100 rounded-xl animate-pulse" />
      </div>
      <div className="h-7 w-20 bg-gray-100 rounded animate-pulse" />
    </div>
  )
}

export function TableSkeleton({ cols = 5, rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  )
}
