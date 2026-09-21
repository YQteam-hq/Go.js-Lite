import type { ComponentType, LazyExoticComponent } from 'react'
import type { TranslationKey } from '@/core'

export type VariantName = 'panel' | 'apache' | 'ssh' | 'docker'

export interface VariantRouteEntry {
  path: string
  component: LazyExoticComponent<ComponentType>
}

export interface VariantManifest {
  name: VariantName
  labelKey: TranslationKey
  accent: string
  routes: VariantRouteEntry[]
}
