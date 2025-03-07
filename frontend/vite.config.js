import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite acceder desde la red
    port: 5173, // Asegura que está en el puerto correcto
    strictPort: true,
  },
});
