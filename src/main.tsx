import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { Toaster } from '@/components/ui/Toast'
import { registerServiceWorker } from '@/lib/pwa'
import { resolveLocale } from '@/i18n'
import { useUiStore } from '@/stores/uiStore'
import { readPersistedLanguage } from '@/lib/storage'
import '@/styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof Response) {
          return failureCount < 2 && error.status >= 500
        }
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

async function start() {
  const requested = readPersistedLanguage()
  const active = await resolveLocale(requested)
  if (active !== requested) {
    await useUiStore.getState().setLanguage(active)
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  )
}

void start()

if (import.meta.env.PROD) {
  void registerServiceWorker()
}
