import { Skeleton } from '@/components/ui/Skeleton'

export function DirectorySkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={14} height={14} />
            <Skeleton variant="text" className="flex-1" />
            <Skeleton variant="text" className="w-16 h-4" />
          </div>
          <Skeleton variant="rectangular" height={6} className="w-full" />
        </div>
      ))}
    </div>
  )
}
