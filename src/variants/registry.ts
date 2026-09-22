import { apacheManifest } from '@/variants/apache/manifest'
import { dockerManifest } from '@/variants/docker/manifest'
import { panelManifest } from '@/variants/panel/manifest'
import { sshManifest } from '@/variants/ssh/manifest'
import type { VariantManifest, VariantName } from '@/variants/types'

export const variantManifests: Record<VariantName, VariantManifest> = {
  panel: panelManifest,
  apache: apacheManifest,
  ssh: sshManifest,
  docker: dockerManifest,
}

export function resolveVariantName(value: unknown): VariantName {
  return typeof value === 'string' && value in variantManifests ? (value as VariantName) : 'panel'
}

export const activeVariant: VariantName = resolveVariantName(import.meta.env.VITE_VARIANT)
