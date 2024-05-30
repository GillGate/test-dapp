import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: "DAPP",
  base: '/test-dapp/',
  server: {
    open: true,
  },
  plugins: [
    vue(),
    nodePolyfills(),
  ],
})
