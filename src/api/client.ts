const API_BASE = '/gojs/api'

export type ApiResponseType = 'json' | 'text' | 'blob'

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  signal?: AbortSignal
  params?: Record<string, string | number | boolean | null | undefined>
  responseType?: ApiResponseType
}

function isPassThroughBody(value: unknown): value is Blob | ArrayBuffer | FormData {
  return value instanceof FormData || value instanceof Blob || value instanceof ArrayBuffer
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function readErrorFields(error: unknown): { code?: string; message?: string } {
  if (typeof error === 'string') {
    return { code: error, message: error }
  }
  const record = readRecord(error)
  if (!record) {
    return {}
  }
  return {
    code: typeof record.code === 'string' ? record.code : undefined,
    message: typeof record.message === 'string' ? record.message : undefined,
  }
}

function readRetryAfter(value: unknown): number | undefined {
  const record = readRecord(value)
  if (!record) return undefined
  const retry = record.retryAfter ?? record.retry_after
  return typeof retry === 'number' && Number.isFinite(retry) ? retry : undefined
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const method = options.method || 'GET'
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers || {}),
  }

  let body: BodyInit | undefined
  if (options.body !== undefined) {
    if (isPassThroughBody(options.body)) {
      body = options.body
    } else {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json'
      body = JSON.stringify(options.body)
    }
  }

  let url = path.startsWith('http') ? path : `${API_BASE}/${path.replace(/^\//, '')}`
  if (options.params) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(options.params)) {
      if (v !== undefined && v !== null) qs.append(k, String(v))
    }
    const query = qs.toString()
    if (query) url += (url.includes('?') ? '&' : '?') + query
  }

  const csrf = getCsrfToken()
  if (csrf) {
    headers['X-CSRF-Token'] = csrf
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    credentials: 'include',
    signal: options.signal,
  })

  if (!res.ok) {
    const text = await res.text()
    let errBody: unknown = null
    try {
      errBody = text ? JSON.parse(text) : null
    } catch {
      errBody = null
    }
    throw buildApiError(res.status, errBody, res.statusText)
  }

  const responseType = options.responseType || 'json'

  if (responseType === 'blob') {
    return (await res.blob()) as unknown as T
  }
  if (responseType === 'text') {
    return (await res.text()) as unknown as T
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return undefined as unknown as T
  }

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    return undefined as unknown as T
  }

  const envelope = readRecord(data)
  if (envelope) {
    if (envelope.ok === false) {
      const fields = readErrorFields(envelope.error)
      throw buildApiError(
        res.status,
        envelope.error,
        fields.message || res.statusText || 'Request failed',
        fields.code,
      )
    }
    if (envelope.ok === true && 'data' in envelope) {
      const payload = envelope.data
      const payloadRecord = readRecord(payload)
      if (payloadRecord && payloadRecord.status === 'approval_pending') {
        throw new ApprovalPendingError(
          (payloadRecord.approval as ApprovalPendingPayload) ?? (payload as ApprovalPendingPayload),
        )
      }
      return payload as T
    }
  }
  return data as T
}

function buildApiError(
  status: number,
  errBody: unknown,
  fallbackMessage: string,
  fallbackCode?: string,
): ApiError {
  const container = readRecord(errBody)
  const nestedError = container ? container.error : undefined
  const raw: unknown = nestedError ? nestedError : errBody
  const rawRecord = readRecord(raw)
  const fields = readErrorFields(raw)
  const code =
    (rawRecord && (fields.code || fallbackCode)) ||
    fallbackCode ||
    httpErrorCode(status)
  const message =
    (rawRecord && fields.message) ||
    (typeof raw === 'string' ? raw : undefined) ||
    fallbackMessage ||
    `HTTP ${status}`
  const retryAfter = readRetryAfter(raw)
  return new ApiError(code, message, status, { ...(rawRecord ?? {}), retryAfter })
}

function httpErrorCode(status: number): string {
  switch (status) {
    case 400:
      return 'bad_request'
    case 401:
      return 'unauthorized'
    case 403:
      return 'forbidden'
    case 404:
      return 'not_found'
    case 409:
      return 'conflict'
    case 422:
      return 'validation_error'
    case 429:
      return 'rate_limited'
    default:
      return status >= 500 ? 'server_error' : `http_${status}`
  }
}

export function getCsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null
  if (meta?.content) return meta.content
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export function setCsrfToken(token: string): void {
  if (typeof document === 'undefined') return
  if (!token) return

  let meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'csrf-token')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', token)

  const oneYear = 60 * 60 * 24 * 365
  document.cookie = `csrf_token=${encodeURIComponent(token)}; path=/; max-age=${oneYear}; SameSite=Lax`
}

export function clearCsrfToken(): void {
  if (typeof document === 'undefined') return
  const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null
  if (meta) meta.setAttribute('content', '')
  document.cookie = 'csrf_token=; path=/; max-age=0; SameSite=Lax'
}

export interface ApprovalPendingPayload {
  id: string
  action?: string
  api?: string
  status?: string
  expires_at?: number
  requester?: string
  created_at?: number
}

export class ApprovalPendingError extends Error {
  name = 'ApprovalPendingError'
  approval: ApprovalPendingPayload

  constructor(approval: ApprovalPendingPayload) {
    super('approval_pending')
    this.approval = approval
  }
}

export function isApprovalPending(err: unknown): err is ApprovalPendingError {
  return err instanceof ApprovalPendingError
}

export class ApiError extends Error {
  code: string
  status?: number
  retryAfter?: number
  payload?: unknown

  constructor(
    code: string | number,
    message: string,
    status?: number,
    payload?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    if (typeof code === 'number') {
      this.status = code
      this.code = httpErrorCode(code)
      this.payload = payload
    } else {
      this.code = code
      this.status = status
      this.payload = payload
    }
    this.retryAfter = readRetryAfter(payload)
  }
}