import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    historyApiFallback: true // Enable client-side routing support
  },
  plugins: [
    react(),
    ...(mode === 'development' ? [componentTagger()] : []),
    ...(mode === 'production' && process.env.SENTRY_AUTH_TOKEN ? [sentryVitePlugin({
      org: process.env.SENTRY_ORG || "disclosurely",
      project: process.env.SENTRY_PROJECT || "disclosurely-production",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: "./dist/**",
        filesToDeleteAfterUpload: ["./dist/**/*.map"],
      },
      release: {
        name: process.env.VITE_SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
        deploy: {
          env: process.env.VITE_SENTRY_ENVIRONMENT || "production",
        },
      },
    })] : []),
    ...(process.env.ANALYZE ? [visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'], // Ensure React is deduplicated across chunks
  },
  build: {
    // Generate source maps for Sentry
    sourcemap: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Ensure React is available to dynamically imported modules
        // This helps libraries like react-joyride access React when dynamically imported
        format: 'es',
        manualChunks(id) {
          // Core React libraries + react-joyride (bundled together to ensure hook access)
          // Check for joyride with regex to catch any path format
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              /joyride/i.test(id)) {
            return 'vendor-react';
          }
          // Router
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor-router';
          }
          // i18n
          if (id.includes('node_modules/react-i18next') || id.includes('node_modules/i18next')) {
            return 'vendor-i18n';
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // UI libraries (shadcn, radix)
          if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/class-variance-authority')) {
            return 'vendor-ui';
          }
          // Charts and visualization
          if (id.includes('node_modules/recharts') || id.includes('node_modules/html2canvas')) {
            return 'vendor-charts';
          }
          // Rich text editor (TipTap)
          if (id.includes('node_modules/@tiptap') || id.includes('node_modules/prosemirror')) {
            return 'vendor-editor';
          }
          // Form libraries
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform') || id.includes('node_modules/zod')) {
            return 'vendor-forms';
          }
          // PDF generation
          if (id.includes('node_modules/jspdf')) {
            return 'vendor-pdf';
          }
          // Monitoring and error tracking
          if (id.includes('node_modules/@sentry')) {
            return 'vendor-sentry';
          }
          // Query/state management
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-query';
          }
          // CMS
          if (id.includes('node_modules/contentful')) {
            return 'vendor-cms';
          }
          // Icons
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // Crypto libraries
          if (id.includes('node_modules/crypto-js')) {
            return 'vendor-crypto';
          }
          // Other large vendors (explicitly exclude react-joyride)
          if (id.includes('node_modules/') && !/joyride/i.test(id)) {
            return 'vendor-misc';
          }
        },
        // Ensure consistent chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
}));
