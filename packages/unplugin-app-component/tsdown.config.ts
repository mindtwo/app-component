import { defineConfig } from 'tsdown';
import { copyFileSync } from 'node:fs';

export default defineConfig({
    entry: ['src/*.ts'],
    onSuccess() {
        copyFileSync('src/util/manifest-loader.template.js', 'dist/manifest-loader.template');
    },
});
