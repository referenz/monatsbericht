import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/monatsberichte/",
  plugins: [svelte()],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});
