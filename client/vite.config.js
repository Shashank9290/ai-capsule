import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During local development, the Vite dev server proxies /api requests to
// the Express backend running on port 5000, so cookies and requests behave
// the same way as they will in the combined production deployment.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
