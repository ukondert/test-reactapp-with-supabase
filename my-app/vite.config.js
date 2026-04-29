import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load .env values explicitly so the dev proxy can use the same Supabase URL as the app.
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl = env.VITE_SUPABASE_URL;
  let validSupabaseUrl = false;

  if (supabaseUrl) {
    try {
      // Only enable the proxy when the configured URL can be parsed as a valid HTTP(S) target.
      const parsedUrl = new URL(supabaseUrl);
      validSupabaseUrl = parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
    } catch {
      validSupabaseUrl = false;
    }
  }

  if (supabaseUrl && !validSupabaseUrl) {
    console.warn('VITE_SUPABASE_URL is invalid. Proxy /api/v1/health and /api/v1/aggregate are disabled.');
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@shared/ui': path.resolve(__dirname, '../shared/ui/src'),
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
      extensions: ['.web.jsx', '.web.js', '.jsx', '.js', '.json'],
    },
    server: {
      port: 3000,
      proxy: validSupabaseUrl
        ? {
            // Expose a stable app-internal REST route and forward it to Supabase Auth health.
            '/api/v1/health': {
              target: supabaseUrl,
              changeOrigin: true,
              // The frontend calls /api/v1/health, but Supabase exposes the actual check at /auth/v1/health.
              rewrite: () => '/auth/v1/health',
            },
            // Use an Edge Function for aggregate command execution.
            '/api/v1/aggregate': {
              target: supabaseUrl,
              changeOrigin: true,
              rewrite: () => '/functions/v1/library-aggregate',
            },
          }
        : undefined,
    },
    build: {
      outDir: 'dist',
    },
  };
});