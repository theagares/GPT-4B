import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 네트워크 접속 허용
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // 연결 실패 시 더 명확한 에러 메시지
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.error('프록시 에러:', err);
            if (res && !res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'text/plain',
              });
              res.end('백엔드 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.');
            }
          });
        }
      }
    }
  }
})

