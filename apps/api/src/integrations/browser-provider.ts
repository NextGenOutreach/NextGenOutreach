/**
 * Provider-agnostic browser profile interface.
 * Supports GoLogin, BitBrowser, and AdsPower.
 * Switch providers via the BROWSER_PROVIDER env var — no code changes needed.
 */

export interface BrowserProfileCreateParams {
  name: string;
  proxyHost?: string;
  proxyPort?: number;
  proxyUsername?: string;
  proxyPassword?: string;
  notes?: string;
}

export interface BrowserProfileResult {
  externalProfileId: string;
  provider: 'gologin' | 'bitbrowser' | 'adspower';
  raw: Record<string, unknown>;
}

export interface BrowserHealthResult {
  externalProfileId: string;
  status: 'idle' | 'active' | 'error';
  lastActive?: string;
  raw: Record<string, unknown>;
}

export interface BrowserLaunchResult {
  wsEndpoint?: string;
  cdpUrl?: string;
  launchToken?: string;
  raw: Record<string, unknown>;
}

// ─── GoLogin ───────────────────────────────────────────────────────────────────

async function goLoginCreate(params: BrowserProfileCreateParams): Promise<BrowserProfileResult> {
  const token = process.env.GOLOGIN_API_TOKEN;
  if (!token) throw new Error('GOLOGIN_API_TOKEN not set');

  const body: Record<string, unknown> = {
    name: params.name,
    notes: params.notes ?? '',
    os: 'lin',
  };

  if (params.proxyHost) {
    body.proxy = {
      mode: 'http',
      host: params.proxyHost,
      port: params.proxyPort ?? 3128,
      username: params.proxyUsername ?? '',
      password: params.proxyPassword ?? '',
    };
  }

  const res = await fetch('https://api.gologin.com/browser', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`GoLogin create failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as Record<string, unknown>;

  return { externalProfileId: data.id as string, provider: 'gologin', raw: data };
}

async function goLoginHealth(externalProfileId: string): Promise<BrowserHealthResult> {
  const token = process.env.GOLOGIN_API_TOKEN;
  if (!token) throw new Error('GOLOGIN_API_TOKEN not set');

  const res = await fetch(`https://api.gologin.com/browser/${externalProfileId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`GoLogin health failed: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;

  return {
    externalProfileId,
    status: (data.status as string) === 'running' ? 'active' : 'idle',
    lastActive: data.lastModifiedAt as string | undefined,
    raw: data,
  };
}

async function goLoginLaunch(externalProfileId: string): Promise<BrowserLaunchResult> {
  const token = process.env.GOLOGIN_API_TOKEN;
  if (!token) throw new Error('GOLOGIN_API_TOKEN not set');

  const res = await fetch(`https://api.gologin.com/browser/${externalProfileId}/web`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`GoLogin launch failed: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;

  return { wsEndpoint: data.wsUrl as string | undefined, raw: data };
}

async function goLoginDelete(externalProfileId: string): Promise<void> {
  const token = process.env.GOLOGIN_API_TOKEN;
  if (!token) throw new Error('GOLOGIN_API_TOKEN not set');

  await fetch(`https://api.gologin.com/browser/${externalProfileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── BitBrowser ────────────────────────────────────────────────────────────────

async function bitBrowserCreate(params: BrowserProfileCreateParams): Promise<BrowserProfileResult> {
  const apiKey = process.env.BITBROWSER_API_KEY;
  const apiUrl = process.env.BITBROWSER_API_URL ?? 'http://127.0.0.1:54345';
  if (!apiKey) throw new Error('BITBROWSER_API_KEY not set');

  const body: Record<string, unknown> = {
    name: params.name,
    remark: params.notes ?? '',
    browserFingerPrint: { coreVersion: '124' },
  };

  if (params.proxyHost) {
    body.proxyMethod = 2;
    body.proxyType = 'http';
    body.host = params.proxyHost;
    body.port = String(params.proxyPort ?? 3128);
    body.proxyUserName = params.proxyUsername ?? '';
    body.proxyPassword = params.proxyPassword ?? '';
  }

  const res = await fetch(`${apiUrl}/browser/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`BitBrowser create failed: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const profileId = (data.data as Record<string, unknown>)?.id as string;

  return { externalProfileId: profileId, provider: 'bitbrowser', raw: data };
}

async function bitBrowserHealth(externalProfileId: string): Promise<BrowserHealthResult> {
  const apiUrl = process.env.BITBROWSER_API_URL ?? 'http://127.0.0.1:54345';

  const res = await fetch(`${apiUrl}/browser/list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: [externalProfileId] }),
  });

  if (!res.ok) throw new Error(`BitBrowser health failed: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const list = (data.data as Record<string, unknown>)?.list as Record<string, unknown>[] ?? [];
  const profile = list[0] ?? {};

  return {
    externalProfileId,
    status: profile.isRunning ? 'active' : 'idle',
    raw: profile,
  };
}

async function bitBrowserLaunch(externalProfileId: string): Promise<BrowserLaunchResult> {
  const apiUrl = process.env.BITBROWSER_API_URL ?? 'http://127.0.0.1:54345';

  const res = await fetch(`${apiUrl}/browser/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: externalProfileId }),
  });

  if (!res.ok) throw new Error(`BitBrowser launch failed: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const inner = (data.data as Record<string, unknown>) ?? {};

  return { wsEndpoint: inner.ws as string | undefined, cdpUrl: inner.http as string | undefined, raw: data };
}

async function bitBrowserDelete(externalProfileId: string): Promise<void> {
  const apiUrl = process.env.BITBROWSER_API_URL ?? 'http://127.0.0.1:54345';
  await fetch(`${apiUrl}/browser/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: [externalProfileId] }),
  });
}

// ─── AdsPower ──────────────────────────────────────────────────────────────────

async function adsPowerCreate(params: BrowserProfileCreateParams): Promise<BrowserProfileResult> {
  const apiKey = process.env.ADSPOWER_API_KEY;
  const apiUrl = process.env.ADSPOWER_API_URL ?? 'http://127.0.0.1:50325';
  if (!apiKey) throw new Error('ADSPOWER_API_KEY not set');

  const body: Record<string, unknown> = {
    name: params.name,
    remark: params.notes ?? '',
  };

  if (params.proxyHost) {
    body.user_proxy_config = {
      proxy_soft: 'other',
      proxy_type: 'http',
      proxy_host: params.proxyHost,
      proxy_port: String(params.proxyPort ?? 3128),
      proxy_user: params.proxyUsername ?? '',
      proxy_password: params.proxyPassword ?? '',
    };
  }

  const res = await fetch(`${apiUrl}/api/v1/user/create?serial_number=1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`AdsPower create failed: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const profileId = (data.data as Record<string, unknown>)?.id as string;

  return { externalProfileId: profileId, provider: 'adspower', raw: data };
}

async function adsPowerHealth(externalProfileId: string): Promise<BrowserHealthResult> {
  const apiUrl = process.env.ADSPOWER_API_URL ?? 'http://127.0.0.1:50325';

  const res = await fetch(`${apiUrl}/api/v1/browser/active?user_id=${externalProfileId}`);
  if (!res.ok) throw new Error(`AdsPower health failed: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const status = (data.data as Record<string, unknown>)?.status;

  return {
    externalProfileId,
    status: status === 'Active' ? 'active' : 'idle',
    raw: data,
  };
}

async function adsPowerLaunch(externalProfileId: string): Promise<BrowserLaunchResult> {
  const apiUrl = process.env.ADSPOWER_API_URL ?? 'http://127.0.0.1:50325';

  const res = await fetch(
    `${apiUrl}/api/v1/browser/start?user_id=${externalProfileId}&open_tabs=1&ip_tab=0`
  );
  if (!res.ok) throw new Error(`AdsPower launch failed: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const inner = (data.data as Record<string, unknown>) ?? {};

  return {
    wsEndpoint: (inner.ws as Record<string, unknown>)?.puppeteer as string | undefined,
    cdpUrl: (inner.ws as Record<string, unknown>)?.selenium as string | undefined,
    raw: data,
  };
}

async function adsPowerDelete(externalProfileId: string): Promise<void> {
  const apiUrl = process.env.ADSPOWER_API_URL ?? 'http://127.0.0.1:50325';
  await fetch(`${apiUrl}/api/v1/user/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_ids: [externalProfileId] }),
  });
}

// ─── Provider-agnostic facade ──────────────────────────────────────────────────

export type SupportedProvider = 'gologin' | 'bitbrowser' | 'adspower';

function resolveProvider(provider: SupportedProvider) {
  switch (provider) {
    case 'gologin':
      return { create: goLoginCreate, health: goLoginHealth, launch: goLoginLaunch, remove: goLoginDelete };
    case 'bitbrowser':
      return { create: bitBrowserCreate, health: bitBrowserHealth, launch: bitBrowserLaunch, remove: bitBrowserDelete };
    case 'adspower':
      return { create: adsPowerCreate, health: adsPowerHealth, launch: adsPowerLaunch, remove: adsPowerDelete };
    default:
      throw new Error(`Unsupported browser provider: ${provider}`);
  }
}

export const browserProvider = {
  create: (provider: SupportedProvider, params: BrowserProfileCreateParams) =>
    resolveProvider(provider).create(params),

  health: (provider: SupportedProvider, externalProfileId: string) =>
    resolveProvider(provider).health(externalProfileId),

  launch: (provider: SupportedProvider, externalProfileId: string) =>
    resolveProvider(provider).launch(externalProfileId),

  remove: (provider: SupportedProvider, externalProfileId: string) =>
    resolveProvider(provider).remove(externalProfileId),
};
