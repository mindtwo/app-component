import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AppComponentPlugin from '@mindtwo/unplugin-app-component/vite';

export default defineConfig({
    clearScreen: false,
    logLevel: 'info',
    //
    plugins: [vue(), AppComponentPlugin()],
});
