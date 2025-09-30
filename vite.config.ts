// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true,  // HMR 활성화 (기본값)
    watch: {
      usePolling: true  // WSL이나 Docker 사용 시
    }
  }
})