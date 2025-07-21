import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    clearScreen: false, // 👈 prevents truncating logs
    logLevel: 'info', // 'error' hides too much, 'debug' is often too noisy
    //
    plugins: [vue()],
});
