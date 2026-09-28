import { describe, expect, it } from 'vitest';
import { normalizeDeprecations } from '@/lib/deprecations';
import type { DeprecationNotice } from '@shared/types';

const notice: DeprecationNotice = {
  id: 'query_api',
  feature: 'Query-style API endpoint',
  target: 'api.php?api=<action>',
  replacement: '/api/<action>',
  surfaces: ['api.php?api=<action>'],
  deprecatedIn: '0.8.0',
  removeIn: '1.0.0',
  sunsetAt: '2027-06-30T00:00:00Z',
  docs: 'docs/deprecations.md#query_api',
  message: 'The ?api=<action> query form is deprecated.',
  deprecated: true,
};

describe('normalizeDeprecations', () => {
  it('returns an empty list for missing or unusable payloads', () => {
    expect(normalizeDeprecations(undefined)).toEqual([]);
    expect(normalizeDeprecations(null)).toEqual([]);
    expect(normalizeDeprecations('nope')).toEqual([]);
    expect(normalizeDeprecations(0)).toEqual([]);
    expect(normalizeDeprecations([])).toEqual([]);
    expect(normalizeDeprecations({})).toEqual([]);
  });

  it('reads the list form', () => {
    expect(normalizeDeprecations([notice])).toEqual([notice]);
  });

  it('reads the keyed object form the backend emits', () => {
    expect(normalizeDeprecations({ query_api: notice })).toEqual([notice]);
  });

  it('keeps the payload order', () => {
    const second: DeprecationNotice = { ...notice, id: 'legacy_access_token' };
    const result = normalizeDeprecations({ query_api: notice, legacy_access_token: second });
    expect(result.map(entry => entry.id)).toEqual(['query_api', 'legacy_access_token']);
  });

  it('drops entries that are not notices', () => {
    const result = normalizeDeprecations([notice, null, 'text', 7, { id: 'x' }, { id: 1, feature: 'f' }]);
    expect(result).toEqual([notice]);
  });
});
