import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command, mode }) => ({
  plugins: [
    react(),
    // PWA plugin for better offline support
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "icon-192x192.png", "icon-512x512.png"],
      manifest: {
        name: "GreenUpp - Smart Farming Platform",
        short_name: "GreenUpp",
        description: "AI-powered agricultural platform for Zambian farmers",
        theme_color: "#059669",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{css,html,ico,png,svg}"],
        // Increase the size limit for large assets
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        // Don't precache everything - use runtime caching instead
        globIgnores: [
          "**/EmojiOneColor*.woff2", // Skip large emoji fonts (3MB+)
          "**/NotoColorEmoji*.woff2", // Skip large fonts
        ],
        runtimeCaching: [
          // Cache JS chunks at runtime (not precache)
          {
            urlPattern: /^.*\/assets\/.*\.js$/,
            handler: "CacheFirst",
            options: {
              cacheName: "js-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache fonts at runtime
          {
            urlPattern: /^.*\/assets\/.*\.woff2$/,
            handler: "CacheFirst",
            options: {
              cacheName: "fonts-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
              },
            },
          },
          // External images
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          // API calls
          {
            urlPattern: /^\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
          // Cloudinary images
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "cloudinary-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
              },
            },
          },
        ],
      },
    }),
    // Add bundle visualizer in analyze mode
    mode === "analyze" &&
      visualizer({
        filename: "./dist/stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  envDir: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom", "wouter"],
          "radix-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
          ],
          "form-vendor": ["react-hook-form", "zod"],
          "chart-vendor": ["recharts"],
          "date-vendor": ["date-fns"],
          "map-vendor": ["leaflet", "react-leaflet"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "wouter"],
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to the Express server
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      // Proxy other server routes
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  // Remove server config since we're using middleware mode in Express
  // The server configuration is handled in server/vite.ts
}));
