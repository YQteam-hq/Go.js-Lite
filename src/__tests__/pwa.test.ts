import { afterEach, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  getPushSupport,
  getServiceWorkerContainer,
  isSecureContextAvailable,
  registerServiceWorker,
  requestPushPermission,
  serviceWorkerUrl,
  subscribeToPush,
  urlBase64ToUint8Array,
} from '@/lib/pwa';

interface BrowserOptions {
  notification?: boolean;
  permission?: string;
  serviceWorker?: unknown;
  pushManager?: boolean;
}

function installBrowser(options: BrowserOptions = {}): void {
  const win = window as unknown as Record<string, unknown>;
  if (options.notification === false) {
    delete win.Notification;
  } else {
    win.Notification = {
      permission: options.permission ?? 'granted',
      requestPermission: vi.fn(async () => options.permission ?? 'granted'),
    };
  }
  Object.defineProperty(navigator, 'serviceWorker', {
    value: options.serviceWorker,
    configurable: true,
    writable: true,
  });
  if (options.pushManager) win.PushManager = function PushManager() {};
  else delete win.PushManager;
}

afterEach(() => {
  const win = window as unknown as Record<string, unknown>;
  delete win.Notification;
  delete win.PushManager;
  Object.defineProperty(navigator, 'serviceWorker', {
    value: undefined,
    configurable: true,
    writable: true,
  });
});

describe('capability detection', () => {
  it('reports unsupported when notifications are missing', () => {
    installBrowser({ notification: false });
    const support = getPushSupport();
    expect(support.supported).toBe(false);
    expect(support.reason).toBe('unsupported');
    expect(support.permission).toBe('unsupported');
  });

  it('reports unsupported when the service worker is missing', () => {
    installBrowser({ permission: 'default' });
    const support = getPushSupport();
    expect(support.supported).toBe(false);
    expect(support.reason).toBe('no_service_worker');
    expect(support.permission).toBe('default');
    expect(getServiceWorkerContainer()).toBeNull();
  });

  it('reports unsupported when the push manager is missing', () => {
    installBrowser({ serviceWorker: {} });
    expect(getPushSupport().reason).toBe('no_push_manager');
  });

  it('reports supported when every api is present', () => {
    installBrowser({ serviceWorker: {}, pushManager: true, permission: 'granted' });
    const support = getPushSupport();
    expect(support.supported).toBe(true);
    expect(support.permission).toBe('granted');
  });

  it('treats localhost as a secure context', () => {
    expect(isSecureContextAvailable()).toBe(true);
  });

  it('builds the service worker url from the base path', () => {
    expect(serviceWorkerUrl('/gojs/')).toBe('/gojs/sw.js');
    expect(serviceWorkerUrl('/gojs')).toBe('/gojs/sw.js');
  });
});

describe('registration', () => {
  it('skips registration without a service worker container', async () => {
    installBrowser({});
    const result = await registerServiceWorker();
    expect(result.registration).toBeNull();
    expect(result.reason).toBe('no_service_worker');
  });

  it('returns the registration on success', async () => {
    const registration = { scope: '/gojs/' };
    installBrowser({ serviceWorker: { register: vi.fn(async () => registration) } });
    const result = await registerServiceWorker('/gojs/sw.js');
    expect(result.registration).toBe(registration);
  });

  it('reports a failure instead of throwing', async () => {
    installBrowser({
      serviceWorker: {
        register: vi.fn(async () => {
          throw new Error('nope');
        }),
      },
    });
    const result = await registerServiceWorker();
    expect(result.registration).toBeNull();
    expect(result.reason).toBe('unsupported');
  });
});

describe('permission', () => {
  it('returns unsupported without the notification api', async () => {
    installBrowser({ notification: false });
    expect(await requestPushPermission()).toBe('unsupported');
  });

  it('reuses an already decided permission', async () => {
    installBrowser({ permission: 'denied' });
    expect(await requestPushPermission()).toBe('denied');
  });

  it('asks when the permission is still open', async () => {
    installBrowser({ permission: 'default' });
    expect(await requestPushPermission()).toBe('default');
  });
});

describe('subscribeToPush', () => {
  it('reports the missing server key', async () => {
    installBrowser({ serviceWorker: {}, pushManager: true });
    const result = await subscribeToPush();
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('no_application_server_key');
  });

  it('reports the unsupported browser before anything else', async () => {
    installBrowser({ notification: false });
    const result = await subscribeToPush('AAAAAAAAAAB');
    expect(result.reason).toBe('unsupported');
  });

  it('stops when the permission is denied', async () => {
    installBrowser({ serviceWorker: {}, pushManager: true, permission: 'denied' });
    const result = await subscribeToPush('AAAAAAAAAAB');
    expect(result.reason).toBe('permission_denied');
  });

  it('creates a subscription', async () => {
    const subscription = { endpoint: 'https://push.test/1' };
    const subscribe = vi.fn(async () => subscription);
    const register = vi.fn(async () => ({
      pushManager: { getSubscription: vi.fn(async () => null), subscribe },
    }));
    installBrowser({ serviceWorker: { register }, pushManager: true });

    const result = await subscribeToPush('AAAAAAAAAAB');
    expect(result.ok).toBe(true);
    expect(result.subscription).toBe(subscription);
    expect(subscribe).toHaveBeenCalledTimes(1);
  });

  it('reuses an existing subscription', async () => {
    const subscription = { endpoint: 'https://push.test/existing' };
    const subscribe = vi.fn();
    const register = vi.fn(async () => ({
      pushManager: { getSubscription: vi.fn(async () => subscription), subscribe },
    }));
    installBrowser({ serviceWorker: { register }, pushManager: true });

    const result = await subscribeToPush('AAAAAAAAAAB');
    expect(result.ok).toBe(true);
    expect(result.subscription).toBe(subscription);
    expect(subscribe).not.toHaveBeenCalled();
  });

  it('reports a failed subscription instead of throwing', async () => {
    const register = vi.fn(async () => {
      throw new Error('boom');
    });
    installBrowser({ serviceWorker: { register }, pushManager: true });
    const result = await subscribeToPush('AAAAAAAAAAB');
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('subscribe_failed');
  });
});

describe('urlBase64ToUint8Array', () => {
  it('decodes base64 and base64url input', () => {
    expect(Array.from(urlBase64ToUint8Array('AAAA'))).toEqual([0, 0, 0]);
    expect(urlBase64ToUint8Array('AAAAAAAAAAB').length).toBe(8);
    expect(Array.from(urlBase64ToUint8Array('-_-_'))).toEqual(
      Array.from(urlBase64ToUint8Array('+/+/')),
    );
  });
});

describe('service worker shell', () => {
  const swSource = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');

  it('ships the offline fallback page next to the worker', () => {
    expect(existsSync(resolve(process.cwd(), 'public/offline.html'))).toBe(true);
  });

  it('points the offline fallback at the offline page', () => {
    expect(swSource).toContain("const OFFLINE_URL = './offline.html';");
  });

  it('precaches the offline fallback page in the shell', () => {
    // A cold offline navigation falls back to OFFLINE_URL, so the page has to
    // be part of the install-time shell instead of the plain-text reply.
    const shellLine = swSource.split('\n').find((line) => line.startsWith('const SHELL_ASSETS'));
    expect(shellLine).toBeDefined();
    expect(shellLine).toContain('OFFLINE_URL');
  });

  it('precaches only files that exist next to the worker', () => {
    // cache.addAll rejects the whole install when a single entry 404s, so
    // every shell asset has to resolve to a real file in public/.
    const shellLine = swSource.split('\n').find((line) => line.startsWith('const SHELL_ASSETS'));
    const offlineMatch = swSource.match(/const OFFLINE_URL = '([^']+)'/);
    const entries = shellLine?.match(/'(?:[^']*)'/g) ?? [];
    const assets = entries.map((entry) => entry.slice(1, -1));
    // OFFLINE_URL is referenced by name inside the shell list.
    if (offlineMatch) assets.push(offlineMatch[1]);
    expect(assets.length).toBeGreaterThan(0);
    for (const asset of assets) {
      const path = asset.replace(/^\.\//, '');
      // './' and './index.html' are the document at the project root; every
      // other entry is copied from public/.
      const file = path === '' || path === 'index.html' ? 'index.html' : resolve('public', path);
      expect(existsSync(resolve(process.cwd(), file))).toBe(true);
    }
  });
});
