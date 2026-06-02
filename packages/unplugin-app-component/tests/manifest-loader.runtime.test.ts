import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const TEMPLATE_PATH = resolve(
    __dirname,
    '../src/util/manifest-loader.template.js'
);

interface Loader {
    manifest: Record<string, any> | undefined;
    stylesheets: any[];
    resolveChunks: (entry: any, seen?: Set<string>) => any[];
}

function loadTemplate(): Loader {
    const source = readFileSync(TEMPLATE_PATH, 'utf8');

    const fakeDocument = {
        readyState: 'loading',
        head: { appendChild: () => {} },
        getElementById: () => null,
        createElement: () => ({}),
        addEventListener: () => {},
        dispatchEvent: () => {},
    };
    const fakeWindow: Record<string, any> = {
        location: { origin: 'http://localhost', href: 'http://localhost/' },
    };

    const context = vm.createContext({
        window: fakeWindow,
        document: fakeDocument,
        console,
        fetch: () => Promise.reject(new Error('fetch not used in this test')),
        URL,
        CustomEvent: class {},
    });

    vm.runInContext(source, context);

    return fakeWindow['__APP_COMPONENT_LOADER_NAME__'] as Loader;
}

describe('manifest-loader runtime: resolveChunks', () => {
    let loader: Loader;

    beforeEach(() => {
        loader = loadTemplate();
        loader.stylesheets = [];
    });

    it('resolves a flat Vite manifest into dependency-ordered chunks', () => {
        loader.manifest = {
            '_module-player-loader.js': {
                file: 'module-player-loader.js',
                src: '_module-player-loader.js',
            },
            '_ui-D7ywF_TU.js': {
                file: 'assets/ui-D7ywF_TU.js',
                name: 'ui',
                imports: ['_vue-CpOgIh3X.js'],
            },
            '_vue-CpOgIh3X.js': {
                file: 'assets/vue-CpOgIh3X.js',
                name: 'vue',
            },
            '_widgets-Fl_oeGcB.js': {
                file: 'assets/widgets-Fl_oeGcB.js',
                name: 'widgets',
                imports: ['_vue-CpOgIh3X.js'],
            },
            'src/main.js': {
                file: 'app-learning-module-player-DcyyDSvl.js',
                name: 'app-learning-module-player',
                src: 'src/main.js',
                isEntry: true,
                imports: [
                    '_vue-CpOgIh3X.js',
                    '_widgets-Fl_oeGcB.js',
                    '_ui-D7ywF_TU.js',
                ],
                css: ['assets/app-learning-module-player-DJLXdR8L.css'],
            },
        };

        const entry = loader.manifest['src/main.js'];
        const chunks = loader.resolveChunks(entry);

        expect(chunks.map((c) => c.file)).toEqual([
            'assets/vue-CpOgIh3X.js',
            'assets/widgets-Fl_oeGcB.js',
            'assets/ui-D7ywF_TU.js',
        ]);
    });

    it('dedupes shared dependencies via the seen set', () => {
        loader.manifest = {
            _shared: { file: 'assets/shared.js' },
            _a: { file: 'assets/a.js', imports: ['_shared'] },
            _b: { file: 'assets/b.js', imports: ['_shared'] },
            entry: {
                file: 'assets/entry.js',
                isEntry: true,
                imports: ['_a', '_b'],
            },
        };

        const chunks = loader.resolveChunks(loader.manifest.entry);

        expect(chunks.map((c) => c.file)).toEqual([
            'assets/shared.js',
            'assets/a.js',
            'assets/b.js',
        ]);
    });

    it('follows transitive imports depth-first', () => {
        loader.manifest = {
            _deep: { file: 'assets/deep.js' },
            _mid: { file: 'assets/mid.js', imports: ['_deep'] },
            _top: { file: 'assets/top.js', imports: ['_mid'] },
            entry: {
                file: 'assets/entry.js',
                isEntry: true,
                imports: ['_top'],
            },
        };

        const chunks = loader.resolveChunks(loader.manifest.entry);

        expect(chunks.map((c) => c.file)).toEqual([
            'assets/deep.js',
            'assets/mid.js',
            'assets/top.js',
        ]);
    });

    it('collects css from transitive chunks into stylesheets', () => {
        loader.manifest = {
            _withCss: {
                file: 'assets/with-css.js',
                css: ['assets/with-css.css'],
            },
            entry: {
                file: 'assets/entry.js',
                isEntry: true,
                imports: ['_withCss'],
            },
        };

        loader.resolveChunks(loader.manifest.entry);

        expect(loader.stylesheets).toEqual([
            { src: 'assets/with-css.css', file: 'assets/with-css.css' },
        ]);
    });

    it('skips unknown manifest keys without throwing', () => {
        loader.manifest = {
            _known: { file: 'assets/known.js' },
            entry: {
                file: 'assets/entry.js',
                isEntry: true,
                imports: ['_known', '_missing'],
            },
        };

        const chunks = loader.resolveChunks(loader.manifest.entry);

        expect(chunks.map((c) => c.file)).toEqual(['assets/known.js']);
    });

    it('returns an empty array when entry has no imports', () => {
        loader.manifest = {
            entry: { file: 'assets/entry.js', isEntry: true },
        };

        expect(loader.resolveChunks(loader.manifest.entry)).toEqual([]);
    });
});
