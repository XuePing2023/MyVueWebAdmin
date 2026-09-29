import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import UnoCSS from 'unocss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), UnoCSS()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      host: 'localhost',
      // 仅在关闭 Mock（VITE_USE_MOCK=false）联调真实后端时生效
      proxy: env.VITE_BASE_API
        ? {
            [env.VITE_BASE_API]: {
              target: env.VITE_API_TARGET || 'http://localhost:8080',
              changeOrigin: true,
            },
          }
        : undefined,
    },
    build: {
      chunkSizeWarningLimit: 1600,
    },
  }
})
