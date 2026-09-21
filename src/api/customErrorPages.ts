import { apiFetch } from './client'

export interface ErrorTemplate {
  error_code: string
  title: string
  content: string
  updated_at?: number
}

export interface ErrorPageConfig {
  templates: Record<string, ErrorTemplate>
}

export interface ErrorTemplateInput {
  error_code: string
  title: string
  content: string
}

export const customErrorPagesApi = {
  config() {
    return apiFetch<ErrorPageConfig>('/custom-error-pages/config')
  },

  saveTemplate(input: ErrorTemplateInput) {
    return apiFetch<ErrorTemplate>('/custom-error-pages/template', {
      method: 'POST',
      body: input,
    })
  },

  resetTemplate(errorCode: string) {
    return apiFetch<ErrorTemplate>('/custom-error-pages/reset-template', {
      method: 'POST',
      body: { error_code: errorCode },
    })
  },
}
