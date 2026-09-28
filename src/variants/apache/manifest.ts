import { lazy } from 'react'
import type { VariantManifest } from '@/variants/types'

const Apache = lazy(() => import('./Apache'))

export const apacheManifest: VariantManifest = {
  name: 'apache',
  labelKey: 'variants.apache',
  accent: 'orange',
  routes: [
    {
      path: 'apache/*',
      component: Apache,
    },
  ],
}
