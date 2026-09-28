import { Rocket, Globe, Feather } from 'lucide-react'

export const APP_ICONS: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  wordpress: Globe,
  typecho: Feather,
}

export { Rocket }
