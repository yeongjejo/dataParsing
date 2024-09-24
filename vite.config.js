import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['electron'], // Electron은 외부 모듈로 설정
    },
  },

  server: {
    proxy: {
      // API 서버의 URL을 설정합니다.
      '/ws': {
        target: 'http://localhost:8084', // API 서버 주소
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/ws/, ''), // 필요시 경로를 변경합니다.
        secure: false,
      },
    },
  },
  
  
})
