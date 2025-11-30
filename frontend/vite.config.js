import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load env variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    // Base public path when served in production
    base: '/',
    // Development server configuration
    server: {
      port: 3000,
      strictPort: true,
      // Proxy API requests in development
      proxy: {
        '^/api': {
          target: env.VITE_API_BASE_URL_LOCAL || 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
        },
      },
    },
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    // Environment variables to expose to the client
    define: {
      'process.env': {}
    },
  };
});
