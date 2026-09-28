import { describe, expect, it } from 'vitest';
import { activeVariant, resolveVariantName, variantManifests } from '@/variants/registry';

describe('variant registry', () => {
  it('declares a manifest for each supported variant', () => {
    expect(Object.keys(variantManifests).sort()).toEqual(['apache', 'docker', 'panel', 'ssh']);
  });

  it('resolves a known variant name', () => {
    expect(resolveVariantName('panel')).toBe('panel');
    expect(resolveVariantName('apache')).toBe('apache');
    expect(resolveVariantName('ssh')).toBe('ssh');
    expect(resolveVariantName('docker')).toBe('docker');
  });

  it('falls back to the panel variant for unknown values', () => {
    expect(resolveVariantName(undefined)).toBe('panel');
    expect(resolveVariantName(null)).toBe('panel');
    expect(resolveVariantName('')).toBe('panel');
    expect(resolveVariantName('nginx')).toBe('panel');
    expect(resolveVariantName(42)).toBe('panel');
  });

  it('resolves the active variant to a manifest that agrees with its key', () => {
    expect(variantManifests[activeVariant].name).toBe(activeVariant);
  });

  it('keeps every manifest route path unique', () => {
    for (const manifest of Object.values(variantManifests)) {
      const paths = manifest.routes.map(route => route.path);
      expect(new Set(paths).size).toBe(paths.length);
    }
  });
});
