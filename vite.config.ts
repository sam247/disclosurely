import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: process.env.CI ? "127.0.0.1" : "::", // Use localhost in CI for better compatibility
    port: 8080,
    strictPort: true, // Fail if port is already in use
    historyApiFallback: true, // Enable client-side routing support
    // In CI, reduce HMR overhead
    hmr: process.env.CI ? false : undefined,
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
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Generate source maps for Sentry
    sourcemap: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'i18n': ['react-i18next', 'i18next'],
        },
        // Ensure consistent chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      // Externalize OpenRedact - it's Node.js only and used server-side
      external: ['@openredaction/openredact'],
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
}));
