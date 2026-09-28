import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export function ScanCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Skeleton variant="text" width={140} height={18} />
          <div className="flex items-center gap-2">
            <Skeleton variant="text" width={80} height={12} />
            <Skeleton variant="rectangular" width={90} height={32} className="rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-2 mb-5">
          <Skeleton variant="text" width="100%" height={20} />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width={70} height={22} className="rounded-full" />
            <Skeleton variant="rectangular" width={70} height={22} className="rounded-full" />
            <Skeleton variant="rectangular" width={70} height={22} className="rounded-full" />
            <Skeleton variant="rectangular" width={70} height={22} className="rounded-full" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Skeleton variant="text" width="100%" height={36} />
          <Skeleton variant="text" width="100%" height={36} />
          <Skeleton variant="text" width="100%" height={36} />
          <Skeleton variant="text" width="100%" height={36} />
        </div>
      </CardBody>
    </Card>
  )
}
