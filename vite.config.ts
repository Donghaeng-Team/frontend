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
        // API Gateway로 모든 API 요청 프록시
        '/': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          // API 요청만 프록시 (정적 파일은 제외)
          bypass(req) {
            if (req.headers.accept?.includes('html')) {
              return req.url;
            }
          }
        }
      }
    }
  }
})