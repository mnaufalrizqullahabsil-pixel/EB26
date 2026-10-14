// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://dlzfugiolifzdxqnnatp.supabase.co wss://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
};

// https://astro.build/config
export default defineConfig({
  vite: {
    envPrefix: ['PUBLIC_', 'SUPABASE_', 'NEXT_PUBLIC_'],
    plugins: [tailwindcss()],
    server: {
      headers: securityHeaders
    },
    preview: {
      headers: securityHeaders
    }
  },
});
