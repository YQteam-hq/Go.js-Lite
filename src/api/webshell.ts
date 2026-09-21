import { apiFetch } from './client'

export interface ShellHistoryEntry {
  id: string
  command: string
  output: string
  success: boolean
  timestamp: number
}

export interface ShellExecuteResult {
  output: string
  success: boolean
  history_id: string
}

export interface ShellClearResult {
  success: boolean
  message?: string
}

export const webshellApi = {
  history() {
    return apiFetch<ShellHistoryEntry[]>('/webshell/history')
  },

  execute(command: string) {
    return apiFetch<ShellExecuteResult>('/webshell/execute', {
      method: 'POST',
      body: { command },
    })
  },

  clearHistory() {
    return apiFetch<ShellClearResult>('/webshell/clear-history', { method: 'POST' })
  },

  autocomplete(input: string) {
    return apiFetch<string[]>('/webshell/autocomplete', { params: { input } })
  },
}
