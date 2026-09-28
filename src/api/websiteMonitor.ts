import { apiFetch } from './client'

export interface WebsiteMonitorTarget {
  id: string
  name: string
  url: string
  enabled: boolean
  timeout: number
  notifications: boolean
}

export interface WebsiteMonitorConfig {
  websites: WebsiteMonitorTarget[]
  check_interval: number
}

export interface WebsiteMonitorHistoryEntry {
  website_id: string
  url: string
  timestamp: number
  status: string
  response_time: number
  status_code: number
  error: string | null
  content_size: number
}

export interface WebsiteMonitorNotification {
  id: string
  website_id: string
  website_name: string
  url: string
  status: string
  status_code: number
  response_time: number
  error: string | null
  timestamp: number
  sent: boolean
  acknowledged?: boolean
  acknowledged_at?: number
}

export interface WebsiteMonitorAckResult {
  message: string
}

export const websiteMonitorApi = {
  config() {
    return apiFetch<WebsiteMonitorConfig>('/website-monitor/config')
  },

  updateConfig(config: WebsiteMonitorConfig) {
    return apiFetch<WebsiteMonitorConfig>('/website-monitor/config', {
      method: 'POST',
      body: config,
    })
  },

  history() {
    return apiFetch<WebsiteMonitorHistoryEntry[]>('/website-monitor/history')
  },

  notifications() {
    return apiFetch<WebsiteMonitorNotification[]>('/website-monitor/notifications')
  },

  runCheck() {
    return apiFetch<WebsiteMonitorAckResult>('/website-monitor/run-check', { method: 'POST' })
  },

  clearNotifications() {
    return apiFetch<WebsiteMonitorAckResult>('/website-monitor/clear-notifications', {
      method: 'POST',
    })
  },

  acknowledgeNotification(id: string) {
    return apiFetch<WebsiteMonitorAckResult>(`/website-monitor/notifications/${id}`, {
      method: 'PATCH',
    })
  },
}
