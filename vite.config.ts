import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const LAZY_LOCALE = 'en'
const LAZY_LOCALE_MODULE = 'src/i18n/locales/en/index.ts'
const UI_STORAGE_KEY = 'gojs-ui'

function lazyLocalePreload(): Plugin {
  let base = '/'
  return {
    name: 'gojs-lazy-locale-preload',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html
        const chunk = Object.values(bundle).find(
          (item) =>
            item.type === 'chunk' &&
            item.moduleIds.some((id) => id.split('\\').join('/').includes(LAZY_LOCALE_MODULE)),
        )
        if (!chunk) return html
        const prefix = base.endsWith('/') ? base.slice(0, -1) : base
        const children = [
          '(function(){',
          'try{',
          "var stored=null;",
          "var raw=localStorage.getItem('" + UI_STORAGE_KEY + "');",
          'if(raw){stored=JSON.parse(raw).state.language;}',
          "if(stored!=='zh'&&stored!=='en'){",
          "var nav=(navigator.language||'').toLowerCase();",
          "stored=nav.indexOf('zh')===0?'zh':'en';",
          '}',
          "if(stored!=='" + LAZY_LOCALE + "'){return;}",
          "var link=document.createElement('link');",
          "link.rel='modulepreload';",
          "link.href='" + prefix + '/' + chunk.fileName + "';",
          'document.head.appendChild(link);',
          '}catch(e){}',
          '})();',
        ].join('')
        return {
          html,
          tags: [{ tag: 'script', children, injectTo: 'head' }],
        }
      },
    },
  }
}

export default defineConfig({
  base: '/gojs/',
  plugins: [react(), lazyLocalePreload()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/gojs/api/': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('node_modules/@xterm')) return 'xterm'
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'charts'
          }
          if (id.includes('node_modules/@tanstack')) return 'query'
          if (id.includes('node_modules/lucide-react')) return 'icons'
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/@remix-run/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor'
          }
          return undefined
        },
      },
    },
  },
})
