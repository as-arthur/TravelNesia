import { defineConfig } from 'vite';

export default defineConfig({
  // host: true -> dev server bisa dibuka dari HP / tablet di jaringan Wi-Fi yang sama
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 }
});
