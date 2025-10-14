// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      hmr: true,  // HMR 활성화 (기본값)
      watch: {
        usePolling: true  // WSL이나 Docker 사용 시
      },
      proxy: {
        // Division API (Port 8080)
        '/api/v1/division': {
          target: env.VITE_DIVISION_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false
        },
        '/internal/v1/division': {
          target: env.VITE_DIVISION_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false
        },
        // Market API (Port 8082)
        '/api/v1/market': {
          target: env.VITE_MARKET_API_URL || 'http://localhost:8082',
          changeOrigin: true,
          secure: false
        },
        '/internal/v1/market': {
          target: env.VITE_MARKET_API_URL || 'http://localhost:8082',
          changeOrigin: true,
          secure: false
        },
        '/api/v1/cart': {
          target: env.VITE_MARKET_API_URL || 'http://localhost:8082',
          changeOrigin: true,
          secure: false
        },
        // User API (Port 8083)
        '/api/v1/user': {
          target: env.VITE_USER_API_URL || 'http://localhost:8083',
          changeOrigin: true,
          secure: false
        },
        '/internal/v1/user': {
          target: env.VITE_USER_API_URL || 'http://localhost:8083',
          changeOrigin: true,
          secure: false
        },
        // Community API (Port 8085)
        '/api/v1/post': {
          target: env.VITE_COMMUNITY_API_URL || 'http://localhost:8085',
          changeOrigin: true,
          secure: false
        },
        '/api/v1/comment': {
          target: env.VITE_COMMUNITY_API_URL || 'http://localhost:8085',
          changeOrigin: true,
          secure: false
        },
        '/api/v1/image': {
          target: env.VITE_COMMUNITY_API_URL || 'http://localhost:8085',
          changeOrigin: true,
          secure: false
        },
        // Chat API (Port 8086)
        '/api/v1/chat': {
          target: env.VITE_CHAT_API_URL || 'http://localhost:8086',
          changeOrigin: true,
          secure: false
        },
        '/internal/v1/chat': {
          target: env.VITE_CHAT_API_URL || 'http://localhost:8086',
          changeOrigin: true,
          secure: false
        }
        // Notification API - 포트 미정
        // '/api/v1/notification': {
        //   target: env.VITE_NOTIFICATION_API_URL || 'http://localhost:8087',
        //   changeOrigin: true,
        //   secure: false
        // }
      }
    }
  }
})