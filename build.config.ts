import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
    // If entries is not provided, will be automatically inferred from package.json
    entries: [
        // default
        './src/index',
    ],
    clean: true,
    outDir: 'dist',
    declaration: true,
    rollup: {
        emitCJS: true,
        cjsBridge: true,
    },
    externals: ['vue'],
});
