import { ChevronRight } from 'lucide-react'

interface RestoreItemProps {
  icon: React.ReactNode
  label: string
  detail: string
}

export function RestoreItem({ icon, label, detail }: RestoreItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-fg-muted">{icon}</span>
      <span className="text-fg">{label}</span>
      <ChevronRight size={11} className="text-fg-subtle" />
      <span className="text-fg-muted break-all">{detail}</span>
    </div>
  )
}
